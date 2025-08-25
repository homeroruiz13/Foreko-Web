// app/src/services/claude-mapping-service.ts
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
}

interface EntityDetection {
  entityType: string;
  confidence: number;
  reasoning: string;
}

export class ClaudeMappingService {
  private anthropic: Anthropic;
  private standardFields: Map<string, any[]> = new Map();

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY!,
    });
  }

  /**
   * Extract JSON from Claude response text that might contain extra formatting
   */
  private extractJSON(text: string): any {
    try {
      // First try direct parsing
      return JSON.parse(text);
    } catch {
      console.log('Direct JSON parse failed, trying extraction methods...');
      console.log('Response text:', text.substring(0, 500) + '...');
      
      // Claude-specific JSON cleaner
      const cleanClaudeJSON = (rawJSON: string): string => {
        let cleaned = rawJSON;
        
        // 1. Handle multi-line reasoning strings with bullet points
        cleaned = cleaned.replace(
          /"reasoning":\s*"([^"]*(?:\\.|[^"\\])*?)"/g,
          (match, reasoningContent) => {
            // Clean up the reasoning content specifically
            let cleanReasoning = reasoningContent
              .replace(/\n/g, ' ')           // Convert newlines to spaces
              .replace(/\r/g, ' ')           // Convert carriage returns to spaces
              .replace(/\t/g, ' ')           // Convert tabs to spaces
              .replace(/\s+/g, ' ')          // Collapse multiple spaces
              .replace(/"/g, '\\"')          // Escape any internal quotes
              .trim();                       // Remove leading/trailing whitespace
            
            return `"reasoning": "${cleanReasoning}"`;
          }
        );
        
        // 2. Clean up other string values that might have formatting issues
        cleaned = cleaned.replace(
          /"([^"]*(?:\\.|[^"\\])*?)"/g,
          (match, content) => {
            if (content.includes('\n') || content.includes('\r') || content.includes('\t')) {
              let cleanContent = content
                .replace(/\n/g, ' ')
                .replace(/\r/g, ' ')
                .replace(/\t/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
              return `"${cleanContent}"`;
            }
            return match;
          }
        );
        
        // 3. Remove control characters
        cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, ' ');
        
        // 4. Fix common JSON syntax issues
        cleaned = cleaned
          .replace(/,\s*}/g, '}')              // Remove trailing commas before }
          .replace(/,\s*]/g, ']')              // Remove trailing commas before ]
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":'); // Quote unquoted keys
        
        return cleaned;
      };
      
      // Try different extraction methods
      const extractionMethods = [
        // Method 1: JSON code blocks
        () => {
          const match = text.match(/```json\s*([\s\S]*?)\s*```/);
          return match ? cleanClaudeJSON(match[1]) : null;
        },
        // Method 2: Any code blocks
        () => {
          const match = text.match(/```\s*([\s\S]*?)\s*```/);
          return match ? cleanClaudeJSON(match[1]) : null;
        },
        // Method 3: Extract everything between first { and last }
        () => {
          const firstBrace = text.indexOf('{');
          const lastBrace = text.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            return cleanClaudeJSON(text.substring(firstBrace, lastBrace + 1));
          }
          return null;
        },
        // Method 4: Extract everything between first [ and last ]
        () => {
          const firstBracket = text.indexOf('[');
          const lastBracket = text.lastIndexOf(']');
          if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
            return cleanClaudeJSON(text.substring(firstBracket, lastBracket + 1));
          }
          return null;
        }
      ];

      for (let i = 0; i < extractionMethods.length; i++) {
        try {
          const extracted = extractionMethods[i]();
          if (extracted) {
            console.log(`Method ${i + 1} extracted:`, extracted.substring(0, 200) + '...');
            const parsed = JSON.parse(extracted);
            console.log('Successfully parsed JSON with method', i + 1);
            return parsed;
          }
        } catch (parseError) {
          console.log(`Method ${i + 1} failed:`, parseError);
          continue;
        }
      }
      
      throw new Error('No valid JSON found in response after trying all extraction methods');
    }
  }

  /**
   * Analyze uploaded file and detect entity type
   */
  async detectEntityType(
    columns: ColumnInfo[],
    fileName: string,
    companyContext?: any
  ): Promise<EntityDetection> {
    const prompt = `
You are a data mapping expert for a restaurant/food service management system. 
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
  "reasoning": "Brief explanation of why this entity type was chosen"
}
`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 500,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        try {
          const result = this.extractJSON(content.text);
          return result;
        } catch (jsonError) {
          console.error('JSON extraction failed for entity detection:', jsonError);
          console.log('Full response text:', content.text);
          // Return fallback result
          return {
            entityType: 'inventory',
            confidence: 0,
            reasoning: 'JSON parsing failed, defaulted to inventory',
          };
        }
      }
      
      throw new Error('Invalid response from Claude');
    } catch (error) {
      console.error('Entity detection error:', error);
      return {
        entityType: 'inventory', // Default to valid enum value
        confidence: 0,
        reasoning: 'Failed to detect entity type, defaulted to inventory',
      };
    }
  }

  /**
   * Get intelligent column mapping suggestions
   */
  async suggestColumnMappings(
    columns: ColumnInfo[],
    entityType: string,
    companyId: string,
    fileUploadId?: string
  ): Promise<MappingSuggestion[]> {
    // Load ALL standard fields from ALL domains instead of restricting to one entity type
    await this.loadAllStandardFields();
    
    // Get previous successful mappings from all domains for learning
    const previousMappings = await this.getAllPreviousMappings(companyId);

    const prompt = `
You are a data mapping expert. Map the source columns to the most appropriate standard fields from ANY domain.

Source Columns:
${JSON.stringify(columns, null, 2)}

Available Standard Fields from ALL Domains:
${JSON.stringify(this.getAllFieldsForPrompt(), null, 2)}

Previous Successful Mappings (for learning):
${JSON.stringify(previousMappings, null, 2)}

Instructions:
1. Match each source column to the most appropriate standard field from ANY domain (inventory, recipes, ingredients, menu_items, orders, suppliers, customers, etc.)
2. Consider column names, data types, and sample values
3. Don't restrict to one entity type - a file can contain data for multiple domains
4. Learn from previous successful mappings
5. Provide confidence scores (0-100)
6. Include alternative suggestions where applicable
7. Focus on the BEST match regardless of domain - the UI will handle multi-domain organization

Respond in JSON format:
[
  {
    "sourceColumn": "column_name",
    "targetField": "standard_field_name",
    "confidence": 95,
    "reasoning": "Brief explanation including which domain this field belongs to",
    "alternativeSuggestions": [
      {"field": "alt_field", "confidence": 70}
    ]
  }
]
`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 2000,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        try {
          const suggestions = this.extractJSON(content.text);
          
          // Ensure suggestions is an array
          const suggestionsArray = Array.isArray(suggestions) ? suggestions : [suggestions];
          
          // Store AI suggestions in the database
          if (fileUploadId) {
            await this.storeAISuggestions(fileUploadId, suggestionsArray);
          }
          
          return suggestionsArray;
        } catch (jsonError) {
          console.error('JSON extraction failed for column mapping:', jsonError);
          console.log('Full response text:', content.text);
          // Fall through to use fallback mappings
        }
      }
      
      // Use fallback mappings if Claude response failed or JSON parsing failed
      const fallbackMappings = this.getFallbackMappings(columns, entityType);
      
      // Store fallback mappings in the database too
      if (fileUploadId) {
        await this.storeAISuggestions(fileUploadId, fallbackMappings);
      }
      
      return fallbackMappings;
    } catch (error) {
      console.error('Column mapping error:', error);
      const fallbackMappings = this.getFallbackMappings(columns, entityType);
      
      // Store fallback mappings in the database too
      if (fileUploadId) {
        await this.storeAISuggestions(fileUploadId, fallbackMappings);
      }
      
      return fallbackMappings;
    }
  }

  /**
   * Validate and transform data based on mappings
   */
  async validateAndTransformData(
    rawData: any[],
    mappings: MappingSuggestion[],
    entityType: string
  ): Promise<{ valid: any[]; errors: any[] }> {
    const prompt = `
You are a data validation expert. Validate and transform this data for ${entityType}.

Mappings:
${JSON.stringify(mappings, null, 2)}

Sample Data (first 5 rows):
${JSON.stringify(rawData.slice(0, 5), null, 2)}

Validation Rules:
- Check data types match expected formats
- Identify missing required fields
- Detect anomalies or outliers
- Suggest data transformations

Respond in JSON format:
{
  "transformationRules": [
    {
      "field": "field_name",
      "rule": "transformation_description",
      "example": "transformed_value"
    }
  ],
  "validationIssues": [
    {
      "field": "field_name",
      "issue": "issue_description",
      "severity": "error|warning|info",
      "affectedRows": [1, 3, 5]
    }
  ],
  "dataQualityScore": 85,
  "recommendations": ["recommendation1", "recommendation2"]
}
`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 2000,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const validation = this.extractJSON(content.text);
        
        // Apply transformations and separate valid/invalid records
        const results = await this.applyTransformations(rawData, validation, mappings);
        
        return results;
      }
      
      throw new Error('Invalid validation response');
    } catch (error) {
      console.error('Validation error:', error);
      return { valid: rawData, errors: [] };
    }
  }

  /**
   * Learn from user feedback to improve future mappings
   */
  async recordMappingFeedback(
    companyId: string,
    fileUploadId: string,
    feedback: 'correct' | 'incorrect' | 'partial',
    corrections?: any
  ): Promise<void> {
    try {
      // Update user column mappings with feedback
      await sql`
        UPDATE data_ingestion.user_column_mappings
        SET 
          mapping_feedback = ${feedback},
          user_notes = ${corrections ? JSON.stringify(corrections) : null},
          updated_at = NOW()
        WHERE file_upload_id = ${fileUploadId}
      `;

      // Add to AI learning data for future improvements
      if (feedback === 'correct') {
        const mappings = await sql`
          SELECT 
            ucm.source_column,
            ucm.target_field,
            COALESCE(fu.detected_entity_type, 'orders') as entity_type
          FROM data_ingestion.user_column_mappings ucm
          LEFT JOIN data_ingestion.file_uploads fu ON fu.id = ucm.file_upload_id
          WHERE ucm.file_upload_id = ${fileUploadId}
        `;

        for (const mapping of mappings) {
          await sql`
            INSERT INTO data_ingestion.ai_learning_data (
              company_id,
              entity_type,
              source_column_name,
              target_standard_field,
              usage_frequency,
              success_rate
            ) VALUES (
              ${companyId},
              ${mapping.entity_type},
              ${mapping.source_column},
              ${mapping.target_field},
              1,
              1.0
            )
            ON CONFLICT (company_id, entity_type, source_column_name, target_standard_field)
            DO UPDATE SET
              usage_frequency = ai_learning_data.usage_frequency + 1,
              success_rate = (ai_learning_data.success_rate * ai_learning_data.usage_frequency + 1.0) / (ai_learning_data.usage_frequency + 1),
              updated_at = NOW()
          `;
        }
      }
    } catch (error) {
      console.error('Error recording feedback:', error);
    }
  }

  // Helper methods

  private async loadAllStandardFields() {
    if (this.standardFields.size === 0) {
      // Load standard field definitions from ALL domains
      const fields = await sql`
        SELECT 
          field_name,
          display_name,
          data_type,
          is_required,
          validation_regex,
          min_value,
          max_value,
          allowed_values,
          common_aliases,
          example_values,
          domain
        FROM data_ingestion.standard_field_definitions
        ORDER BY domain, field_name
      `;
      
      // Load validation rules for all entity types
      const validationRules = await sql`
        SELECT 
          field_name,
          rule_type,
          rule_config,
          error_message,
          priority,
          entity_type
        FROM data_ingestion.validation_rules
        WHERE is_active = true
        ORDER BY entity_type, field_name, priority
      `;
      
      // Group fields by domain
      const fieldsByDomain: { [key: string]: any[] } = {};
      
      for (const field of fields) {
        const domain = field.domain || 'other';
        if (!fieldsByDomain[domain]) {
          fieldsByDomain[domain] = [];
        }
        
        // Add validation rules for this field
        const fieldValidationRules = validationRules.filter(
          rule => rule.field_name === field.field_name && rule.entity_type === domain
        );
        
        fieldsByDomain[domain].push({
          ...field,
          validation_rules: fieldValidationRules
        });
      }
      
      // Store each domain's fields in the standardFields map
      for (const [domain, domainFields] of Object.entries(fieldsByDomain)) {
        this.standardFields.set(domain, domainFields);
      }
    }
  }
  
  private getAllFieldsForPrompt(): any[] {
    // Flatten all fields from all domains for the AI prompt
    const allFields: any[] = [];
    
    for (const [domain, fields] of this.standardFields.entries()) {
      for (const field of fields) {
        allFields.push({
          ...field,
          domain: domain,
          full_identifier: `${domain}.${field.field_name}` // Help AI understand which domain
        });
      }
    }
    
    return allFields;
  }
  
  private async getAllPreviousMappings(companyId: string) {
    const mappings = await sql`
      SELECT 
        source_column_name,
        target_standard_field,
        success_rate,
        usage_frequency,
        entity_type
      FROM data_ingestion.ai_learning_data
      WHERE 
        (company_id = ${companyId} OR is_global_learning = true)
        AND success_rate > 0.7
      ORDER BY success_rate DESC, usage_frequency DESC
      LIMIT 50
    `;
    
    return mappings;
  }

  private async loadStandardFields(entityType: string) {
    if (!this.standardFields.has(entityType)) {
      // Load standard field definitions
      const fields = await sql`
        SELECT 
          field_name,
          display_name,
          data_type,
          is_required,
          validation_regex,
          min_value,
          max_value,
          allowed_values,
          common_aliases,
          example_values
        FROM data_ingestion.standard_field_definitions
        WHERE 
          domain = ${entityType}
        ORDER BY field_name
      `;
      
      // Load validation rules for this entity type
      const validationRules = await sql`
        SELECT 
          field_name,
          rule_type,
          rule_config,
          error_message,
          priority
        FROM data_ingestion.validation_rules
        WHERE 
          entity_type = ${entityType}
          AND is_active = true
        ORDER BY field_name, priority
      `;
      
      // Combine fields with their validation rules
      const fieldsWithValidation = fields.map(field => ({
        ...field,
        validation_rules: validationRules.filter(rule => rule.field_name === field.field_name)
      }));
      
      this.standardFields.set(entityType, fieldsWithValidation);
    }
  }

  private async getPreviousMappings(companyId: string, entityType: string) {
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
        AND success_rate > 0.7
      ORDER BY success_rate DESC, usage_frequency DESC
      LIMIT 20
    `;
    
    return mappings;
  }

  private async storeAISuggestions(fileUploadId: string, suggestions: MappingSuggestion[] | MappingSuggestion) {
    // Ensure suggestions is always an array
    const suggestionsArray = Array.isArray(suggestions) ? suggestions : [suggestions];
    
    for (const suggestion of suggestionsArray) {
      try {
        await sql`
          INSERT INTO data_ingestion.ai_column_detection (
            file_upload_id,
            detected_column_name,
            suggested_standard_field,
            confidence_score,
            suggestion_reasoning,
            alternative_suggestions,
            data_type_detected
          ) VALUES (
            ${fileUploadId},
            ${suggestion.sourceColumn},
            ${suggestion.targetField},
            ${suggestion.confidence},
            ${suggestion.reasoning},
            ${JSON.stringify(suggestion.alternativeSuggestions || [])},
            'text'
          )
        `;
      } catch (error) {
        console.error('Error storing suggestion:', error);
      }
    }
  }

  private getFallbackMappings(columns: ColumnInfo[], entityType: string): MappingSuggestion[] {
    // Enhanced pattern matching fallback that considers fields from ALL domains
    const mappings: MappingSuggestion[] = [];
    
    // Enhanced field patterns with context-aware scoring
    const fieldPatterns = [
      // Exact match patterns (highest confidence)
      { patterns: ['item_name'], field: 'item_name', confidence: 98, exact: true },
      { patterns: ['product_name'], field: 'product_name', confidence: 98, exact: true },
      { patterns: ['ingredient_name'], field: 'ingredient_name', confidence: 98, exact: true },
      { patterns: ['supplier_name'], field: 'supplier_name', confidence: 98, exact: true },
      { patterns: ['customer_name'], field: 'customer_name', confidence: 98, exact: true },
      { patterns: ['order_id'], field: 'order_id', confidence: 98, exact: true },
      { patterns: ['sku_code'], field: 'sku_code', confidence: 98, exact: true },
      { patterns: ['unit_of_measure'], field: 'unit_of_measure', confidence: 98, exact: true },
      { patterns: ['unit_cost'], field: 'unit_cost', confidence: 98, exact: true },
      { patterns: ['selling_price'], field: 'selling_price', confidence: 98, exact: true },
      { patterns: ['unit_price'], field: 'unit_price', confidence: 98, exact: true },
      { patterns: ['total_amount'], field: 'total_amount', confidence: 98, exact: true },
      { patterns: ['order_date'], field: 'order_date', confidence: 98, exact: true },
      { patterns: ['package_size'], field: 'package_size', confidence: 98, exact: true },
      { patterns: ['shelf_life_days'], field: 'shelf_life_days', confidence: 98, exact: true },
      { patterns: ['storage_location'], field: 'storage_location', confidence: 98, exact: true },
      { patterns: ['contact_email'], field: 'contact_email', confidence: 98, exact: true },
      { patterns: ['contact_phone'], field: 'contact_phone', confidence: 98, exact: true },
      { patterns: ['product_category'], field: 'product_category', confidence: 98, exact: true },
      { patterns: ['pos_item_id'], field: 'pos_item_id', confidence: 98, exact: true },
      { patterns: ['is_active'], field: 'is_active', confidence: 98, exact: true },
      
      // High confidence variations
      { patterns: ['name'], field: 'item_name', confidence: 95, context: 'generic name' },
      { patterns: ['product'], field: 'product_name', confidence: 95, context: 'product reference' },
      { patterns: ['ingredient'], field: 'ingredient_name', confidence: 95, context: 'ingredient reference' },
      { patterns: ['quantity', 'qty'], field: 'quantity', confidence: 96, exact: true },
      { patterns: ['sku', 'item_code', 'code'], field: 'sku_code', confidence: 94 },
      { patterns: ['price'], field: 'selling_price', confidence: 92, context: 'generic price' },
      { patterns: ['cost'], field: 'unit_cost', confidence: 92, context: 'generic cost' },
      { patterns: ['supplier', 'vendor'], field: 'supplier_name', confidence: 94 },
      { patterns: ['customer', 'client'], field: 'customer_name', confidence: 94 },
      { patterns: ['email'], field: 'contact_email', confidence: 96 },
      { patterns: ['phone', 'telephone'], field: 'contact_phone', confidence: 96 },
      { patterns: ['address', 'location'], field: 'address', confidence: 92 },
      { patterns: ['uom', 'unit'], field: 'unit_of_measure', confidence: 92 },
      { patterns: ['date'], field: 'order_date', confidence: 88, context: 'generic date' },
      { patterns: ['total'], field: 'total_amount', confidence: 90 },
      { patterns: ['category', 'type'], field: 'product_category', confidence: 88 },
      { patterns: ['active', 'enabled'], field: 'is_active', confidence: 90 },
      
      // Medium confidence patterns (partial matches)
      { patterns: ['size'], field: 'package_size', confidence: 85, context: 'size reference' },
      { patterns: ['shelf_life', 'expiry'], field: 'shelf_life_days', confidence: 88 },
      { patterns: ['storage'], field: 'storage_location', confidence: 85 },
      { patterns: ['order_number', 'orderid'], field: 'order_id', confidence: 92 },
      { patterns: ['pos_id', 'pos'], field: 'pos_item_id', confidence: 90 },
    ];
    
    for (const column of columns) {
      const columnLower = column.columnName.toLowerCase();
      const columnNormalized = columnLower.replace(/[_\s-]/g, '_'); // Normalize separators
      let bestMatch = null;
      let bestConfidence = 0;
      let bestReasoning = '';
      
      // Phase 1: Exact matches (highest priority)
      for (const pattern of fieldPatterns.filter(p => p.exact)) {
        for (const patternStr of pattern.patterns) {
          const patternNormalized = patternStr.replace(/[_\s-]/g, '_');
          if (columnNormalized === patternNormalized || columnLower === patternStr) {
            bestMatch = pattern.field;
            bestConfidence = pattern.confidence;
            bestReasoning = `Exact match: '${column.columnName}' → '${patternStr}'`;
            break;
          }
        }
        if (bestMatch && bestConfidence >= 98) break; // Found exact match
      }
      
      // Phase 2: High confidence variations
      if (!bestMatch || bestConfidence < 95) {
        for (const pattern of fieldPatterns.filter(p => !p.exact && p.confidence >= 90)) {
          for (const patternStr of pattern.patterns) {
            // Check exact match for non-exact patterns
            if (columnLower === patternStr) {
              if (pattern.confidence > bestConfidence) {
                bestMatch = pattern.field;
                bestConfidence = pattern.confidence;
                bestReasoning = `High confidence match: '${column.columnName}' matches '${patternStr}'`;
              }
            }
            // Check if column contains pattern (for composite names)
            else if (columnLower.includes(patternStr) && patternStr.length > 3) {
              const adjustedConfidence = pattern.confidence - 8; // Slight reduction for contains
              if (adjustedConfidence > bestConfidence) {
                bestMatch = pattern.field;
                bestConfidence = adjustedConfidence;
                bestReasoning = `Contains match: '${column.columnName}' contains '${patternStr}'`;
              }
            }
          }
        }
      }
      
      // Phase 3: Medium confidence patterns (if still no good match)
      if (!bestMatch || bestConfidence < 85) {
        for (const pattern of fieldPatterns.filter(p => p.confidence < 90)) {
          for (const patternStr of pattern.patterns) {
            if (columnLower.includes(patternStr) || patternStr.includes(columnLower)) {
              const adjustedConfidence = Math.max(pattern.confidence - 5, 75); // Minimum 75% for any match
              if (adjustedConfidence > bestConfidence) {
                bestMatch = pattern.field;
                bestConfidence = adjustedConfidence;
                bestReasoning = `Partial match: '${column.columnName}' ~ '${patternStr}'`;
              }
            }
          }
        }
      }
      
      // Phase 4: Intelligent context boosting
      if (bestMatch && bestConfidence > 0) {
        // Boost confidence for likely contextual matches
        if (columnLower.includes('ingredient') && bestMatch === 'ingredient_name') {
          bestConfidence = Math.min(98, bestConfidence + 5);
          bestReasoning += ' (boosted: ingredient context)';
        }
        if (columnLower.includes('recipe') && ['quantity', 'unit_of_measure'].includes(bestMatch)) {
          bestConfidence = Math.min(96, bestConfidence + 3);
          bestReasoning += ' (boosted: recipe context)';
        }
        if (columnLower.includes('inventory') && ['quantity', 'unit_of_measure'].includes(bestMatch)) {
          bestConfidence = Math.min(96, bestConfidence + 3);
          bestReasoning += ' (boosted: inventory context)';
        }
        if (columnLower.includes('order') && ['order_id', 'order_date', 'quantity'].includes(bestMatch)) {
          bestConfidence = Math.min(98, bestConfidence + 4);
          bestReasoning += ' (boosted: order context)';
        }
        
        mappings.push({
          sourceColumn: column.columnName,
          targetField: bestMatch,
          confidence: Math.round(bestConfidence),
          reasoning: bestReasoning || 'Enhanced pattern-based mapping across all domains',
        });
      }
    }
    
    return mappings;
  }

  private async applyTransformations(
    rawData: any[],
    validation: any,
    mappings: MappingSuggestion[]
  ): Promise<{ valid: any[]; errors: any[] }> {
    const valid: any[] = [];
    const errors: any[] = [];
    
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const transformedRow: any = {};
      let hasError = false;
      
      for (const mapping of mappings) {
        const sourceValue = row[mapping.sourceColumn];
        let targetValue = sourceValue;
        
        // Apply transformations based on validation rules
        const transformation = validation.transformationRules?.find(
          (r: any) => r.field === mapping.targetField
        );
        
        if (transformation) {
          // Apply transformation logic
          targetValue = this.applyTransformation(sourceValue, transformation.rule);
        }
        
        // Check for validation issues
        const issue = validation.validationIssues?.find(
          (v: any) => v.field === mapping.targetField && v.affectedRows?.includes(i)
        );
        
        if (issue && issue.severity === 'error') {
          hasError = true;
          errors.push({
            rowNumber: i,
            field: mapping.targetField,
            issue: issue.issue,
            originalValue: sourceValue,
          });
        }
        
        transformedRow[mapping.targetField] = targetValue;
      }
      
      if (!hasError) {
        valid.push(transformedRow);
      }
    }
    
    return { valid, errors };
  }

  private applyTransformation(value: any, rule: string): any {
    // Implement common transformation rules
    if (rule.includes('uppercase')) {
      return String(value).toUpperCase();
    }
    if (rule.includes('lowercase')) {
      return String(value).toLowerCase();
    }
    if (rule.includes('trim')) {
      return String(value).trim();
    }
    if (rule.includes('number')) {
      return parseFloat(value) || 0;
    }
    // Add more transformation rules as needed
    
    return value;
  }
}

export default ClaudeMappingService;