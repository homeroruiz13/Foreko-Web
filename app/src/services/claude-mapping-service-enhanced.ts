// app/src/services/claude-mapping-service-enhanced.ts
import Anthropic from '@anthropic-ai/sdk';
import { sql } from '@/lib/db';
import { IntelligentModelRouter } from './intelligent-router';
import { OpusConfig } from '@/config/opus-config';

interface ColumnInfo {
  columnName: string;
  dataType: string;
  sampleValues: string[];
  nullPercentage: number;
  uniquePercentage: number;
}

interface MappingSuggestion {
  sourceColumn: string;
  targetField: string;
  confidence: number;
  reasoning: string;
  alternativeSuggestions?: { field: string; confidence: number }[];
  requiresManualReview?: boolean;
  wasEnhanced?: boolean;
  originalConfidence?: number;
  improvementReason?: string;
  targetDomain?: string;
  modelUsed?: 'opus' | 'sonnet';
}

interface EntityDetection {
  entityType: string;
  confidence: number;
  reasoning: string;
  targetDashboards?: string[];
}

export class ClaudeMappingServiceEnhanced {
  private anthropic: Anthropic;
  private intelligentRouter: IntelligentModelRouter;
  private standardFields: Map<string, any[]> = new Map();
  
  // Models
  private readonly OPUS_MODEL = OpusConfig.OPUS_MODEL;
  private readonly SONNET_MODEL = OpusConfig.SONNET_MODEL;
  private readonly MIN_CONFIDENCE_THRESHOLD = 0.7;
  
