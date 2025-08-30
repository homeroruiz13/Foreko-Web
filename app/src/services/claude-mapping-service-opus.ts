// app/src/services/claude-mapping-service-opus.ts
// Service configured to use ONLY Opus models for maximum accuracy

import Anthropic from '@anthropic-ai/sdk';
import { sql } from '@/lib/db';

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
}

export class ClaudeMappingServiceOpus {
  private anthropic: Anthropic;
  private standardFields: Map<string, any[]> = new Map();
  
  // OPUS MODELS ONLY - Request access from Anthropic if needed
  // Latest Opus models (you need to request access from Anthropic):
  private readonly OPUS_4_1_MODEL = 'claude-3-opus-latest'; // Try latest first
  private readonly OPUS_4_1_SPECIFIC = 'claude-3-opus@20240229'; // Alternative format
  private readonly OPUS_BEDROCK = 'anthropic.claude-3-opus-20240229-v1:0'; // AWS Bedrock format
  
  // Pricing for Opus
  private readonly OPUS_INPUT_COST = 0.015; // $15 per million tokens
  private readonly OPUS_OUTPUT_COST = 0.075; // $75 per million tokens
  
  private readonly MIN_CONFIDENCE_THRESHOLD = 0.7;
  private currentModel: string;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY!,
    });
    
    // Default to trying the latest Opus
    this.currentModel = this.OPUS_4_1_MODEL;
    
    console.log('🧠 Claude Mapping Service initialized with OPUS ONLY mode');
    console.log('💎 Attempting to use Opus model for maximum accuracy');
    console.log('📧 If you get 404 errors, contact Anthropic for Opus access');
  }

  /**
   * Test Opus availability and find working model
   */
  async testOpusAvailability(): Promise<{ available: boolean; model?: string; error?: string }> {
    const modelsToTry = [
      this.OPUS_4_1_MODEL,
      this.OPUS_4_1_SPECIFIC,
      'claude-3-opus-20240229', // Original format
      'claude-3-opus', // Simplified
    ];
    
    for (const model of modelsToTry) {
      try {
        console.log(`🔍 Testing Opus model: ${model}...`);
        
        const response = await this.anthropic.messages.create({
          model: model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }],
        });
        
        if (response) {
          console.log(`✅ Opus model ${model} is available!`);
          this.currentModel = model;
          return { available: true, model };
        }
      } catch (error: any) {
        console.log(`❌ Model ${model} not available: ${error.message}`);
        continue;
      }
    }
    
    return { 
      available: false, 
      error: 'No Opus models available. Please contact Anthropic for access to claude-3-opus models.' 
    };
  }

  /**
   * Detect entity type using Opus
   */
  async detectEntityType(
    columns: ColumnInfo[],
    fileName: string,
    companyContext?: any
  ): Promise<any> {
    console.log('🔍 Detecting entity type with Opus for maximum accuracy...');
    
    const prompt = `You are an expert data analyst using Opus's advanced capabilities to understand complex business data.
    
Analyze the provided columns and sample data to determine the entity type with high precision.
Consider all nuances, patterns, and business logic indicators.

File Name: ${fileName}
Columns: ${JSON.stringify(columns, null, 2)}
${companyContext ? `Company Context: ${JSON.stringify(companyContext)}` : ''}

Available entity types:
- inventory (stock levels, item quantities, warehouse data)
- ingredients (raw materials, components, recipes)
- recipes (recipe items, modifiers, portions)
- menu_items (products, dishes, menu offerings)
- orders (sales orders, purchase orders, transactions)
- suppliers (vendor information, procurement)
- customers (client information, loyalty)
- financial (transactions, accounting, payments)
- logistics (shipping, deliveries, tracking)

Provide deep analysis and return JSON:
{
  "entityType": "detected_type",
  "confidence": 0.95,
  "reasoning": "Detailed explanation with evidence",
  "secondaryTypes": ["other possible types"],
  "dataQualityNotes": "Any observations about data quality",
  "businessLogicDetected": "Any business rules or patterns found"
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: this.currentModel,
        max_tokens: 1000,
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const result = this.extractJSON(content.text);
        console.log(`✅ Opus detected: ${result.entityType} (${(result.confidence * 100).toFixed(0)}% confidence)`);
        return result;
      }
    } catch (error: any) {
      console.error('❌ Opus entity detection failed:', error.message);
      
      if (error.status === 404) {
        console.error(`
⚠️  OPUS MODEL NOT AVAILABLE
====================================
The Opus model (${this.currentModel}) is not accessible.

To use Opus, you need to:
1. Contact Anthropic sales for Opus access
2. Request access to: claude-3-opus models
3. Once approved, update the model name in this service

For now, you can use claude-3-5-sonnet-latest as a fallback.
====================================
        `);
      }
      
      throw error;
    }
    
    return {
      entityType: 'inventory',
      confidence: 0,
      reasoning: 'Failed to detect with Opus',
    };
  }

  /**
   * Suggest column mappings using Opus's superior understanding
   */
  async suggestColumnMappings(
    columns: ColumnInfo[],
    entityType: string,
    companyId: string,
    fileUploadId?: string
  ): Promise<MappingSuggestion[]> {
    console.log('🗺️ Generating column mappings with Opus for complex analysis...');
    
    await this.loadAllStandardFields();
    const previousMappings = await this.getPreviousMappings(companyId, entityType);
    
    const prompt = `You are an expert data integration specialist using Opus's advanced reasoning capabilities.
    
Your task is to map source columns to standard fields with exceptional accuracy.
Use deep pattern recognition, consider business context, and detect complex relationships.

Source Columns with Sample Data:
${JSON.stringify(columns, null, 2)}

Available Standard Fields (All Domains):
${JSON.stringify(Array.from(this.standardFields.values()).flat(), null, 2)}

Historical Successful Mappings (Learn from these):
${JSON.stringify(previousMappings, null, 2)}

OPUS-LEVEL ANALYSIS REQUIREMENTS:
1. Deep semantic understanding of column names and data
2. Detect implicit business rules and calculated fields
3. Identify cross-domain relationships
4. Recognize industry-specific patterns and abbreviations
5. Handle ambiguous and poorly structured data
6. Provide confidence scores with detailed justification

Return comprehensive JSON:
{
  "mappings": [
    {
      "sourceColumn": "column_name",
      "targetField": "standard_field_name",
      "confidence": 0.95,
      "dataType": "detected_type",
      "reasoning": "Detailed explanation of mapping logic",
      "transformation": "Required data transformation if any",
      "businessLogic": "Detected business rules",
      "dependencies": ["columns this depends on"],
      "qualityIssues": ["detected data quality problems"],
      "alternativeSuggestions": [
        {"field": "alternative_field", "confidence": 0.7, "reason": "why this could work"}
      ]
    }
  ],
  "unmappedColumns": [
    {
      "column": "column_name",
      "reason": "Why it couldn't be mapped",
      "suggestion": "Recommended action"
    }
  ],
  "detectedPatterns": {
    "namingConvention": "detected naming pattern",
    "dataEncoding": "any encoding detected",
    "businessRules": ["list of business rules found"],
    "relationships": ["detected relationships between fields"]
  },
  "confidenceSummary": {
    "average": 0.92,
    "highConfidenceCount": 8,
    "lowConfidenceCount": 2,
    "requiresManualReview": ["columns needing review"]
  },
  "executiveInsight": "High-level summary of the mapping quality and any concerns"
}`;

    try {
      const startTime = Date.now();
      
      const response = await this.anthropic.messages.create({
        model: this.currentModel,
        max_tokens: 4000,
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const result = this.extractJSON(content.text);
        const elapsedTime = Date.now() - startTime;
        
        // Calculate cost
        const inputTokens = prompt.length / 4;
        const outputTokens = content.text.length / 4;
        const cost = (inputTokens / 1000) * this.OPUS_INPUT_COST + 
                    (outputTokens / 1000) * this.OPUS_OUTPUT_COST;
        
        console.log(`✅ Opus mapped ${result.mappings?.length || 0} columns in ${elapsedTime}ms`);
        console.log(`💰 Opus cost: $${cost.toFixed(4)}`);
        console.log(`📊 Average confidence: ${((result.confidenceSummary?.average || 0) * 100).toFixed(1)}%`);
        
        if (result.executiveInsight) {
          console.log(`💡 Insight: ${result.executiveInsight}`);
        }
        
        // Store high-quality mappings for learning
        if (fileUploadId && result.mappings) {
          await this.storeOpusMappings(fileUploadId, result.mappings);
        }
        
        return result.mappings || [];
      }
    } catch (error: any) {
      console.error('❌ Opus mapping failed:', error.message);
      
      if (error.status === 404) {
        console.error('⚠️ Opus model not available. Contact Anthropic for access.');
      }
      
      throw error;
    }
    
    return [];
  }

  /**
   * Store Opus mappings for learning
   */
  private async storeOpusMappings(fileUploadId: string, mappings: any[]): Promise<void> {
    for (const mapping of mappings) {
      if (mapping.confidence >= 0.85) {
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
              model_used
            ) VALUES (
              ${fileUploadId},
              ${mapping.sourceColumn},
              ${mapping.targetField},
              ${mapping.confidence},
              ${mapping.reasoning},
              ${JSON.stringify(mapping.alternativeSuggestions || [])},
              ${mapping.dataType || 'text'},
              'opus'
            )
          `;
        } catch (error) {
          console.error('Error storing Opus mapping:', error);
        }
      }
    }
  }

  /**
   * Get Opus status and availability
   */
  async getOpusStatus(): Promise<{
    available: boolean;
    model: string;
    pricing: any;
    recommendation: string;
  }> {
    const availability = await this.testOpusAvailability();
    
    return {
      available: availability.available,
      model: availability.model || 'Not available',
      pricing: {
        input: `$${this.OPUS_INPUT_COST} per 1K tokens`,
        output: `$${this.OPUS_OUTPUT_COST} per 1K tokens`,
        estimatedPerFile: '$0.08 - $0.15',
      },
      recommendation: availability.available 
        ? 'Opus is available and recommended for complex data mapping'
        : 'Opus is not available. Contact Anthropic sales to request access to claude-3-opus models.',
    };
  }

  // Helper methods
  
  private extractJSON(text: string): any {
    try {
      return JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      }
      
      throw new Error('No valid JSON found in Opus response');
    }
  }

  private async loadAllStandardFields(): Promise<void> {
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
      
      for (const field of fields) {
        const domain = field.domain || 'other';
        if (!this.standardFields.has(domain)) {
          this.standardFields.set(domain, []);
        }
        this.standardFields.get(domain)!.push(field);
      }
    }
  }

  private async getPreviousMappings(companyId: string, entityType: string): Promise<any[]> {
    const mappings = await sql`
      SELECT 
        source_column_name,
        target_standard_field,
        success_rate,
        usage_frequency
      FROM data_ingestion.ai_learning_data
      WHERE 
        (company_id = ${companyId} OR is_global_learning = true)
        AND entity_type = ${entityType}
        AND success_rate > 0.8
      ORDER BY success_rate DESC
      LIMIT 30
    `;
    
    return mappings;
  }
}

export default ClaudeMappingServiceOpus;