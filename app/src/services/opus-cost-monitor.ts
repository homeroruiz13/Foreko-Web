// app/src/services/opus-cost-monitor.ts
import { sql } from '@/lib/db';
import { OpusConfig } from '@/config/opus-config';

export interface CostReport {
  dailyBreakdown: DailyCost[];
  totalCost: number;
  totalCalls: number;
  averageCostPerCall: number;
  roiMetrics: ROIMetrics;
  period: {
    start: Date;
    end: Date;
  };
}

export interface DailyCost {
  date: string;
  apiCalls: number;
  opusCalls: number;
  sonnetCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  avgConfidence: number;
  highConfidenceCount: number;
}

export interface ROIMetrics {
  totalOpusCost: number;
  totalSonnetCost: number;
  manualCostSaved: number;
  netSavings: number;
  roiPercentage: number;
  timesSaved: number;
  accuracyImprovement: number;
}

export interface ModelComparison {
  opus: {
    calls: number;
    avgConfidence: number;
    avgCost: number;
    successRate: number;
  };
  sonnet: {
    calls: number;
    avgConfidence: number;
    avgCost: number;
    successRate: number;
  };
  recommendation: string;
}

export class OpusCostMonitor {
  /**
   * Get comprehensive usage report for date range
   */
  async getUsageReport(startDate: Date, endDate: Date): Promise<CostReport> {
    // Get daily breakdown
    const dailyData = await sql`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as api_calls,
        COUNT(CASE WHEN model_used = 'opus' THEN 1 END) as opus_calls,
        COUNT(CASE WHEN model_used = 'sonnet' THEN 1 END) as sonnet_calls,
        COALESCE(SUM(input_tokens), 0) as total_input_tokens,
        COALESCE(SUM(output_tokens), 0) as total_output_tokens,
        COALESCE(SUM(api_cost), 0) as total_cost,
        AVG(confidence_score) as avg_confidence,
        COUNT(CASE WHEN confidence_score > 0.9 THEN 1 END) as high_confidence_count
      FROM data_ingestion.opus_api_logs
      WHERE created_at BETWEEN ${startDate} AND ${endDate}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;
    
    const totalCost = dailyData.reduce((sum, day) => sum + (day.total_cost || 0), 0);
    const totalCalls = dailyData.reduce((sum, day) => sum + (day.api_calls || 0), 0);
    
    const roiMetrics = await this.calculateROI(dailyData, startDate, endDate);
    
    return {
      dailyBreakdown: dailyData.map(d => ({
        date: d.date,
        apiCalls: d.api_calls,
        opusCalls: d.opus_calls,
        sonnetCalls: d.sonnet_calls,
        totalInputTokens: d.total_input_tokens,
        totalOutputTokens: d.total_output_tokens,
        totalCost: d.total_cost,
        avgConfidence: d.avg_confidence,
        highConfidenceCount: d.high_confidence_count,
      })),
      totalCost,
      totalCalls,
      averageCostPerCall: totalCalls > 0 ? totalCost / totalCalls : 0,
      roiMetrics,
      period: {
        start: startDate,
        end: endDate,
      },
    };
  }
  
  /**
   * Calculate ROI metrics
   */
  private async calculateROI(
    usageData: any[],
    startDate: Date,
    endDate: Date
  ): Promise<ROIMetrics> {
    // Get model-specific costs
    const modelCosts = await sql`
      SELECT
        model_used,
        SUM(api_cost) as total_cost,
        COUNT(*) as call_count,
        AVG(confidence_score) as avg_confidence
      FROM data_ingestion.opus_api_logs
      WHERE created_at BETWEEN ${startDate} AND ${endDate}
      GROUP BY model_used
    `;
    
    const opusData = modelCosts.find(m => m.model_used === 'opus') || { total_cost: 0, call_count: 0 };
    const sonnetData = modelCosts.find(m => m.model_used === 'sonnet') || { total_cost: 0, call_count: 0 };
    
    // Calculate time saved (assume 15 minutes per manual mapping)
    const totalMappings = usageData.reduce((sum, d) => sum + d.api_calls, 0);
    const timesSaved = totalMappings * 15; // minutes
    
    // Calculate manual cost saved (assume $25 per file for manual mapping)
    const highConfidenceMappings = usageData.reduce((sum, d) => sum + d.high_confidence_count, 0);
    const manualCostSaved = highConfidenceMappings * 25;
    
    // Calculate accuracy improvement
    const accuracyImprovement = await this.calculateAccuracyImprovement(startDate, endDate);
    
    const totalOpusCost = opusData.total_cost || 0;
    const totalSonnetCost = sonnetData.total_cost || 0;
    const totalCost = totalOpusCost + totalSonnetCost;
    const netSavings = manualCostSaved - totalCost;
    const roiPercentage = totalCost > 0 ? (netSavings / totalCost) * 100 : 0;
    
    return {
      totalOpusCost,
      totalSonnetCost,
      manualCostSaved,
      netSavings,
      roiPercentage,
      timesSaved,
      accuracyImprovement,
    };
  }
  
  /**
   * Calculate accuracy improvement from using Opus
   */
  private async calculateAccuracyImprovement(
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const accuracyData = await sql`
      SELECT
        model_used,
        AVG(confidence_score) as avg_confidence,
        COUNT(CASE WHEN requires_manual_review = false THEN 1 END) as auto_approved,
        COUNT(*) as total
      FROM data_ingestion.ai_column_detection
      WHERE created_at BETWEEN ${startDate} AND ${endDate}
      GROUP BY model_used
    `;
    
    const opusAccuracy = accuracyData.find(a => a.model_used === 'opus');
    const sonnetAccuracy = accuracyData.find(a => a.model_used === 'sonnet');
    
    if (opusAccuracy && sonnetAccuracy) {
      const opusAutoRate = opusAccuracy.auto_approved / opusAccuracy.total;
      const sonnetAutoRate = sonnetAccuracy.auto_approved / sonnetAccuracy.total;
      return ((opusAutoRate - sonnetAutoRate) / sonnetAutoRate) * 100;
    }
    
    return 0;
  }
  
  /**
   * Get real-time budget status
   */
  async getBudgetStatus(): Promise<{
    dailyBudget: number;
    usedToday: number;
    remainingBudget: number;
    percentageUsed: number;
    estimatedCallsRemaining: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    const todayUsage = await sql`
      SELECT
        COALESCE(SUM(api_cost), 0) as used_today,
        COUNT(CASE WHEN model_used = 'opus' THEN 1 END) as opus_calls,
        AVG(CASE WHEN model_used = 'opus' THEN api_cost END) as avg_opus_cost
      FROM data_ingestion.opus_api_logs
      WHERE DATE(created_at) = ${today}
    `;
    
    const usedToday = todayUsage[0]?.used_today || 0;
    const avgOpusCost = todayUsage[0]?.avg_opus_cost || 0.05;
    const remainingBudget = OpusConfig.DAILY_OPUS_BUDGET - usedToday;
    const percentageUsed = (usedToday / OpusConfig.DAILY_OPUS_BUDGET) * 100;
    const estimatedCallsRemaining = avgOpusCost > 0 ? Math.floor(remainingBudget / avgOpusCost) : 0;
    
    return {
      dailyBudget: OpusConfig.DAILY_OPUS_BUDGET,
      usedToday,
      remainingBudget,
      percentageUsed,
      estimatedCallsRemaining,
    };
  }
  
  /**
   * Compare Opus vs Sonnet performance
   */
  async getModelComparison(days: number = 7): Promise<ModelComparison> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const comparison = await sql`
      SELECT
        model_used,
        COUNT(*) as calls,
        AVG(confidence_score) as avg_confidence,
        AVG(api_cost) as avg_cost,
        COUNT(CASE WHEN success = true THEN 1 END)::float / COUNT(*) as success_rate
      FROM data_ingestion.opus_api_logs
      WHERE created_at >= ${startDate}
      GROUP BY model_used
    `;
    
    const opusData = comparison.find(c => c.model_used === 'opus') || {
      calls: 0,
      avg_confidence: 0,
      avg_cost: 0,
      success_rate: 0,
    };
    
    const sonnetData = comparison.find(c => c.model_used === 'sonnet') || {
      calls: 0,
      avg_confidence: 0,
      avg_cost: 0,
      success_rate: 0,
    };
    
    // Generate recommendation
    let recommendation = '';
    if (opusData.avg_confidence > sonnetData.avg_confidence + 0.15) {
      recommendation = 'Opus provides significantly better accuracy. Consider using for complex files.';
    } else if (sonnetData.avg_cost < opusData.avg_cost * 0.3 && sonnetData.avg_confidence > 0.8) {
      recommendation = 'Sonnet provides good accuracy at lower cost for most files.';
    } else {
      recommendation = 'Use intelligent routing to optimize cost and accuracy.';
    }
    
    return {
      opus: {
        calls: opusData.calls,
        avgConfidence: opusData.avg_confidence,
        avgCost: opusData.avg_cost,
        successRate: opusData.success_rate,
      },
      sonnet: {
        calls: sonnetData.calls,
        avgConfidence: sonnetData.avg_confidence,
        avgCost: sonnetData.avg_cost,
        successRate: sonnetData.success_rate,
      },
      recommendation,
    };
  }
  
  /**
   * Get cost breakdown by company
   */
  async getCostByCompany(
    startDate: Date,
    endDate: Date
  ): Promise<Array<{
    companyId: string;
    companyName: string;
    totalCost: number;
    opusCalls: number;
    sonnetCalls: number;
    avgConfidence: number;
  }>> {
    const results = await sql`
      SELECT
        mr.company_id,
        c.name as company_name,
        SUM(mr.api_cost) as total_cost,
        COUNT(CASE WHEN mr.model_used = 'opus' THEN 1 END) as opus_calls,
        COUNT(CASE WHEN mr.model_used = 'sonnet' THEN 1 END) as sonnet_calls,
        AVG(mr.average_confidence) as avg_confidence
      FROM data_ingestion.mapping_results mr
      LEFT JOIN companies c ON c.id = mr.company_id
      WHERE mr.created_at BETWEEN ${startDate} AND ${endDate}
      GROUP BY mr.company_id, c.name
      ORDER BY total_cost DESC
    `;
    
    return results.map(r => ({
      companyId: r.company_id,
      companyName: r.company_name || 'Unknown',
      totalCost: r.total_cost,
      opusCalls: r.opus_calls,
      sonnetCalls: r.sonnet_calls,
      avgConfidence: r.avg_confidence,
    }));
  }
  
  /**
   * Alert if approaching budget limit
   */
  async checkBudgetAlert(): Promise<{
    alert: boolean;
    message?: string;
    severity?: 'warning' | 'critical';
  }> {
    const status = await this.getBudgetStatus();
    
    if (status.percentageUsed >= 90) {
      return {
        alert: true,
        message: `Critical: ${status.percentageUsed.toFixed(1)}% of daily Opus budget used. Only $${status.remainingBudget.toFixed(2)} remaining.`,
        severity: 'critical',
      };
    } else if (status.percentageUsed >= 75) {
      return {
        alert: true,
        message: `Warning: ${status.percentageUsed.toFixed(1)}% of daily Opus budget used. Consider switching to Sonnet for non-complex files.`,
        severity: 'warning',
      };
    }
    
    return { alert: false };
  }
}

export default OpusCostMonitor;