// app/src/services/intelligent-router.ts
import { OpusDataIngestionClient } from './opus-client';
import { ComplexityAnalyzer, FileComplexityData } from './complexity-analyzer';
import { OpusPromptBuilder } from './opus-prompts';
import { OpusConfig } from '@/config/opus-config';
import { ClaudeMappingService } from './claude-mapping-service';
import { sql } from '@/lib/db';

export interface RoutingDecision {
  useOpus: boolean;
  reason: string;
  complexityScore: number;
  estimatedCost?: number;
}

export interface MappingResult {
  mappings: any[];
  confidence: number;
  model: 'opus' | 'sonnet';
  cost?: number;
  processingTime?: number;
  complexityReport?: any;
}

export class IntelligentModelRouter {
  private opusClient: OpusDataIngestionClient;
  private sonnetService: ClaudeMappingService;
  private complexityAnalyzer: ComplexityAnalyzer;
  
  constructor(apiKey: string) {
    this.opusClient = new OpusDataIngestionClient();
    this.sonnetService = new ClaudeMappingService(apiKey);
    this.complexityAnalyzer = new ComplexityAnalyzer();
  }
  
  /**
   * Determine if Opus is needed based on file complexity
   */
  async shouldUseOpus(fileData: FileComplexityData, forceOpus: boolean = false): Promise<RoutingDecision> {
    // Force Opus if requested
    if (forceOpus) {
      return {
        useOpus: true,
        reason: 'Opus usage forced by user request',
        complexityScore: 5,
      };
    }
    
    // Check if Opus routing is enabled
    if (!OpusConfig.ENABLE_OPUS_ROUTING) {
      return {
        useOpus: false,
        reason: 'Opus routing is disabled in configuration',
        complexityScore: 0,
      };
    }
    
    // Analyze complexity
    const complexityReport = this.complexityAnalyzer.analyze(fileData);
    
    // Decision criteria
    const useOpus = 
      complexityReport.score >= OpusConfig.OPUS_COMPLEXITY_THRESHOLD ||
      complexityReport.hasNestedRelationships ||
      complexityReport.ambiguityLevel === 'high' ||
      complexityReport.businessLogicDetected ||
      complexityReport.dataQualityScore < 0.5;
    
    // Estimate cost if using Opus
    let estimatedCost;
    if (useOpus) {
      const estimatedTokens = this.estimateTokens(fileData);
      estimatedCost = this.calculateEstimatedCost(estimatedTokens);
    }
    
    return {
      useOpus,
      reason: complexityReport.reasons.join('; '),
      complexityScore: complexityReport.score,
      estimatedCost,
    };
  }
  
  /**
   * Route mapping request to appropriate model
   */
  async routeMappingRequest(
    fileData: {
      columns: any[];
      sampleData: any[];
      fileName: string;
      companyId: string;
      fileUploadId?: string;
      entityType?: string;
      forceOpus?: boolean;
    }
  ): Promise<MappingResult> {
    const complexityData: FileComplexityData = {
      columns: fileData.columns,
      rowCount: fileData.sampleData.length,
      fileName: fileData.fileName,
    };
    
    // Determine routing
    const routingDecision = await this.shouldUseOpus(complexityData, fileData.forceOpus);
    
    // Log routing decision
    await this.logRoutingDecision(fileData.fileUploadId || '', routingDecision);
    
    if (routingDecision.useOpus) {
      console.log(`Routing to Opus (complexity: ${routingDecision.complexityScore.toFixed(2)})`);
      return await this.processWithOpus(fileData, routingDecision);
    } else {
      console.log(`Routing to Sonnet (complexity: ${routingDecision.complexityScore.toFixed(2)})`);
      const result = await this.processWithSonnet(fileData);
      
      // Check if we need to escalate to Opus based on confidence
      if (OpusConfig.AUTO_ESCALATE_TO_OPUS && result.confidence < OpusConfig.OPUS_CONFIDENCE_THRESHOLD) {
        console.log(`Escalating to Opus due to low confidence: ${result.confidence.toFixed(2)}`);
        return await this.processWithOpus(fileData, {
          ...routingDecision,
          useOpus: true,
          reason: `Escalated from Sonnet due to low confidence (${result.confidence.toFixed(2)})`,
        });
      }
      
      return result;
    }
  }
  
