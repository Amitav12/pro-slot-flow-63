import React, { useEffect, useRef } from 'react';
import { notificationService } from './NotificationService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationSchedulerProps {
  enabled?: boolean;
  checkInterval?: number; // in milliseconds, default 1 hour
  children?: React.ReactNode;
}

// Background service to handle automated notifications
export class NotificationScheduler {
  private static instance: NotificationScheduler;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private checkInterval = 60 * 60 * 1000; // 1 hour default

  private constructor() {}

  public static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler();
    }
    return NotificationScheduler.instance;
  }

  public start(checkInterval: number = this.checkInterval): void {
    if (this.isRunning) {
      console.log('📅 Notification scheduler is already running');
      return;
    }

    this.checkInterval = checkInterval;
    this.isRunning = true;

    console.log(`📅 Starting notification scheduler (checking every ${checkInterval / 1000 / 60} minutes)`);

    // Run immediately on start
    this.checkAndSendNotifications();

    // Set up recurring checks
    this.intervalId = setInterval(() => {
      this.checkAndSendNotifications();
    }, checkInterval);
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('📅 Notification scheduler stopped');
  }

  public isSchedulerRunning(): boolean {
    return this.isRunning;
  }

  private async checkAndSendNotifications(): Promise<void> {
    try {
      console.log('📅 Checking for providers needing availability reminders...');
      
      const results = await notificationService.sendBulkAvailabilityReminders();
      
      if (results.sent > 0 || results.failed > 0) {
        console.log(`📧 Notification batch completed: ${results.sent} sent, ${results.failed} failed`);
        
        // Log the batch results
        results.details.forEach(detail => {
          if (detail.success) {
            console.log(`✅ Sent reminder to ${detail.provider}`);
          } else {
            console.error(`❌ Failed to send reminder to ${detail.provider}: ${detail.error}`);
          }
        });
      } else {
        console.log('📅 No providers need reminders at this time');
      }
    } catch (error) {
      console.error('❌ Error in notification scheduler:', error);
    }
  }

  // Manual trigger for testing
  public async triggerManualCheck(): Promise<{
    sent: number;
    failed: number;
    details: { provider: string; success: boolean; error?: string }[];
  }> {
    console.log('🔄 Manual notification check triggered');
    return await notificationService.sendBulkAvailabilityReminders();
  }

  // Get scheduler status
  public getStatus(): {
    isRunning: boolean;
    checkInterval: number;
    nextCheckIn: number; // milliseconds until next check
  } {
    const nextCheckIn = this.isRunning && this.intervalId 
      ? this.checkInterval 
      : 0;

    return {
      isRunning: this.isRunning,
      checkInterval: this.checkInterval,
      nextCheckIn
    };
  }
}

// Export singleton instance
export const notificationScheduler = NotificationScheduler.getInstance();

// React component to manage the notification scheduler
export const NotificationSchedulerProvider: React.FC<NotificationSchedulerProps> = ({ 
  enabled = true, 
  checkInterval = 60 * 60 * 1000, // 1 hour
  children 
}) => {
  const { toast } = useToast();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (enabled && !hasStarted.current) {
      // Start the scheduler when the component mounts
      notificationScheduler.start(checkInterval);
      hasStarted.current = true;

      // Note: Toast notification removed from here as it should only show to providers
      // The notification will be shown in the provider dashboard instead
    }

    // Cleanup on unmount
    return () => {
      if (hasStarted.current) {
        notificationScheduler.stop();
        hasStarted.current = false;
      }
    };
  }, [enabled, checkInterval, toast]);

  return <>{children}</>;
};

// Hook for components to interact with the scheduler
export const useNotificationScheduler = () => {
  const { toast } = useToast();

  const triggerManualCheck = async () => {
    try {
      const results = await notificationScheduler.triggerManualCheck();
      
      toast({
        title: 'Manual Check Complete',
        description: `Sent ${results.sent} reminders, ${results.failed} failed.`,
      });
      
      return results;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to run manual notification check.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const getSchedulerStatus = () => {
    return notificationScheduler.getStatus();
  };

  const startScheduler = (interval?: number) => {
    notificationScheduler.start(interval);
    toast({
      title: 'Scheduler Started',
      description: 'Notification scheduler is now running.',
    });
  };

  const stopScheduler = () => {
    notificationScheduler.stop();
    toast({
      title: 'Scheduler Stopped',
      description: 'Notification scheduler has been stopped.',
    });
  };

  return {
    triggerManualCheck,
    getSchedulerStatus,
    startScheduler,
    stopScheduler
  };
};

// Admin component for managing the notification scheduler
export const NotificationSchedulerAdmin: React.FC = () => {
  const [status, setStatus] = React.useState(notificationScheduler.getStatus());
  const [isLoading, setIsLoading] = React.useState(false);
  const { triggerManualCheck, startScheduler, stopScheduler } = useNotificationScheduler();

  // Update status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(notificationScheduler.getStatus());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleManualCheck = async () => {
    setIsLoading(true);
    try {
      await triggerManualCheck();
    } finally {
      setIsLoading(false);
      setStatus(notificationScheduler.getStatus());
    }
  };

  const handleToggleScheduler = () => {
    if (status.isRunning) {
      stopScheduler();
    } else {
      startScheduler();
    }
    setStatus(notificationScheduler.getStatus());
  };

  const formatInterval = (ms: number) => {
    const minutes = Math.floor(ms / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="p-6 bg-white rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Notification Scheduler</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Status:</span>
          <span className={`px-2 py-1 rounded text-sm ${
            status.isRunning 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {status.isRunning ? 'Running' : 'Stopped'}
          </span>
        </div>
        
        {status.isRunning && (
          <div className="flex items-center justify-between">
            <span>Check Interval:</span>
            <span className="text-sm text-gray-600">
              {formatInterval(status.checkInterval)}
            </span>
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={handleToggleScheduler}
            className={`px-4 py-2 rounded text-sm font-medium ${
              status.isRunning
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {status.isRunning ? 'Stop Scheduler' : 'Start Scheduler'}
          </button>
          
          <button
            onClick={handleManualCheck}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Checking...' : 'Manual Check'}
          </button>
        </div>
      </div>
    </div>
  );
};