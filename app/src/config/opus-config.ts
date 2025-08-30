// app/src/config/opus-config.ts
export const OpusConfig = {
  // API Configuration
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  
  // Model Selection - Using Opus for complex data mapping
  OPUS_MODEL: "claude-3-opus-20240229",
  SONNET_MODEL: "claude-3-5-sonnet-20241022",
  
  // Opus-specific settings
  MAX_TOKENS: 8192,
  TEMPERATURE: 0.1, // Very low for consistency in data mapping
  
  // Cost management
  OPUS_COST_PER_1K_INPUT: 0.015, // $15 per million tokens
  OPUS_COST_PER_1K_OUTPUT: 0.075, // $75 per million tokens
  DAILY_OPUS_BUDGET: 100, // $100 daily limit
  
  // Complexity thresholds
  OPUS_CONFIDENCE_THRESHOLD: 0.7,
  OPUS_COMPLEXITY_THRESHOLD: 3,
  SONNET_FALLBACK_THRESHOLD: 0.85,
  
  // Performance settings
  MAX_CONCURRENT_OPUS_CALLS: 3,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  
  // Data processing limits
  MAX_ROWS_PER_ANALYSIS: 1000,
  SAMPLE_ROWS_FOR_MAPPING: 20,
  
  // Feature flags
  ENABLE_OPUS_ROUTING: true,
  ENABLE_COST_TRACKING: true,
  ENABLE_LEARNING_MODE: true,
  AUTO_ESCALATE_TO_OPUS: true,
};

export interface OpusUsageMetrics {
  date: Date;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  calls: number;
  successRate: number;
}

export interface ComplexityScore {
  score: number;
  hasNestedRelationships: boolean;
  ambiguityLevel: 'low' | 'medium' | 'high';
  businessLogicDetected: boolean;
  dataQualityScore: number;
  recommendedModel: 'opus' | 'sonnet';
  reasons: string[];
}