"use client";
import { useState } from "react";
import { Container } from "@/components/container";
import { Button } from "@/components/elements/button";

export default function TestRememberMePage() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("newpassword456");
  const [rememberMe, setRememberMe] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSignin = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe
        }),
      });

      const data = await response.json();
      
      // Also capture cookie headers for analysis
      const cookies = response.headers.get('set-cookie');
      
      setResult({
        status: response.status,
        data,
        cookies,
        rememberMeSent: rememberMe
      });
    } catch (error) {
      setResult({ error: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-20 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Remember Me Test</h1>
      
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm mb-2">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 pl-4 w-full rounded-md text-sm bg-charcoal border border-neutral-800 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm mb-2">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 pl-4 w-full rounded-md text-sm bg-charcoal border border-neutral-800 text-white"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-5 h-5 rounded border-2 border-neutral-600 bg-charcoal text-blue-400"
          />
          <label htmlFor="rememberMe" className="text-sm cursor-pointer">
            Remember Me (should create 30-day sessions when checked)
          </label>
        </div>
      </div>

      <Button
        variant="muted"
        onClick={testSignin}
        disabled={loading}
        className="w-full py-3 mb-8"
      >
        {loading ? 'Testing...' : 'Test Remember Me Login'}
      </Button>

      {result && (
        <div className="bg-neutral-800 p-4 rounded-md">
          <h3 className="text-lg font-bold mb-4">Test Results:</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Remember Me Sent:</strong> {result.rememberMeSent.toString()}</p>
            <p><strong>Response Status:</strong> {result.status}</p>
            
            {result.data && (
              <>
                <p><strong>Message:</strong> {result.data.message}</p>
                {result.data.sessionInfo && (
                  <p><strong>Session Expires:</strong> {result.data.sessionInfo.expiresAt}</p>
                )}
              </>
            )}
            
            {result.error && <p><strong>Error:</strong> {result.error}</p>}
          </div>
          
          <div className="mt-4">
            <h4 className="font-bold mb-2">Expected Behavior:</h4>
            <ul className="text-xs space-y-1 text-neutral-300">
              <li>• Remember Me OFF: Session expires in ~24 hours</li>
              <li>• Remember Me ON: Session expires in ~30 days</li>
              <li>• Check browser cookies for actual Max-Age values</li>
            </ul>
          </div>
        </div>
      )}
      
      <div className="mt-8 text-xs text-neutral-400">
        <p>Open browser DevTools → Application → Cookies to see actual cookie expiration times.</p>
        <p>Max-Age should be 86400 (1 day) without remember me, or 2592000 (30 days) with remember me.</p>
      </div>
    </Container>
  );
}