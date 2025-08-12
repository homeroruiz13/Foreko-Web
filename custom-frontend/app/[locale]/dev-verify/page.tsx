"use client";
import React, { useState } from "react";
import { Container } from "@/components/container";
import { Button } from "@/components/elements/button";

export default function DevVerifyPage() {
  const [email, setEmail] = useState('');
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const getTokens = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      // Try to trigger a resend to get a new token
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.token) {
          setTokens([{ token: data.token, created: new Date().toLocaleTimeString() }]);
        } else {
          alert(data.message);
        }
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Error fetching tokens');
    } finally {
      setLoading(false);
    }
  };

  const verifyToken = async (token: string) => {
    setVerifying(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Email verified successfully!');
        setTokens([]);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Error verifying token');
    } finally {
      setVerifying(false);
    }
  };

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return (
      <Container className="h-screen max-w-lg mx-auto flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-red-400">Not Available in Production</h1>
      </Container>
    );
  }

  return (
    <Container className="h-screen max-w-lg mx-auto flex flex-col items-center justify-center">
      <h1 className="text-2xl md:text-4xl font-bold mb-4 text-center">
        Development Email Verification
      </h1>
      <p className="text-neutral-400 text-center mb-6">
        Use this page to get verification tokens for testing (when SMTP is not configured)
      </p>

      <div className="w-full space-y-4">
        <input
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 pl-4 w-full rounded-md text-sm bg-charcoal border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:ring-2 focus:ring-neutral-800"
        />
        
        <Button 
          variant="muted" 
          onClick={getTokens} 
          disabled={loading || !email}
          className="w-full py-3"
        >
          {loading ? 'Getting Token...' : 'Get Verification Token'}
        </Button>

        {tokens.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-lg font-medium">Verification Tokens:</h3>
            {tokens.map((tokenData, index) => (
              <div key={index} className="p-4 bg-neutral-800 rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-neutral-400">Created: {tokenData.created}</span>
                </div>
                <div className="text-xs font-mono break-all mb-3 text-neutral-300">
                  {tokenData.token}
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => verifyToken(tokenData.token)}
                  disabled={verifying}
                  className="w-full py-2"
                >
                  {verifying ? 'Verifying...' : 'Verify This Token'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-neutral-500">
          This page is only available in development mode
        </p>
      </div>
    </Container>
  );
}