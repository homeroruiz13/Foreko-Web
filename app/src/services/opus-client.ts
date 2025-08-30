// app/src/services/opus-client.ts
import Anthropic from '@anthropic-ai/sdk';
import { OpusConfig, OpusUsageMetrics } from '@/config/opus-config';
import { sql } from '@/lib/db';

export interface OpusResponse {
  result: any;
  metadata: {
    model: string;
    cost: number;
    tokens: {
      input: number;
      output: number;
    };
    elapsedTime: number;
    confidence?: number;
  };
}

export class OpusDataIngestionClient {
  private anthropic: Anthropic;
  private dailyUsage: OpusUsageMetrics;
  
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: OpusConfig.ANTHROPIC_API_KEY,
    });
    this.dailyUsage = this.initializeDailyUsage();
  }
  
  private initializeDailyUsage(): OpusUsageMetrics {
    return {
      date: new Date(),
      inputTokens: 0,
      outputTokens: 0,
      cost: 0,
      calls: 0,
      successRate: 0,
    };
  }
  
  async loadDailyUsage(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const usage = await sql`
        SELECT 
          COALESCE(SUM(input_tokens), 0) as input_tokens,
          COALESCE(SUM(output_tokens), 0) as output_tokens,
          COALESCE(SUM(api_cost), 0) as cost,
          COUNT(*) as calls,
          AVG(CASE WHEN success = true THEN 1 ELSE 0 END) as success_rate
        FROM data_ingestion.opus_api_logs
        WHERE DATE(created_at) = ${today}
      `;
      
      if (usage.length > 0) {
        this.dailyUsage = {
          date: new Date(),
          inputTokens: usage[0].input_tokens || 0,
          outputTokens: usage[0].output_tokens || 0,
          cost: usage[0].cost || 0,
          calls: usage[0].calls || 0,
          successRate: usage[0].success_rate || 0,
        };
      }
    } catch (error) {
      console.error('Error loading daily usage:', error);
    }
  }
  
  private calculateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1000) * OpusConfig.OPUS_COST_PER_1K_INPUT;
    const outputCost = (outputTokens / 1000) * OpusConfig.OPUS_COST_PER_1K_OUTPUT;
    return inputCost + outputCost;
  }
  
  private async checkBudget(estimatedTokens: number = 5000): Promise<boolean> {
    await this.loadDailyUsage();
    const estimatedCost = this.calculateCost(estimatedTokens, 1000);
    return (this.dailyUsage.cost + estimatedCost) <= OpusConfig.DAILY_OPUS_BUDGET;
  }
  
  async callOpus(
    prompt: string,
    systemPrompt?: string,
    options: {
      force?: boolean;
      maxTokens?: number;
      temperature?: number;
    } = {}
  ): Promise<OpusResponse> {
    // Budget check
    if (!options.force && OpusConfig.ENABLE_COST_TRACKING) {
      const withinBudget = await this.checkBudget();
      if (!withinBudget) {
        console.warn(`Daily Opus budget exceeded: $${this.dailyUsage.cost.toFixed(2)}`);
        throw new Error('Daily Opus budget exceeded. Use force=true to override or switch to Sonnet.');
      }
    }
    
    const startTime = Date.now();
    let success = false;
    let retries = 0;
    
    while (retries < OpusConfig.RETRY_ATTEMPTS) {
      try {
        // Make API call
        const response = await this.anthropic.messages.create({
          model: OpusConfig.OPUS_MODEL,
          max_tokens: options.maxTokens || OpusConfig.MAX_TOKENS,
          temperature: options.temperature || OpusConfig.TEMPERATURE,
          system: systemPrompt || this.getDefaultSystemPrompt(),
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        });
        
        // Extract usage information
        const inputTokens = response.usage?.input_tokens || 0;
        const outputTokens = response.usage?.output_tokens || 0;
        const cost = this.calculateCost(inputTokens, outputTokens);
        const elapsedTime = (Date.now() - startTime) / 1000;
        
        // Update daily usage
        this.dailyUsage.inputTokens += inputTokens;
        this.dailyUsage.outputTokens += outputTokens;
        this.dailyUsage.cost += cost;
        this.dailyUsage.calls += 1;
        
        // Log to database
        await this.logApiCall({
          inputTokens,
          outputTokens,
          cost,
          elapsedTime,
          success: true,
          model: 'opus',
        });
        
        success = true;
        
        // Parse response
        const content = response.content[0];
        if (content.type === 'text') {
          try {
            const result = this.extractJSON(content.text);
            return {
              result,
              metadata: {
                model: 'opus',
                cost,
                tokens: { input: inputTokens, output: outputTokens },
                elapsedTime,
                confidence: result.confidence || result.average_confidence,
              },
            };
          } catch (jsonError) {
            // Return raw response if JSON parsing fails
            return {
              result: { raw_response: content.text },
              metadata: {
                model: 'opus',
                cost,
                tokens: { input: inputTokens, output: outputTokens },
                elapsedTime,
              },
            };
          }
        }
        
        throw new Error('Invalid response format from Opus');
        
      } catch (error: any) {
        retries++;
        console.error(`Opus API error (attempt ${retries}):`, error);
        
        if (retries >= OpusConfig.RETRY_ATTEMPTS) {
          await this.logApiCall({
            inputTokens: 0,
            outputTokens: 0,
            cost: 0,
            elapsedTime: (Date.now() - startTime) / 1000,
            success: false,
            model: 'opus',
            error: error.message,
          });
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, OpusConfig.RETRY_DELAY_MS * retries));
      }
    }
    
    throw new Error('Failed to get response from Opus after retries');
  }
  
  private extractJSON(text: string): any {
    try {
      return JSON.parse(text);
    } catch {
      // Try extracting JSON from markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // Try extracting raw JSON
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
  
  private getDefaultSystemPrompt(): string {
    return `You are an expert data analyst specializing in complex business data ingestion and mapping.
    
You excel at:
1. Understanding intricate relationships between data entities
2. Detecting implicit business rules and logic
3. Handling ambiguous, poorly structured, or nested data
4. Recognizing industry-specific terminology and abbreviations
5. Providing detailed reasoning for all decisions

Your analysis should be comprehensive, accurate, and include confidence scores with detailed justification.

Always return valid JSON formatted responses unless explicitly asked otherwise.`;
  }
  
  private async logApiCall(data: {
    inputTokens: number;
    outputTokens: number;
    cost: number;
    elapsedTime: number;
    success: boolean;
    model: string;
    error?: string;
  }): Promise<void> {
    try {
      await sql`
        INSERT INTO data_ingestion.opus_api_logs (
          model_used,
          input_tokens,
          output_tokens,
          api_cost,
          response_time_ms,
          success,
          error_message,
          created_at
        ) VALUES (
          ${data.model},
          ${data.inputTokens},
          ${data.outputTokens},
          ${data.cost},
          ${Math.round(data.elapsedTime * 1000)},
          ${data.success},
          ${data.error || null},
          NOW()
        )
      `;
    } catch (error) {
      console.error('Error logging API call:', error);
    }
  }
  
  async getUsageReport(startDate: Date, endDate: Date): Promise<any> {
    const report = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as api_calls,
        SUM(input_tokens) as total_input_tokens,
        SUM(output_tokens) as total_output_tokens,
        SUM(api_cost) as total_cost,
        AVG(CASE WHEN success = true THEN 1 ELSE 0 END) as success_rate,
        AVG(response_time_ms) as avg_response_time
      FROM data_ingestion.opus_api_logs
      WHERE 
        created_at BETWEEN ${startDate} AND ${endDate}
        AND model_used = 'opus'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;
    
    const totalCost = report.reduce((sum: number, day: any) => sum + (day.total_cost || 0), 0);
    const totalCalls = report.reduce((sum: number, day: any) => sum + (day.api_calls || 0), 0);
    
    return {
      daily_breakdown: report,
      total_cost: totalCost,
      total_calls: totalCalls,
      average_cost_per_call: totalCalls > 0 ? totalCost / totalCalls : 0,
      period: {
        start: startDate,
        end: endDate,
      },
    };
  }
}