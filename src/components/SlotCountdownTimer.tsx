import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SlotCountdownTimerProps {
  expiresAt: string;
  onExpired: () => void;
  onWarning?: (secondsLeft: number) => void;
}

export const SlotCountdownTimer: React.FC<SlotCountdownTimerProps> = ({
  expiresAt,
  onExpired,
  onWarning
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;
      
      if (difference <= 0) {
        onExpired();
        return 0;
      }
      
      const seconds = Math.floor(difference / 1000);
      
      // Warning when less than 2 minutes left
      if (seconds <= 120 && !isWarning) {
        setIsWarning(true);
        onWarning?.(seconds);
      }
      
      return seconds;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [expiresAt, onExpired, onWarning, isWarning]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (timeLeft <= 0) {
    return null;
  }

  return (
    <Alert className={`${isWarning ? 'border-orange-500 bg-orange-50' : 'border-blue-500 bg-blue-50'}`}>
      <Clock className={`h-4 w-4 ${isWarning ? 'text-orange-600' : 'text-blue-600'}`} />
      <AlertDescription className={`${isWarning ? 'text-orange-800' : 'text-blue-800'}`}>
        {isWarning && <AlertTriangle className="inline h-4 w-4 mr-1" />}
        <strong>Slot Reserved:</strong> Complete payment within {formatTime(timeLeft)} or your slot will be released.
      </AlertDescription>
    </Alert>
  );
};