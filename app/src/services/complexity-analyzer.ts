// app/src/services/complexity-analyzer.ts
import { ComplexityScore } from '@/config/opus-config';

export interface FileComplexityData {
  columns: Array<{
    columnName: string;
    dataType: string;
    sampleValues: string[];
    nullPercentage: number;
    uniquePercentage: number;
  }>;
  rowCount: number;
  fileName: string;
  fileSize?: number;
}

export class ComplexityAnalyzer {
  /**
   * Analyzes file complexity to determine whether to use Opus or Sonnet
   */
  analyze(fileData: FileComplexityData): ComplexityScore {
    const factors = {
      columnComplexity: this.calculateColumnComplexity(fileData.columns),
      dataQuality: this.assessDataQuality(fileData.columns),
      structuralComplexity: this.assessStructuralComplexity(fileData.columns),
      ambiguity: this.assessAmbiguity(fileData.columns),
      businessLogic: this.detectBusinessLogic(fileData.columns),
      nestedRelationships: this.detectNestedRelationships(fileData.columns),
    };
    
    // Calculate overall complexity score (0-5)
    const complexityScore = 
      factors.columnComplexity * 0.2 +
      (1 - factors.dataQuality) * 0.2 +
      factors.structuralComplexity * 0.2 +
      factors.ambiguity * 0.2 +
      (factors.businessLogic ? 1 : 0) * 0.1 +
      (factors.nestedRelationships ? 1 : 0) * 0.1;
    
    const ambiguityLevel = this.getAmbiguityLevel(factors.ambiguity);
    const recommendedModel = complexityScore >= 3 ? 'opus' : 'sonnet';
    
    const reasons = this.generateComplexityReasons(factors, complexityScore);
    
    return {
      score: complexityScore,
      hasNestedRelationships: factors.nestedRelationships,
      ambiguityLevel,
      businessLogicDetected: factors.businessLogic,
      dataQualityScore: factors.dataQuality,
      recommendedModel,
      reasons,
    };
  }
  
  private calculateColumnComplexity(columns: any[]): number {
    let complexity = 0;
    
    // Factor 1: Number of columns
    if (columns.length > 50) complexity += 1;
    else if (columns.length > 30) complexity += 0.7;
    else if (columns.length > 15) complexity += 0.4;
    
    // Factor 2: Mixed data types
    const mixedTypeColumns = columns.filter(col => this.hasMixedTypes(col.sampleValues));
    complexity += (mixedTypeColumns.length / columns.length) * 2;
    
    // Factor 3: Special characters and encoding issues
    const specialCharColumns = columns.filter(col => 
      this.hasSpecialCharacters(col.sampleValues)
    );
    complexity += (specialCharColumns.length / columns.length);
    
    // Factor 4: Complex column names
    const complexNames = columns.filter(col => this.isComplexColumnName(col.columnName));
    complexity += (complexNames.length / columns.length) * 0.5;
    
    return Math.min(complexity, 5); // Cap at 5
  }
  
  private assessDataQuality(columns: any[]): number {
    let qualityScore = 1;
    
    // Factor 1: Null percentages
    const avgNullPercentage = columns.reduce((sum, col) => sum + col.nullPercentage, 0) / columns.length;
    qualityScore -= avgNullPercentage * 0.3;
    
    // Factor 2: Inconsistent data
    const inconsistentColumns = columns.filter(col => 
      this.hasInconsistentData(col.sampleValues)
    );
    qualityScore -= (inconsistentColumns.length / columns.length) * 0.3;
    
    // Factor 3: Missing required fields
    const likelyRequiredMissing = this.checkMissingRequiredFields(columns);
    qualityScore -= likelyRequiredMissing * 0.2;
    
    // Factor 4: Data standardization
    const unstandardized = columns.filter(col => 
      this.needsStandardization(col.sampleValues)
    );
    qualityScore -= (unstandardized.length / columns.length) * 0.2;
    
    return Math.max(0, qualityScore);
  }
  
  private assessStructuralComplexity(columns: any[]): number {
    let complexity = 0;
    
    // Check for nested JSON/objects in values
    const hasNestedData = columns.some(col => 
      col.sampleValues.some((val: string) => this.isNestedStructure(val))
    );
    if (hasNestedData) complexity += 2;
    
    // Check for composite fields (multiple values in one field)
    const hasCompositeFields = columns.some(col =>
      col.sampleValues.some((val: string) => this.isCompositeField(val))
    );
    if (hasCompositeFields) complexity += 1.5;
    
    // Check for encoded data
    const hasEncodedData = columns.some(col =>
      col.sampleValues.some((val: string) => this.isEncodedData(val))
    );
    if (hasEncodedData) complexity += 1;
    
    return Math.min(complexity, 5);
  }
  
