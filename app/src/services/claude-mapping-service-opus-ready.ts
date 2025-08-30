// app/src/services/claude-mapping-service-opus-ready.ts
// Service configured to use Opus when available, with intelligent fallback

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
  modelUsed?: string;
}

export class ClaudeMappingServiceOpusReady {
  private anthropic: Anthropic;
  private standardFields: Map<string, any[]> = new Map();
  
  // Model configuration - Ready for Opus 4.1 when available
  private readonly OPUS_4_1_MODEL = 'claude-opus-4-1-20250805'; // Latest Opus 4.1
  private readonly OPUS_4_MODEL = 'claude-opus-4-20250514'; // Opus 4
  private readonly SONNET_MODEL = 'claude-3-5-sonnet-20241022'; // Fallback
  
  // Cost tracking
  private readonly OPUS_INPUT_COST = 0.015; // $15 per million
  private readonly OPUS_OUTPUT_COST = 0.075; // $75 per million
  private readonly SONNET_INPUT_COST = 0.003; // $3 per million
  private readonly SONNET_OUTPUT_COST = 0.015; // $15 per million
  
  private currentModel: string;
  private opusAvailable: boolean = false;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY!,
    });
    
    // Check Opus availability
    this.checkOpusAvailability();
    
    // Set default model based on availability
    this.currentModel = this.opusAvailable ? this.OPUS_4_1_MODEL : this.SONNET_MODEL;
    
    console.log(`🧠 Claude Mapping Service initialized`);
    console.log(`📊 Using model: ${this.currentModel}`);
    console.log(`💰 Opus available: ${this.opusAvailable ? 'Yes' : 'No (using Sonnet)'}`);
  }

  /**
   * Check if Opus models are available
   */
  private async checkOpusAvailability(): Promise<void> {
    try {
      // Try a minimal test with Opus 4.1
      const testResponse = await this.anthropic.messages.create({
        model: this.OPUS_4_1_MODEL,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      }).catch(() => null);
      
      if (testResponse) {
        this.opusAvailable = true;
        this.currentModel = this.OPUS_4_1_MODEL;
        console.log('✅ Opus 4.1 is available!');
        return;
      }
      
      // Try Opus 4
      const testResponse2 = await this.anthropic.messages.create({
        model: this.OPUS_4_MODEL,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      }).catch(() => null);
      
      if (testResponse2) {
        this.opusAvailable = true;
        this.currentModel = this.OPUS_4_MODEL;
        console.log('✅ Opus 4 is available!');
        return;
      }
      
      console.log('ℹ️ Opus not available, using Sonnet');
    } catch {
      console.log('ℹ️ Opus availability check failed, using Sonnet');
    }
  }

  /**
   * Force use of Opus for complex files
   */
  public forceOpus(): void {
    if (this.opusAvailable) {
      this.currentModel = this.OPUS_4_1_MODEL;
      console.log('🎯 Forced to use Opus model');
    } else {
      console.warn('⚠️ Opus requested but not available, using Sonnet');
    }
  }

  /**
   * Detect entity type with appropriate model
   */
  async detectEntityType(
    columns: ColumnInfo[],
    fileName: string,
    companyContext?: any
  ): Promise<any> {
    const modelToUse = this.currentModel;
    console.log(`🔍 Detecting entity type with ${modelToUse}...`);
    
    const prompt = `You are a data mapping expert for a restaurant/food service management system. 
Analyze these columns and determine what type of data entity this represents.

File Name: ${fileName}
Columns: ${JSON.stringify(columns, null, 2)}
${companyContext ? `Company Context: ${JSON.stringify(companyContext)}` : ''}

Available entity types:
- inventory (stock levels, item quantities)
- ingredients (raw materials, components)
- recipes (recipe items, modifiers, portions)
- menu_items (products, dishes, menu offerings)
- orders (sales orders, purchase orders)
- suppliers (vendor information)
- customers (client information)
- financial (transactions, accounting data)
- logistics (shipping, deliveries)

Respond in JSON format:
{
  "entityType": "detected_type",
  "confidence": 0.95,
  "reasoning": "Brief explanation of why this entity type was chosen",
  "modelUsed": "${modelToUse}"
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: modelToUse,
        max_tokens: 500,
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const result = this.extractJSON(content.text);
        console.log(`✅ Entity detected: ${result.entityType} (${(result.confidence * 100).toFixed(0)}% confidence)`);
        return { ...result, modelUsed: modelToUse };
      }
    } catch (error) {
      console.error(`❌ Entity detection error with ${modelToUse}:`, error);
      
      // If Opus fails, fallback to Sonnet
      if (modelToUse.includes('opus') && modelToUse !== this.SONNET_MODEL) {
        console.log('🔄 Falling back to Sonnet...');
        this.currentModel = this.SONNET_MODEL;
        return this.detectEntityType(columns, fileName, companyContext);
      }
      
      throw error;
    }
    
    return {
      entityType: 'inventory',
      confidence: 0,
      reasoning: 'Failed to detect entity type',
      modelUsed: modelToUse,
    };
  }

  /**
   * Suggest column mappings with the best available model
   */
  async suggestColumnMappings(
    columns: ColumnInfo[],
    entityType: string,
    companyId: string,
    fileUploadId?: string,
    forceOpus: boolean = false
  ): Promise<MappingSuggestion[]> {
    // Determine which model to use
    let modelToUse = this.currentModel;
    
    if (forceOpus && this.opusAvailable) {
      modelToUse = this.OPUS_4_1_MODEL;
      console.log('🎯 Using Opus for complex mapping (forced)');
    } else if (this.analyzeComplexity(columns) > 3 && this.opusAvailable) {
      modelToUse = this.OPUS_4_1_MODEL;
      console.log('🎯 Using Opus for complex mapping (auto-detected)');
    } else {
      console.log('📝 Using Sonnet for standard mapping');
    }
    
    console.log(`🗺️ Generating column mappings with ${modelToUse}...`);
    
    // Load standard fields
    await this.loadAllStandardFields();
    const previousMappings = await this.getPreviousMappings(companyId, entityType);
    
    const prompt = `You are a data mapping expert. Map the source columns to the most appropriate standard fields.

Source Columns:
${JSON.stringify(columns, null, 2)}

Available Standard Fields:
${JSON.stringify(Array.from(this.standardFields.values()).flat(), null, 2)}

Previous Successful Mappings (for learning):
${JSON.stringify(previousMappings, null, 2)}

Instructions:
1. Match each source column to the most appropriate standard field
2. Consider column names, data types, and sample values
3. Learn from previous successful mappings
4. Provide confidence scores (0-100)
5. Include alternative suggestions where applicable

Respond in JSON format:
[
  {
    "sourceColumn": "column_name",
    "targetField": "standard_field_name",
    "confidence": 95,
    "reasoning": "Brief explanation",
    "alternativeSuggestions": [
      {"field": "alt_field", "confidence": 70}
    ]
  }
]`;

    try {
      const startTime = Date.now();
      const response = await this.anthropic.messages.create({
        model: modelToUse,
        max_tokens: 2000,
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const suggestions = this.extractJSON(content.text);
        const elapsedTime = Date.now() - startTime;
        
        // Calculate and log cost
        const cost = this.calculateCost(prompt.length, content.text.length, modelToUse);
        console.log(`✅ Mapped columns in ${elapsedTime}ms`);
        console.log(`💰 Cost: $${cost.toFixed(4)} (${modelToUse})`);
        
        // Add model used to each suggestion
        const suggestionsArray = Array.isArray(suggestions) ? suggestions : [suggestions];
        return suggestionsArray.map(s => ({ ...s, modelUsed: modelToUse }));
      }
    } catch (error) {
      console.error(`❌ Mapping error with ${modelToUse}:`, error);
      
      // Fallback to Sonnet if Opus fails
      if (modelToUse.includes('opus') && modelToUse !== this.SONNET_MODEL) {
        console.log('🔄 Falling back to Sonnet...');
        this.currentModel = this.SONNET_MODEL;
        return this.suggestColumnMappings(columns, entityType, companyId, fileUploadId, false);
      }
      
      throw error;
    }
    
    return [];
  }

  /**
   * Analyze file complexity to determine if Opus is needed
   */
  private analyzeComplexity(columns: ColumnInfo[]): number {
    let complexity = 0;
    
    // Factor 1: Number of columns
    if (columns.length > 50) complexity += 2;
    else if (columns.length > 30) complexity += 1;
    
    // Factor 2: Mixed data types
    const hasMixedTypes = columns.some(col => 
      col.sampleValues.some(v => !isNaN(Number(v))) && 
      col.sampleValues.some(v => isNaN(Number(v)))
    );
    if (hasMixedTypes) complexity += 1;
    
    // Factor 3: High null percentage
    const avgNullPercentage = columns.reduce((sum, col) => sum + col.nullPercentage, 0) / columns.length;
    if (avgNullPercentage > 0.2) complexity += 1;
    
    // Factor 4: Ambiguous column names
    const ambiguousNames = columns.filter(col => 
      col.columnName.toLowerCase().includes('field') ||
      col.columnName.toLowerCase().includes('column') ||
      col.columnName.toLowerCase().includes('data')
    );
    if (ambiguousNames.length > columns.length * 0.2) complexity += 1;
    
    return complexity;
  }

  /**
   * Calculate API cost
   */
  private calculateCost(inputLength: number, outputLength: number, model: string): number {
    const inputTokens = inputLength / 4; // Rough estimate
    const outputTokens = outputLength / 4;
    
    if (model.includes('opus')) {
      return (inputTokens / 1000) * this.OPUS_INPUT_COST + 
             (outputTokens / 1000) * this.OPUS_OUTPUT_COST;
    } else {
      return (inputTokens / 1000) * this.SONNET_INPUT_COST + 
             (outputTokens / 1000) * this.SONNET_OUTPUT_COST;
    }
  }

  /**
   * Get model status
   */
  getModelStatus(): {
    currentModel: string;
    opusAvailable: boolean;
    pricing: any;
  } {
    return {
      currentModel: this.currentModel,
      opusAvailable: this.opusAvailable,
      pricing: {
        opus: {
          input: `$${this.OPUS_INPUT_COST} per 1K tokens`,
          output: `$${this.OPUS_OUTPUT_COST} per 1K tokens`,
        },
        sonnet: {
          input: `$${this.SONNET_INPUT_COST} per 1K tokens`,
          output: `$${this.SONNET_OUTPUT_COST} per 1K tokens`,
        },
      },
    };
  }

  // Helper methods (same as original)
  
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
      const firstBracket = text.indexOf('[');
      const lastBracket = text.lastIndexOf(']');
      
      if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
        return JSON.parse(text.substring(firstBrace, lastBrace + 1));
      }
      
      if (firstBracket !== -1 && lastBracket !== -1 && firstBracket < lastBracket) {
        return JSON.parse(text.substring(firstBracket, lastBracket + 1));
      }
      
      throw new Error('No valid JSON found in response');
    }
  }

  private async loadAllStandardFields() {
    if (this.standardFields.size === 0) {
      const fields = await sql`
        SELECT 
          field_name,
          display_name,
          data_type,
          is_required,
          domain,
          common_aliases
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

  private async getPreviousMappings(companyId: string, entityType: string) {
    const mappings = await sql`
      SELECT 
        source_column_name,
        target_standard_field,
        success_rate
      FROM data_ingestion.ai_learning_data
      WHERE 
        (company_id = ${companyId} OR is_global_learning = true)
        AND entity_type = ${entityType}
        AND success_rate > 0.7
      ORDER BY success_rate DESC
      LIMIT 20
    `;
    
    return mappings;
  }
}

export default ClaudeMappingServiceOpusReady;