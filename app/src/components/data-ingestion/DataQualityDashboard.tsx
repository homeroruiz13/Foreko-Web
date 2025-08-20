'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface DataQualityDashboardProps {
  companyId: string;
}

interface Metric {
  metric_type: string;
  metric_name: string;
  metric_value: number;
  trend: 'good' | 'fair' | 'poor';
  details: any;
}

interface Analytics {
  analysis_type: string;
  analysis_name: string;
  primary_domain: string;
  related_domains: string[] | null;
  confidence_score: number;
  insights: any;
  recommendations: any;
  potential_impact: string;
  calculated_at: string;
}

export function DataQualityDashboard({ companyId }: DataQualityDashboardProps) {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAnalytics();
  }, [companyId, dateRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        `/api/data-ingestion/analytics?companyId=${companyId}&dateFrom=${dateRange.from}&dateTo=${dateRange.to}`
      );
      const data = await response.json();
      setMetrics(data.metrics || []);
      setAnalytics(data.analytics || []);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'good':
        return <TrendingUp className="h-4 w-4" />;
      case 'poor':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'good':
        return 'text-green-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getImpactBadgeColor = (impact: string) => {
    switch (impact?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Get the overall quality score metric
  const overallQuality = metrics.find(m => m.metric_type === 'data_quality');

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Data Quality Analytics</h3>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">From:</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="px-2 py-1 border rounded text-sm"
            />
            <label className="text-sm text-gray-600">To:</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="px-2 py-1 border rounded text-sm"
            />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Overall Quality Score Card */}
        {overallQuality && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Overall Data Quality</h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-3xl font-semibold text-gray-900">
                {Math.round(overallQuality.metric_value)}%
              </p>
              <p className={`ml-2 flex items-baseline text-sm font-semibold ${getTrendColor(overallQuality.trend)}`}>
                {getTrendIcon(overallQuality.trend)}
                <span className="ml-1">{overallQuality.trend}</span>
              </p>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    overallQuality.metric_value >= 80 ? 'bg-green-500' :
                    overallQuality.metric_value >= 60 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${overallQuality.metric_value}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Other Metrics */}
        {metrics.filter(m => m.metric_type !== 'data_quality').map((metric, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">{metric.metric_name}</h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">
                {typeof metric.metric_value === 'number' 
                  ? metric.metric_value.toLocaleString()
                  : metric.metric_value}
              </p>
              <p className={`ml-2 flex items-baseline text-sm font-semibold ${getTrendColor(metric.trend)}`}>
                {getTrendIcon(metric.trend)}
              </p>
            </div>
            {metric.details && (
              <div className="mt-2 text-xs text-gray-500">
                {JSON.stringify(metric.details).substring(0, 50)}...
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Insights & Recommendations</h3>
        <div className="space-y-4">
          {analytics.slice(0, 5).map((insight, idx) => (
            <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{insight.analysis_name}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getImpactBadgeColor(insight.potential_impact)}`}>
                      {insight.potential_impact} impact
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {insight.primary_domain}
                    {insight.related_domains && insight.related_domains.length > 0 && (
                      <span> → {insight.related_domains.join(', ')}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <Info className="h-3 w-3 mr-1" />
                      Confidence: {insight.confidence_score}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(insight.calculated_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                {insight.confidence_score >= 80 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 ml-2" />
                ) : insight.confidence_score >= 60 ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-500 ml-2" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500 ml-2" />
                )}
              </div>
              {insight.recommendations && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
                  <strong>Recommendations:</strong>
                  <div className="mt-1">
                    {typeof insight.recommendations === 'string' 
                      ? insight.recommendations
                      : JSON.stringify(insight.recommendations).substring(0, 200)}
                    {JSON.stringify(insight.recommendations).length > 200 && '...'}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {analytics.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No insights available for the selected date range
            </div>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-600">Total Metrics</div>
            <div className="text-2xl font-semibold">{metrics.length}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-xs text-green-600">Good Trends</div>
            <div className="text-2xl font-semibold text-green-700">
              {metrics.filter(m => m.trend === 'good').length}
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-xs text-yellow-600">Fair Trends</div>
            <div className="text-2xl font-semibold text-yellow-700">
              {metrics.filter(m => m.trend === 'fair').length}
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-xs text-red-600">Poor Trends</div>
            <div className="text-2xl font-semibold text-red-700">
              {metrics.filter(m => m.trend === 'poor').length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}