  private assessAmbiguity(columns: any[]): number {
    let ambiguityScore = 0;
    
    // Check for ambiguous column names
    const ambiguousNames = [
      'value', 'data', 'field', 'column', 'attribute',
      'item', 'info', 'detail', 'misc', 'other',
      'field1', 'field2', 'col1', 'col2'
    ];
    
    const ambiguousColumns = columns.filter(col => {
      const name = col.columnName.toLowerCase();
      return ambiguousNames.some(amb => name.includes(amb)) ||
             /^[a-z]$|^col\d+$|^field\d+$/.test(name);
    });
    
    ambiguityScore += (ambiguousColumns.length / columns.length) * 2;
    
    // Check for columns that could map to multiple standard fields
    const multiMappingPotential = columns.filter(col => 
      this.hasMultipleMappingPotential(col.columnName)
    );
    ambiguityScore += (multiMappingPotential.length / columns.length) * 1.5;
    
    // Check for industry-specific terminology
    const industrySpecific = columns.filter(col =>
      this.hasIndustrySpecificTerms(col.columnName)
    );
    ambiguityScore += (industrySpecific.length / columns.length) * 1;
    
    return Math.min(ambiguityScore, 5);
  }
  
  private detectBusinessLogic(columns: any[]): boolean {
    // Check for calculated fields
    const calculatedFieldPatterns = [
      'total', 'sum', 'avg', 'average', 'count',
      'percentage', 'ratio', 'margin', 'profit',
      'discount', 'tax', 'net', 'gross'
    ];
    
    const hasCalculatedFields = columns.some(col => {
      const name = col.columnName.toLowerCase();
      return calculatedFieldPatterns.some(pattern => name.includes(pattern));
    });
    
    // Check for status/workflow fields
    const workflowPatterns = ['status', 'state', 'stage', 'phase', 'step'];
    const hasWorkflowFields = columns.some(col => {
      const name = col.columnName.toLowerCase();
      return workflowPatterns.some(pattern => name.includes(pattern));
    });
    
    // Check for date range fields
    const hasDateRanges = columns.filter(col => {
      const name = col.columnName.toLowerCase();
      return name.includes('from') || name.includes('to') || 
             name.includes('start') || name.includes('end');
    }).length >= 2;
    
    return hasCalculatedFields || hasWorkflowFields || hasDateRanges;
  }
  
  private detectNestedRelationships(columns: any[]): boolean {
    // Check for foreign key patterns
    const fkPatterns = ['_id', '_key', '_ref', '_code', '_fk'];
    const hasForeignKeys = columns.filter(col => {
      const name = col.columnName.toLowerCase();
      return fkPatterns.some(pattern => name.endsWith(pattern));
    }).length >= 2;
    
    // Check for hierarchical patterns
    const hierarchicalPatterns = ['parent', 'child', 'level', 'hierarchy', 'category'];
    const hasHierarchy = columns.some(col => {
      const name = col.columnName.toLowerCase();
      return hierarchicalPatterns.some(pattern => name.includes(pattern));
    });
    
    // Check for many-to-many indicators
    const hasManyToMany = columns.some(col => {
      const name = col.columnName.toLowerCase();
      return name.includes('mapping') || name.includes('junction') ||
             name.includes('association');
    });
    
    return hasForeignKeys || hasHierarchy || hasManyToMany;
  }
  
  // Helper methods
  
  private hasMixedTypes(sampleValues: string[]): boolean {
    if (!sampleValues || sampleValues.length === 0) return false;
    
    const types = sampleValues.map(val => {
      if (val === null || val === undefined || val === '') return 'null';
      if (!isNaN(Number(val))) return 'number';
      if (val.match(/^\d{4}-\d{2}-\d{2}/)) return 'date';
      if (val.toLowerCase() === 'true' || val.toLowerCase() === 'false') return 'boolean';
      return 'string';
    });
    
    const uniqueTypes = new Set(types.filter(t => t !== 'null'));
    return uniqueTypes.size > 1;
  }
  
  private hasSpecialCharacters(sampleValues: string[]): boolean {
    if (!sampleValues) return false;
    return sampleValues.some(val => 
      val && /[^\x00-\x7F]|[\x00-\x1F]/.test(String(val))
    );
  }
  
