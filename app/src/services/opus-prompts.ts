// app/src/services/opus-prompts.ts
export class OpusPromptBuilder {
  /**
   * Builds comprehensive mapping prompt for Opus to handle complex data
   */
  static buildComplexMappingPrompt(
    columns: Array<{
      columnName: string;
      dataType: string;
      sampleValues: string[];
      nullPercentage: number;
      uniquePercentage: number;
    }>,
    sampleData: any[],
    standardFields: any[],
    context: {
      companyType?: string;
      industry?: string;
      historicalPatterns?: any[];
      fileName?: string;
      detectedEntityType?: string;
    }
  ): string {
    return `Analyze this complex business data file and provide detailed mapping recommendations.

## FILE STRUCTURE
File Name: ${context.fileName || 'Unknown'}
Detected Entity Type: ${context.detectedEntityType || 'Unknown'}
Columns detected: ${JSON.stringify(columns, null, 2)}

## SAMPLE DATA (First 10 rows)
${JSON.stringify(sampleData.slice(0, 10), null, 2)}

## STANDARD FIELD DEFINITIONS (All Domains)
${JSON.stringify(standardFields, null, 2)}

## BUSINESS CONTEXT
- Company Type: ${context.companyType || 'Restaurant/Food Service'}
- Industry: ${context.industry || 'Food & Beverage'}
- Previous Patterns: ${JSON.stringify(context.historicalPatterns || [], null, 2)}

## ANALYSIS REQUIREMENTS

1. **Column Mapping with Deep Analysis**
   - Map each source column to the most appropriate standard field from ANY domain
   - The file may contain data for multiple dashboards (inventory, orders, suppliers, etc.)
   - Provide confidence score (0.0-1.0) with detailed reasoning
   - Identify any calculated or derived fields
   - Detect multi-column dependencies
   - Consider common aliases and industry-specific terminology

2. **Business Logic Detection**
   - Identify any implicit business rules (e.g., reorder points, minimum quantities)
   - Detect calculation formulas (e.g., total = quantity × price)
   - Find data validation patterns
   - Recognize industry-specific conventions (e.g., SKU formats, date patterns)

3. **Data Quality Assessment**
   - Identify data quality issues with specific examples
   - Suggest data cleaning transformations
   - Flag potential data integrity problems
   - Recommend validation rules

4. **Relationship Mapping**
   - Identify foreign key relationships (e.g., supplier_id, product_id)
   - Detect hierarchical structures (e.g., category > subcategory)
   - Map many-to-many relationships
   - Find cross-entity references

5. **Advanced Pattern Recognition**
   - Detect naming conventions (camelCase, snake_case, etc.)
   - Identify data encoding patterns (base64, hex, etc.)
   - Recognize abbreviation systems (e.g., "qty" for quantity)
   - Find recurring data structures

6. **Dashboard Assignment Logic**
   - Determine which dashboards should receive this data
   - Consider that one record can populate multiple dashboards
   - Use the target_dashboards array field appropriately

## OUTPUT FORMAT
Return a JSON object with this exact structure:
{
  "mappings": [
    {
      "sourceColumn": "column_name",
      "targetField": "standard_field_name",
      "targetDomain": "inventory|orders|suppliers|customers|etc",
      "confidence": 0.95,
      "reasoning": "Detailed explanation of why this mapping was chosen",
      "dataType": "detected_type",
      "transformationNeeded": "description of any transformation",
      "dependencies": ["other_columns_if_any"],
      "qualityIssues": ["list of detected issues"],
      "businessRule": "any detected business logic",
      "sampleTransformation": {
        "original": "original_value_example",
        "transformed": "transformed_value_example"
      }
    }
  ],
  "unmappedColumns": [
    {
      "column": "column_name",
      "reason": "why it couldn't be mapped",
      "suggestion": "recommended action",
      "possibleCustomField": true
    }
  ],
  "detectedRelationships": [
    {
      "type": "foreign_key|hierarchy|calculated|composite",
      "source": "column_or_entity",
      "target": "column_or_entity",
      "confidence": 0.9,
      "evidence": "what indicated this relationship"
    }
  ],
  "businessRules": [
    {
      "ruleType": "validation|calculation|constraint|threshold",
      "description": "detailed rule description",
      "affectedFields": ["field_list"],
      "implementation": "suggested implementation",
      "examples": ["concrete examples from the data"]
    }
  ],
  "targetDashboards": ["inventory", "orders", "suppliers"],
  "qualitySummary": {
    "overallScore": 0.85,
    "completeness": 0.9,
    "consistency": 0.8,
    "accuracy": 0.85,
    "criticalIssues": ["list of critical problems"],
    "warnings": ["list of warnings"],
    "dataReadiness": "ready|needs_cleaning|needs_validation"
  },
  "transformationPlan": [
    {
      "step": 1,
      "action": "specific transformation",
      "reason": "why needed",
      "impact": "what it fixes",
      "affectedColumns": ["columns"],
      "priority": "high|medium|low"
    }
  ],
  "aiInsights": {
    "patterns": ["detected patterns in the data"],
    "anomalies": ["unusual findings"],
    "recommendations": ["strategic recommendations"],
    "industryAlignment": "how well data aligns with industry standards"
  },
  "executiveSummary": "2-3 sentence summary of findings and recommendations for business stakeholders"
}`;
  }

