'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';

interface DashboardSyncStatusProps {
  companyId: string;
}

interface SyncStatus {
  dashboard_type: string;
  last_sync_at: string | null;
  next_sync_scheduled: string | null;
  sync_status: 'pending' | 'running' | 'completed' | 'failed';
  records_processed: number | null;
  records_created: number | null;
  records_updated: number | null;
  records_failed: number | null;
  sync_duration_ms: number | null;
  data_volume_mb: number | null;
  last_error: string | null;
  error_count: number;
  updated_at: string;
}

export function DashboardSyncStatus({ companyId }: DashboardSyncStatusProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSyncStatus();
    const interval = setInterval(fetchSyncStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [companyId]);

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch(`/api/data-ingestion/sync-status?companyId=${companyId}`);
      const data = await response.json();
      setSyncStatus(data);
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerSync = async (dashboardType: string) => {
    try {
      const response = await fetch('/api/data-ingestion/export-to-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, dashboardType }),
      });
      
      if (response.ok) {
        // Refresh status immediately after triggering sync
        fetchSyncStatus();
      }
    } catch (error) {
      console.error('Failed to trigger sync:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Dashboard Sync Status</h3>
      
      <div className="space-y-3">
        {syncStatus.map((status) => (
          <div key={status.dashboard_type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {status.sync_status === 'completed' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : status.sync_status === 'running' ? (
                <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
              ) : status.sync_status === 'failed' ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Clock className="h-5 w-5 text-gray-400" />
              )}
              
              <div>
                <div className="font-medium capitalize">
                  {status.dashboard_type.replace(/_/g, ' ')}
                </div>
                <div className="text-sm text-gray-600">
                  Last sync: {status.last_sync_at ? new Date(status.last_sync_at).toLocaleString() : 'Never'}
                </div>
                {status.records_processed !== null && (
                  <div className="text-xs text-gray-500">
                    {status.records_processed} records processed
                    {status.records_created !== null && ` (${status.records_created} created, ${status.records_updated} updated)`}
                  </div>
                )}
                {status.last_error && (
                  <div className="text-xs text-red-600 mt-1">
                    Error: {status.last_error}
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={() => triggerSync(status.dashboard_type)}
              disabled={status.sync_status === 'running'}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status.sync_status === 'running' ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        ))}
        
        {syncStatus.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No dashboard sync configurations found
          </div>
        )}
      </div>
    </div>
  );
}