'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DevMigratePage() {
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tableStructure, setTableStructure] = useState<any>(null);

  const runMigration = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/migrate/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      setMigrationResult(result);
    } catch (error) {
      setMigrationResult({ success: false, error: 'Failed to run migration' });
    } finally {
      setIsLoading(false);
    }
  };

  const checkTableStructure = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/migrate/subscriptions', {
        method: 'GET'
      });
      const result = await response.json();
      setTableStructure(result);
    } catch (error) {
      setTableStructure({ success: false, error: 'Failed to check table structure' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Database Migration Tool</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscriptions Table Migration</CardTitle>
              <CardDescription>
                Fix missing columns in the subscriptions table (renews_at, trial_ends_at, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={runMigration} 
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? 'Running...' : 'Run Migration'}
                </Button>
                
                <Button 
                  onClick={checkTableStructure} 
                  disabled={isLoading}
                  variant="outline"
                >
                  {isLoading ? 'Checking...' : 'Check Table Structure'}
                </Button>
              </div>

              {migrationResult && (
                <div className="mt-4 p-4 rounded-lg border">
                  <h3 className="font-semibold mb-2">Migration Result:</h3>
                  <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                    {JSON.stringify(migrationResult, null, 2)}
                  </pre>
                </div>
              )}

              {tableStructure && (
                <div className="mt-4 p-4 rounded-lg border">
                  <h3 className="font-semibold mb-2">Table Structure:</h3>
                  <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">
                    {JSON.stringify(tableStructure, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Subscription Creation</CardTitle>
              <CardDescription>
                After running the migration, test if subscription creation works
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                To test subscription creation:
              </p>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                <li>Run the migration above</li>
                <li>Go to the signup page and create a test account</li>
                <li>Try selecting a subscription plan</li>
                <li>Check if the error is resolved</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}