  /**
   * Builds validation prompt for Opus to validate mapped data
   */
  static buildValidationPrompt(
    data: any[],
    mappedFields: any,
    businessContext: {
      entityType: string;
      companyId: string;
      industry?: string;
      validationRules?: any[];
    }
  ): string {
    return `Perform deep validation of this mapped data for quality and business rule compliance.

## MAPPED DATA (Sample)
${JSON.stringify(data.slice(0, 20), null, 2)}

## FIELD MAPPINGS
${JSON.stringify(mappedFields, null, 2)}

## BUSINESS CONTEXT
Entity Type: ${businessContext.entityType}
Industry: ${businessContext.industry || 'Food & Beverage'}
Existing Validation Rules: ${JSON.stringify(businessContext.validationRules || [], null, 2)}

## VALIDATION REQUIREMENTS

1. **Data Integrity Validation**
   - Check referential integrity between related fields
   - Validate business logic consistency
   - Verify calculated fields match their formulas
   - Check for data anomalies and outliers

2. **Business Rule Compliance**
   - Validate against industry standards (e.g., SKU formats, date formats)
   - Check business-specific rules (e.g., price ranges, quantity limits)
   - Verify regulatory compliance if applicable
   - Assess risk factors

3. **Statistical Analysis**
   - Identify statistical outliers with reasoning
   - Detect data distribution issues
   - Find correlation anomalies
   - Check for data drift from historical patterns

4. **Predictive Issues**
   - Predict potential downstream problems
   - Identify data that might cause ETL errors
   - Flag dashboard rendering risks
   - Assess impact on analytics

5. **Cross-Dashboard Validation**
   - Ensure data consistency across dashboards
   - Validate that shared fields align
   - Check for conflicting business rules

## OUTPUT FORMAT
Return a comprehensive validation report in JSON format:
{
  "validationStatus": "passed|failed|passed_with_warnings",
  "validRecords": 180,
  "invalidRecords": 20,
  "totalRecords": 200,
  "integrityChecks": [
    {
      "checkType": "referential|format|range|business_rule",
      "field": "field_name",
      "status": "passed|failed|warning",
      "details": "specific details",
      "affectedRecords": [1, 5, 10],
      "severity": "critical|high|medium|low"
    }
  ],
  "businessRuleViolations": [
    {
      "rule": "rule description",
      "violations": 5,
      "examples": ["specific examples"],
      "recommendation": "how to fix"
    }
  ],
  "statisticalFindings": [
    {
      "finding": "outlier|anomaly|pattern",
      "field": "field_name",
      "description": "detailed description",
      "values": ["example values"],
      "impact": "potential impact"
    }
  ],
  "dataQualityMetrics": {
    "completeness": 0.95,
    "accuracy": 0.92,
    "consistency": 0.88,
    "timeliness": 0.90,
    "uniqueness": 0.99,
    "validity": 0.91
  },
  "transformationRequired": [
    {
      "field": "field_name",
      "transformation": "required transformation",
      "reason": "why needed",
      "priority": "high|medium|low"
    }
  ],
  "dashboardReadiness": {
    "inventory": {"ready": true, "issues": []},
    "orders": {"ready": false, "issues": ["missing order_date"]},
    "suppliers": {"ready": true, "issues": []}
  },
  "recommendations": [
    {
      "type": "immediate|short_term|long_term",
      "action": "specific action",
      "impact": "expected impact",
      "effort": "low|medium|high"
    }
  ],
  "executiveSummary": "Brief summary for stakeholders"
}`;
  }

