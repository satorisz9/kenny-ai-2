"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Home() {
  const [accountName, setAccountName] = useState('');
  const [trustScore, setTrustScore] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkTrustScore = async () => {
    setLoading(true);
    setError('');
    setTrustScore('');
    try {
      console.log('Sending request to /api/check-trust');
      console.log('Request payload:', JSON.stringify({ accountName }));
      const response = await fetch('/api/check-trust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountName }),
      });

      console.log('Received response from /api/check-trust');
      console.log('Response status:', response.status);

      const responseText = await response.text();
      console.log('Raw API response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed API response:', data);
      } catch (parseError) {
        console.error('Error parsing API response:', parseError);
        throw new Error(`Invalid response from server: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.answer) {
        setTrustScore(data.answer);
      } else {
        setError('No trust score available');
      }
    } catch (error) {
      console.error('Error checking trust score:', error);
      setError(`Error: ${error.message || 'Failed to check trust score'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>X Account Trust Checker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter X account name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
            <Button onClick={checkTrustScore} disabled={loading}>
              {loading ? 'Checking...' : 'Check Trust Score'}
            </Button>
            {trustScore && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Trust Score Result:</h3>
                <p className="mt-2">{trustScore}</p>
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}