  /**
   * Process file with Opus for complex scenarios
   */
  private async processWithOpus(
    fileData: any,
    routingDecision: RoutingDecision
  ): Promise<MappingResult> {
    try {
      // Load standard fields
      const standardFields = await this.loadStandardFields();
      
      // Get historical patterns
      const historicalPatterns = await this.getHistoricalPatterns(fileData.companyId);
      
      // Build Opus prompt
      const prompt = OpusPromptBuilder.buildComplexMappingPrompt(
        fileData.columns,
        fileData.sampleData,
        standardFields,
        {
          companyType: 'Restaurant/Food Service',
          industry: 'Food & Beverage',
          historicalPatterns,
          fileName: fileData.fileName,
          detectedEntityType: fileData.entityType,
        }
      );
      
      // Call Opus
      const startTime = Date.now();
      const opusResponse = await this.opusClient.callOpus(prompt);
      const processingTime = (Date.now() - startTime) / 1000;
      
      // Process Opus response
      const result = opusResponse.result;
      
      // Store AI suggestions if we have a file upload ID
      if (fileData.fileUploadId && result.mappings) {
        await this.storeOpusMappings(fileData.fileUploadId, result.mappings, opusResponse.metadata);
      }
      
      // Store learning data for high-confidence mappings
      if (result.mappings) {
        await this.storeOpusLearningData(fileData.companyId, fileData.entityType || 'unknown', result.mappings);
      }
      
      // Calculate average confidence
      const avgConfidence = result.mappings
        ? result.mappings.reduce((sum: number, m: any) => sum + (m.confidence || 0), 0) / result.mappings.length
        : 0;
      
      return {
        mappings: result.mappings || [],
        confidence: avgConfidence,
        model: 'opus',
        cost: opusResponse.metadata.cost,
        processingTime,
        complexityReport: {
          score: routingDecision.complexityScore,
          reason: routingDecision.reason,
          ...result.qualitySummary,
        },
      };
      
    } catch (error) {
      console.error('Opus processing failed:', error);
      // Fallback to Sonnet
      console.log('Falling back to Sonnet due to Opus error');
      return await this.processWithSonnet(fileData);
    }
  }
  
  /**
   * Process file with Sonnet for standard scenarios
   */
  private async processWithSonnet(fileData: any): Promise<MappingResult> {
    const startTime = Date.now();
    
    // Use existing Claude mapping service
    const mappings = await this.sonnetService.suggestColumnMappings(
      fileData.columns,
      fileData.entityType || 'inventory',
      fileData.companyId,
      fileData.fileUploadId
    );
    
    const processingTime = (Date.now() - startTime) / 1000;
    
    // Calculate average confidence
    const avgConfidence = mappings.length > 0
      ? mappings.reduce((sum, m) => sum + (m.confidence || 0), 0) / mappings.length / 100
      : 0;
    
    return {
      mappings,
      confidence: avgConfidence,
      model: 'sonnet',
      processingTime,
    };
  }
  
  /**
   * Validate data using appropriate model
   */
  async validateData(
    data: any[],
    mappedFields: any,
    entityType: string,
    companyId: string,
    useOpus: boolean = false
  ): Promise<any> {
    if (useOpus) {
      const prompt = OpusPromptBuilder.buildValidationPrompt(
        data,
        mappedFields,
        {
          entityType,
          companyId,
          industry: 'Food & Beverage',
        }
      );
      
      const response = await this.opusClient.callOpus(prompt);
      return response.result;
    } else {
      // Use Sonnet for validation
      return await this.sonnetService.validateAndTransformData(
        data,
        mappedFields,
        entityType
      );
    }
  }
  
  // Helper methods
  
  private estimateTokens(fileData: FileComplexityData): number {
    // Rough estimation based on data size
    const columnTokens = fileData.columns.length * 50;
    const sampleDataTokens = Math.min(fileData.rowCount, 20) * fileData.columns.length * 20;
    const promptOverhead = 2000;
    
    return columnTokens + sampleDataTokens + promptOverhead;
  }
  