  constructor(apiKey: string) {
    this.anthropic = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY!,
    });
    this.intelligentRouter = new IntelligentModelRouter(apiKey);
  }

  /**
   * Main entry point for column mapping with intelligent routing
   */
  async suggestColumnMappings(
    columns: ColumnInfo[],
    entityType: string,
    companyId: string,
    fileUploadId?: string,
    fileName?: string,
    forceOpus?: boolean
  ): Promise<MappingSuggestion[]> {
    // Load all standard fields
    await this.loadAllStandardFields();
    
    // Get sample data for analysis
    const sampleData = await this.getSampleData(fileUploadId);
    
    // Use intelligent router to determine model and get mappings
    const result = await this.intelligentRouter.routeMappingRequest({
      columns,
      sampleData,
      fileName: fileName || 'unknown',
      companyId,
      fileUploadId,
      entityType,
      forceOpus,
    });
    
    // Process and enhance the mappings
    const enhancedMappings = await this.enhanceMappings(
      result.mappings,
      result.model,
      companyId,
      fileUploadId
    );
    
    // Store mapping results for analysis
    if (fileUploadId) {
      await this.storeMappingResults(
        fileUploadId,
        enhancedMappings,
        result.model,
        result.cost,
        result.confidence
      );
    }
    
    return enhancedMappings;
  }

  /**
   * Detect entity type with potential multi-dashboard assignment
   */
  async detectEntityType(
    columns: ColumnInfo[],
    fileName: string,
    companyContext?: any
  ): Promise<EntityDetection> {
    const prompt = `
You are a data mapping expert for a restaurant/food service management system. 
Analyze these columns and determine what type of data entity this represents.
IMPORTANT: One file can contain data for multiple dashboards.

File Name: ${fileName}
Columns: ${JSON.stringify(columns, null, 2)}
${companyContext ? `Company Context: ${JSON.stringify(companyContext)}` : ''}

Available entity types and their dashboards:
- inventory (inventory dashboard - stock levels, item quantities)
- ingredients (inventory dashboard - raw materials, components)
- recipes (inventory dashboard - recipe items, modifiers)
- menu_items (inventory dashboard - products, dishes)
- orders (orders dashboard - sales orders, purchase orders)
- suppliers (suppliers dashboard - vendor information)
- customers (customers dashboard - client information)
- financial (financial dashboard - transactions, accounting)
- logistics (logistics dashboard - shipping, deliveries)

Respond in JSON format:
{
  "entityType": "primary_entity_type",
  "confidence": 0.95,
  "reasoning": "Explanation of why this entity type was chosen",
  "targetDashboards": ["inventory", "orders"],
  "secondaryEntities": ["other detected entity types if any"]
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: this.SONNET_MODEL,
        max_tokens: 500,
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const result = this.extractJSON(content.text);
        return result;
      }
    } catch (error) {
      console.error('Entity detection error:', error);
    }
    
    return {
      entityType: 'inventory',
      confidence: 0,
      reasoning: 'Failed to detect entity type',
      targetDashboards: ['inventory'],
    };
  }

  /**
   * Process data into standardized records for the processed_records table
   */
  async processToStandardizedRecords(
    rawData: any[],
    mappings: MappingSuggestion[],
    fileUploadId: string,
    companyId: string,
    entityType: string
  ): Promise<any[]> {
    const processedRecords = [];
    
    for (const row of rawData) {
      const standardizedData: any = {};
      const targetDashboards = new Set<string>();
      
      // Apply mappings to create standardized record
      for (const mapping of mappings) {
        if (row[mapping.sourceColumn] !== undefined) {
          standardizedData[mapping.targetField] = row[mapping.sourceColumn];
          
          // Determine target dashboard based on field domain
          if (mapping.targetDomain) {
            targetDashboards.add(this.getDashboardForDomain(mapping.targetDomain));
          }
        }
      }
      
      // Create processed record
      const processedRecord = {
        file_upload_id: fileUploadId,
        company_id: companyId,
        entity_type: entityType,
        original_data: JSON.stringify(row),
        standardized_data: JSON.stringify(standardizedData),
        target_dashboards: Array.from(targetDashboards),
        confidence_score: this.calculateRecordConfidence(mappings),
        validation_status: 'pending',
        processing_timestamp: new Date(),
      };
      
      processedRecords.push(processedRecord);
    }
    
    // Store in processed_records table
    await this.storeProcessedRecords(processedRecords);
    
    return processedRecords;
  }

  /**
   * Validate and transform data using appropriate model
   */
  async validateAndTransformData(
    rawData: any[],
    mappings: MappingSuggestion[],
    entityType: string,
    companyId: string,
    useOpus: boolean = false
  ): Promise<{ valid: any[]; errors: any[] }> {
    const result = await this.intelligentRouter.validateData(
      rawData,
      mappings,
      entityType,
      companyId,
      useOpus
    );
    
    // Process validation results
    const valid: any[] = [];
    const errors: any[] = [];
    
    if (result.validationStatus === 'passed' || result.validationStatus === 'passed_with_warnings') {
      // Apply transformations if needed
      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        const transformedRow = await this.applyTransformations(row, result.transformationRequired || []);
        
        if (this.isValidRecord(transformedRow, result.integrityChecks || [])) {
          valid.push(transformedRow);
        } else {
          errors.push({
            rowNumber: i,
            originalData: row,
            issues: this.getRecordIssues(transformedRow, result.integrityChecks || []),
          });
        }
      }
    }
    
    return { valid, errors };
  }

  // Helper methods

  private async loadAllStandardFields() {
    if (this.standardFields.size === 0) {
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
      
      // Group by domain
      for (const field of fields) {
        const domain = field.domain || 'other';
        if (!this.standardFields.has(domain)) {
          this.standardFields.set(domain, []);
        }
        this.standardFields.get(domain)!.push(field);
      }
    }
  }

  private async getSampleData(fileUploadId?: string): Promise<any[]> {
    if (!fileUploadId) return [];
    
    try {
      const data = await sql`
        SELECT sample_data
        FROM data_ingestion.raw_data_storage
        WHERE file_upload_id = ${fileUploadId}
        LIMIT 1
      `;
      
      return data.length > 0 ? (data[0].sample_data || []) : [];
    } catch {
      return [];
    }
  }

  private async enhanceMappings(
    mappings: any[],
    model: 'opus' | 'sonnet',
    companyId: string,
    fileUploadId?: string
  ): Promise<MappingSuggestion[]> {
    const enhanced = mappings.map(mapping => ({
      ...mapping,
      modelUsed: model,
      confidence: typeof mapping.confidence === 'number' && mapping.confidence > 1 
        ? mapping.confidence / 100 
        : mapping.confidence,
      requiresManualReview: mapping.confidence < this.MIN_CONFIDENCE_THRESHOLD,
    }));
    
    // Learn from high-confidence mappings
    if (OpusConfig.ENABLE_LEARNING_MODE) {
      await this.updateLearningData(enhanced, companyId);
    }
    
    return enhanced;
  }

  private getDashboardForDomain(domain: string): string {
    const domainToDashboard: { [key: string]: string } = {
      'inventory': 'inventory',
      'ingredients': 'inventory',
      'recipes': 'inventory',
      'menu_items': 'inventory',
      'orders': 'orders',
      'suppliers': 'suppliers',
      'customers': 'customers',
      'financial': 'financial',
      'logistics': 'logistics',
    };
    
    return domainToDashboard[domain] || 'inventory';
  }

  private calculateRecordConfidence(mappings: MappingSuggestion[]): number {
    if (mappings.length === 0) return 0;
    
    const totalConfidence = mappings.reduce((sum, m) => sum + (m.confidence || 0), 0);
    return totalConfidence / mappings.length;
  }

  private async storeProcessedRecords(records: any[]): Promise<void> {
    for (const record of records) {
      try {
        await sql`
          INSERT INTO data_ingestion.processed_records (
            file_upload_id,
            company_id,
            entity_type,
            original_data,
            standardized_data,
            target_dashboards,
            confidence_score,
            validation_status,
            processing_timestamp
          ) VALUES (
            ${record.file_upload_id},
            ${record.company_id},
            ${record.entity_type},
            ${record.original_data}::jsonb,
            ${record.standardized_data}::jsonb,
            ${record.target_dashboards},
            ${record.confidence_score},
            ${record.validation_status},
            ${record.processing_timestamp}
          )
        `;
      } catch (error) {
        console.error('Error storing processed record:', error);
      }
    }
  }

  private async storeMappingResults(
    fileUploadId: string,
    mappings: MappingSuggestion[],
    model: 'opus' | 'sonnet',
    cost?: number,
    confidence?: number
  ): Promise<void> {
    try {
      await sql`
        INSERT INTO data_ingestion.mapping_results (
          file_upload_id,
          model_used,
          mappings,
          average_confidence,
          api_cost,
          created_at
        ) VALUES (
          ${fileUploadId},
          ${model},
          ${JSON.stringify(mappings)},
          ${confidence || 0},
          ${cost || 0},
          NOW()
        )
      `;
    } catch (error) {
      console.error('Error storing mapping results:', error);
    }
  }

  private async updateLearningData(
    mappings: MappingSuggestion[],
    companyId: string
  ): Promise<void> {
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
            model_used
          ) VALUES (
            ${companyId},
            ${mapping.targetDomain || 'unknown'},
            ${mapping.sourceColumn},
            ${mapping.targetField},
            ${mapping.confidence},
            1,
            ${mapping.confidence},
            ${mapping.modelUsed || 'sonnet'}
          )
          ON CONFLICT (company_id, entity_type, source_column_name, target_standard_field)
          DO UPDATE SET
            usage_frequency = ai_learning_data.usage_frequency + 1,
            confidence_score = (ai_learning_data.confidence_score + ${mapping.confidence}) / 2,
            updated_at = NOW()
        `;
      } catch (error) {
        console.error('Error updating learning data:', error);
      }
    }
  }

  private async applyTransformations(row: any, transformations: any[]): Promise<any> {
    const transformed = { ...row };
    
    for (const transform of transformations) {
      if (transformed[transform.field] !== undefined) {
        // Apply transformation based on type
        transformed[transform.field] = this.applyTransformation(
          transformed[transform.field],
          transform.transformation
        );
      }
    }
    
    return transformed;
  }

  private applyTransformation(value: any, transformation: string): any {
    // Implement transformation logic
    switch (transformation) {
      case 'uppercase':
        return String(value).toUpperCase();
      case 'lowercase':
        return String(value).toLowerCase();
      case 'trim':
        return String(value).trim();
      case 'number':
        return parseFloat(value) || 0;
      default:
        return value;
    }
  }

  private isValidRecord(record: any, integrityChecks: any[]): boolean {
    for (const check of integrityChecks) {
      if (check.status === 'failed' && check.severity === 'critical') {
        return false;
      }
    }
    return true;
  }

  private getRecordIssues(record: any, integrityChecks: any[]): any[] {
    return integrityChecks
      .filter(check => check.status === 'failed' || check.status === 'warning')
      .map(check => ({
        field: check.field,
        issue: check.details,
        severity: check.severity,
      }));
  }

  private extractJSON(text: string): any {
    try {
      return JSON.parse(text);
    } catch {
      // Try extracting from code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // Try extracting raw JSON
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      }
      
      throw new Error('No valid JSON found');
    }
  }
}

export default ClaudeMappingServiceEnhanced;