  /**
   * Builds learning prompt for Opus to improve future mappings
   */
  static buildLearningPrompt(
    successfulMappings: any[],
    failedMappings: any[],
    corrections: any[]
  ): string {
    return `Analyze these mapping outcomes to improve future data ingestion accuracy.

## SUCCESSFUL MAPPINGS
${JSON.stringify(successfulMappings, null, 2)}

## FAILED MAPPINGS
${JSON.stringify(failedMappings, null, 2)}

## USER CORRECTIONS
${JSON.stringify(corrections, null, 2)}

## LEARNING OBJECTIVES

1. **Pattern Recognition**
   - Identify common patterns in successful mappings
   - Understand why certain mappings failed
   - Learn from user corrections

2. **Rule Extraction**
   - Extract reusable mapping rules
   - Identify industry-specific patterns
   - Create templates for common scenarios

3. **Improvement Recommendations**
   - Suggest updates to mapping logic
   - Recommend new validation rules
   - Identify gaps in standard fields

## OUTPUT FORMAT
{
  "learnedPatterns": [
    {
      "pattern": "pattern description",
      "confidence": 0.95,
      "applicability": "when to apply",
      "examples": ["examples"]
    }
  ],
  "mappingRules": [
    {
      "sourcePattern": "regex or description",
      "targetField": "standard field",
      "conditions": ["when to apply"],
      "confidence": 0.90
    }
  ],
  "improvements": [
    {
      "area": "mapping|validation|transformation",
      "current": "current approach",
      "suggested": "improved approach",
      "expectedImpact": "impact description"
    }
  ],
  "newStandardFields": [
    {
      "fieldName": "suggested field",
      "domain": "target domain",
      "reason": "why needed",
      "frequency": "how often seen"
    }
  ]
}`;
  }

  /**
   * Builds prompt for handling edge cases and complex scenarios
   */
  static buildEdgeCasePrompt(
    data: any,
    issue: string,
    context: any
  ): string {
    return `Handle this complex edge case in data ingestion.

## ISSUE DESCRIPTION
${issue}

## PROBLEMATIC DATA
${JSON.stringify(data, null, 2)}

## CONTEXT
${JSON.stringify(context, null, 2)}

## REQUIREMENTS
1. Identify the root cause
2. Suggest multiple solution approaches
3. Recommend the best approach with reasoning
4. Provide implementation details

## OUTPUT FORMAT
{
  "rootCause": "detailed analysis",
  "solutions": [
    {
      "approach": "solution description",
      "pros": ["advantages"],
      "cons": ["disadvantages"],
      "confidence": 0.85,
      "implementation": "how to implement"
    }
  ],
  "recommendation": {
    "selectedApproach": "best solution",
    "reasoning": "why this is best",
    "implementation": {
      "steps": ["step by step guide"],
      "code": "if applicable",
      "validation": "how to verify success"
    }
  },
  "preventionStrategy": "how to prevent similar issues"
}`;
  }
}