  private isComplexColumnName(name: string): boolean {
    // Check for overly long names
    if (name.length > 50) return true;
    
    // Check for special separators
    const complexSeparators = /[|\\\/\[\]{}()<>@#$%^&*+=]/;
    if (complexSeparators.test(name)) return true;
    
    // Check for encoded names
    if (/^[A-Z0-9]{8,}$/.test(name)) return true;
    
    return false;
  }
  
  private hasInconsistentData(sampleValues: string[]): boolean {
    if (!sampleValues || sampleValues.length < 2) return false;
    
    // Check for inconsistent formats
    const formats = sampleValues.map(val => {
      if (!val) return 'empty';
      if (val.match(/^\d+$/)) return 'integer';
      if (val.match(/^\d+\.\d+$/)) return 'decimal';
      if (val.match(/^\d{4}-\d{2}-\d{2}/)) return 'iso-date';
      if (val.match(/^\d{2}\/\d{2}\/\d{4}/)) return 'us-date';
      if (val.match(/^[A-Z]+$/)) return 'uppercase';
      if (val.match(/^[a-z]+$/)) return 'lowercase';
      return 'mixed';
    });
    
    const uniqueFormats = new Set(formats.filter(f => f !== 'empty'));
    return uniqueFormats.size > 2;
  }
  
  private checkMissingRequiredFields(columns: any[]): number {
    const commonRequired = ['id', 'name', 'date', 'quantity', 'price', 'sku'];
    const columnNames = columns.map(c => c.columnName.toLowerCase());
    
    let missing = 0;
    for (const req of commonRequired) {
      if (!columnNames.some(name => name.includes(req))) {
        missing += 0.1;
      }
    }
    
    return Math.min(missing, 1);
  }
  
  private needsStandardization(sampleValues: string[]): boolean {
    if (!sampleValues || sampleValues.length === 0) return false;
    
    // Check for values that need standardization
    return sampleValues.some(val => {
      if (!val) return false;
      // Currency with symbols
      if (val.match(/[$€£¥]/)) return true;
      // Percentages with symbols
      if (val.match(/%/)) return true;
      // Mixed case that should be consistent
      if (val.match(/^[A-Za-z]+$/) && val !== val.toLowerCase() && val !== val.toUpperCase()) return true;
      return false;
    });
  }
  
  private isNestedStructure(value: string): boolean {
    if (!value) return false;
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === 'object' && parsed !== null;
    } catch {
      return false;
    }
  }
  
  private isCompositeField(value: string): boolean {
    if (!value) return false;
    // Check for multiple values separated by common delimiters
    const delimiters = [',', ';', '|', ' - ', ' / '];
    return delimiters.some(d => value.includes(d) && value.split(d).length > 1);
  }
  
  private isEncodedData(value: string): boolean {
    if (!value || value.length < 10) return false;
    // Check for base64
    if (/^[A-Za-z0-9+/]+=*$/.test(value) && value.length % 4 === 0) return true;
    // Check for hex
    if (/^[0-9A-Fa-f]+$/.test(value) && value.length % 2 === 0) return true;
    return false;
  }
  
  private hasMultipleMappingPotential(columnName: string): boolean {
    const ambiguousTerms = ['name', 'date', 'id', 'code', 'number', 'type', 'value'];
    const nameLower = columnName.toLowerCase();
    return ambiguousTerms.some(term => nameLower === term);
  }
  
  private hasIndustrySpecificTerms(columnName: string): boolean {
    const industryTerms = [
      'pos', 'sku', 'upc', 'ean', 'gtin', 'plc', 'cogs',
      'fifo', 'lifo', 'bom', 'wip', 'rfq', 'po', 'grn'
    ];
    const nameLower = columnName.toLowerCase();
    return industryTerms.some(term => nameLower.includes(term));
  }
  
  private getAmbiguityLevel(score: number): 'low' | 'medium' | 'high' {
    if (score < 1.5) return 'low';
    if (score < 3) return 'medium';
    return 'high';
  }
  
  private generateComplexityReasons(factors: any, score: number): string[] {
    const reasons: string[] = [];
    
    if (factors.columnComplexity > 2) {
      reasons.push('High column complexity with mixed data types or special characters');
    }
    
    if (factors.dataQuality < 0.5) {
      reasons.push('Poor data quality with significant null values or inconsistencies');
    }
    
    if (factors.structuralComplexity > 2) {
      reasons.push('Complex data structure with nested or composite fields');
    }
    
    if (factors.ambiguity > 2) {
      reasons.push('High ambiguity in column names requiring contextual understanding');
    }
    
    if (factors.businessLogic) {
      reasons.push('Business logic detected requiring domain expertise');
    }
    
    if (factors.nestedRelationships) {
      reasons.push('Nested relationships detected requiring relationship mapping');
    }
    
    if (reasons.length === 0 && score < 3) {
      reasons.push('Standard complexity file suitable for Sonnet processing');
    }
    
    return reasons;
  }
}