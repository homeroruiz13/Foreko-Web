"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Container } from "@/components/container";

interface ApiMetric {
  endpoint: string;
  method: string;
  request_count: string;
  avg_response_time: string;
  error_count: string;
}

interface ErrorMetric {
  error_type: string;
  severity: string;
  error_count: string;
  unresolved_count: string;
}

interface PerformanceMetric {
  operation_name: string;
  avg_duration: string;
  max_duration: string;
  min_duration: string;
  operation_count: string;
  success_count: string;
}

interface MonitoringData {
  timeRange: string;
  metrics: {
    api: ApiMetric[];
    errors: ErrorMetric[];
    performance: PerformanceMetric[];
  };
  generatedAt: string;
}

export default function MonitoringDashboard() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/monitoring/dashboard?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch monitoring data');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData();
  };

  const handleTestHealthCheck = async () => {
    try {
      const response = await fetch('/api/monitoring/dashboard', {
        method: 'POST',
      });
      if (response.ok) {
        alert('Health check recorded successfully!');
        fetchData(); // Refresh data
      } else {
        alert('Failed to record health check');
      }
    } catch (err) {
      alert('Error recording health check');
    }
  };

  if (loading) {
    return (
      <Container className="py-20">
        <div className="text-center">Loading monitoring data...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-20">
        <div className="text-center text-red-400">
          <p>Error: {error}</p>
          <button 
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Monitoring Dashboard</h1>
        
        <div className="flex gap-4 mb-6">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-charcoal border border-neutral-700 rounded text-white"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
          
          <button 
            onClick={handleTestHealthCheck}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Test Health Check
          </button>
        </div>

        {data && (
          <p className="text-sm text-neutral-400 mb-6">
            Last updated: {new Date(data.generatedAt).toLocaleString()}
          </p>
        )}
      </div>

      {data && (
        <div className="space-y-8">
          {/* API Metrics */}
          <div className="bg-neutral-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">API Request Metrics</h2>
            {data.metrics.api.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-700">
                      <th className="text-left py-2">Endpoint</th>
                      <th className="text-left py-2">Method</th>
                      <th className="text-left py-2">Requests</th>
                      <th className="text-left py-2">Avg Response Time</th>
                      <th className="text-left py-2">Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.metrics.api.map((metric, index) => (
                      <tr key={index} className="border-b border-neutral-800">
                        <td className="py-2">{metric.endpoint}</td>
                        <td className="py-2">
                          <span className="px-2 py-1 bg-blue-600 text-xs rounded">
                            {metric.method}
                          </span>
                        </td>
                        <td className="py-2">{metric.request_count}</td>
                        <td className="py-2">{Math.round(parseFloat(metric.avg_response_time))}ms</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            parseInt(metric.error_count) > 0 ? 'bg-red-600' : 'bg-green-600'
                          }`}>
                            {metric.error_count}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-neutral-400">No API requests recorded in the selected time range.</p>
            )}
          </div>

          {/* Error Metrics */}
          <div className="bg-neutral-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Error Metrics</h2>
            {data.metrics.errors.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-700">
                      <th className="text-left py-2">Error Type</th>
                      <th className="text-left py-2">Severity</th>
                      <th className="text-left py-2">Count</th>
                      <th className="text-left py-2">Unresolved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.metrics.errors.map((metric, index) => (
                      <tr key={index} className="border-b border-neutral-800">
                        <td className="py-2">{metric.error_type}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            metric.severity === 'critical' ? 'bg-red-600' :
                            metric.severity === 'error' ? 'bg-orange-600' :
                            metric.severity === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
                          }`}>
                            {metric.severity}
                          </span>
                        </td>
                        <td className="py-2">{metric.error_count}</td>
                        <td className="py-2">{metric.unresolved_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-neutral-400">No errors recorded in the selected time range.</p>
            )}
          </div>

          {/* Performance Metrics */}
          <div className="bg-neutral-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
            {data.metrics.performance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-700">
                      <th className="text-left py-2">Operation</th>
                      <th className="text-left py-2">Avg Duration</th>
                      <th className="text-left py-2">Max Duration</th>
                      <th className="text-left py-2">Count</th>
                      <th className="text-left py-2">Success Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.metrics.performance.map((metric, index) => {
                      const successRate = ((parseInt(metric.success_count) / parseInt(metric.operation_count)) * 100).toFixed(1);
                      return (
                        <tr key={index} className="border-b border-neutral-800">
                          <td className="py-2">{metric.operation_name}</td>
                          <td className="py-2">{Math.round(parseFloat(metric.avg_duration))}ms</td>
                          <td className="py-2">{Math.round(parseFloat(metric.max_duration))}ms</td>
                          <td className="py-2">{metric.operation_count}</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 text-xs rounded ${
                              parseFloat(successRate) >= 95 ? 'bg-green-600' :
                              parseFloat(successRate) >= 90 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}>
                              {successRate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-neutral-400">No performance data recorded in the selected time range.</p>
            )}
          </div>
        </div>
      )}
    </Container>
  );
}