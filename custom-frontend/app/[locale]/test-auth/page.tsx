"use client";
import React, { useState, useEffect } from 'react';

export default function TestAuthPage() {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/debug/auth', {
        credentials: 'include'
      });
      const data = await response.json();
      setAuthStatus(data);
    } catch (error) {
      setAuthStatus({ error: 'Failed to check auth' });
    } finally {
      setLoading(false);
    }
  };

  const testCompanySetup = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/company/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          companyName: 'Test Company',
          industry: 'Technology',
          role: 'CEO/Founder'
        }),
      });
      
      const data = await response.json();
      alert(`Company setup result: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Auth Status:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(authStatus, null, 2)}
        </pre>
      </div>

      <div className="space-y-4">
        <button 
          onClick={checkAuth}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh Auth Status
        </button>
        
        <button 
          onClick={testCompanySetup}
          disabled={!authStatus?.tokenValid}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Test Company Setup
        </button>
      </div>

      <div className="mt-8">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>If &quot;hasToken&quot; is false, you need to log in first</li>
          <li>If &quot;tokenValid&quot; is false, your session has expired</li>
          <li>If both are true, the &quot;Test Company Setup&quot; button should work</li>
        </ul>
      </div>
    </div>
  );
}