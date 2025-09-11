import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const DatabaseStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string>('');
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const checkConnection = async () => {
    setStatus('checking');
    setError('');
    
    try {
      // Simple test query - just get one record
      const { data, error: dbError } = await supabase
        .from('categories')
        .select('id, name')
        .limit(1);
      
      if (dbError) {
        throw dbError;
      }
      
      setStatus('connected');
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Database connection failed');
    }
    
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />;
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Checking database connection...';
      case 'connected':
        return 'Database connected successfully';
      case 'error':
        return 'Database connection failed';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'border-blue-200 bg-blue-50';
      case 'connected':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  if (status === 'connected') {
    return null; // Don't show anything when everything is working
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className={`${getStatusColor()} border-2`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {getStatusIcon()}
            <div className="flex-1">
              <h4 className="font-medium text-sm">{getStatusText()}</h4>
              {error && (
                <p className="text-xs text-red-600 mt-1">{error}</p>
              )}
              {status === 'error' && (
                <div className="mt-3 space-y-2">
                  <Button
                    onClick={checkConnection}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry Connection
                  </Button>
                  <p className="text-xs text-gray-600">
                    Check SUPABASE_SETUP.md for help
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Last checked: {lastChecked.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};