  private calculateEstimatedCost(tokens: number): number {
    const inputCost = (tokens / 1000) * OpusConfig.OPUS_COST_PER_1K_INPUT;
    const estimatedOutputTokens = tokens * 0.5; // Estimate output as 50% of input
    const outputCost = (estimatedOutputTokens / 1000) * OpusConfig.OPUS_COST_PER_1K_OUTPUT;
    
    return inputCost + outputCost;
  }
  
  private async loadStandardFields(): Promise<any[]> {
    const fields = await sql`
      SELECT 
        field_name,
        display_name,
        data_type,
        is_required,
        domain,
        common_aliases,
        example_values
      FROM data_ingestion.standard_field_definitions
      ORDER BY domain, field_name
    `;
    
    return fields;
  }
  
  private async getHistoricalPatterns(companyId: string): Promise<any[]> {
    const patterns = await sql`
      SELECT 
        source_column_name,
        target_standard_field,
        entity_type,
        success_rate,
        usage_frequency
      FROM data_ingestion.ai_learning_data
      WHERE 
        (company_id = ${companyId} OR is_global_learning = true)
        AND success_rate > 0.8
      ORDER BY success_rate DESC, usage_frequency DESC
      LIMIT 100
    `;
    
    return patterns;
  }
  
  private async logRoutingDecision(
    fileUploadId: string,
    decision: RoutingDecision
  ): Promise<void> {
    if (!fileUploadId) return;
    
    try {
      await sql`
        INSERT INTO data_ingestion.model_routing_logs (
          file_upload_id,
          model_selected,
          complexity_score,
          routing_reason,
          estimated_cost,
          created_at
        ) VALUES (
          ${fileUploadId},
          ${decision.useOpus ? 'opus' : 'sonnet'},
          ${decision.complexityScore},
          ${decision.reason},
          ${decision.estimatedCost || 0},
          NOW()
        )
      `;
    } catch (error) {
      console.error('Error logging routing decision:', error);
    }
  }
  
  private async storeOpusMappings(
    fileUploadId: string,
    mappings: any[],
    metadata: any
  ): Promise<void> {
    for (const mapping of mappings) {
      try {
        await sql`
          INSERT INTO data_ingestion.ai_column_detection (
            file_upload_id,
            detected_column_name,
            suggested_standard_field,
            confidence_score,
            suggestion_reasoning,
            alternative_suggestions,
            data_type_detected,
            model_used,
            api_cost
          ) VALUES (
            ${fileUploadId},
            ${mapping.sourceColumn},
            ${mapping.targetField},
            ${mapping.confidence},
            ${mapping.reasoning},
            ${JSON.stringify(mapping.alternativeSuggestions || [])},
            ${mapping.dataType || 'text'},
            'opus',
            ${metadata.cost || 0}
          )
        `;
      } catch (error) {
        console.error('Error storing Opus mapping:', error);
      }
    }
  }
  
  private async storeOpusLearningData(
    companyId: string,
    entityType: string,
    mappings: any[]
  ): Promise<void> {
    // Only store high-confidence mappings
    const highConfidenceMappings = mappings.filter(m => m.confidence >= 0.85);
    
    for (const mapping of highConfidenceMappings) {
      try {
        await sql`
          INSERT INTO data_ingestion.ai_learning_data (
            company_id,
            entity_type,
            source_column_name,
            target_standard_field,
            confidence_score,
            usage_frequency,
            success_rate,
            is_global_learning,
            model_used
          ) VALUES (
            ${companyId},
            ${entityType},
            ${mapping.sourceColumn},
            ${mapping.targetField},
            ${mapping.confidence},
            1,
            ${mapping.confidence},
            ${mapping.confidence >= 0.95},
            'opus'
          )
          ON CONFLICT (company_id, entity_type, source_column_name, target_standard_field)
          DO UPDATE SET
            usage_frequency = ai_learning_data.usage_frequency + 1,
            confidence_score = (ai_learning_data.confidence_score + ${mapping.confidence}) / 2,
            model_used = 'opus',
            updated_at = NOW()
        `;
      } catch (error) {
        console.error('Error storing Opus learning data:', error);
      }
    }
  }
}