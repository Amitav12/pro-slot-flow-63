import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ProviderNotificationPreferences, ProviderNotificationPreferencesInsert, ProviderNotificationPreferencesUpdate } from '@/types/database';

interface ProviderNotification {
  provider_id: string;
  provider_name: string;
  email: string;
  phone: string;
  week_start: string;
  reminder_days_advance: number;
}

export class NotificationService {
  private static instance: NotificationService;
  private toast: any;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize notification service with toast
  public initialize(toast: any) {
    this.toast = toast;
  }

  // Get provider notification preferences
  public async getNotificationPreferences(providerId: string): Promise<ProviderNotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('provider_notification_preferences')
        .select('*')
        .eq('provider_id', providerId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  }

  // Update provider notification preferences
  public async updateNotificationPreferences(
    providerId: string,
    preferences: Partial<ProviderNotificationPreferencesUpdate>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('provider_notification_preferences')
        .upsert({
          provider_id: providerId,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      this.toast?.({
        title: 'Success',
        description: 'Notification preferences updated successfully',
      });

      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      this.toast?.({
        title: 'Error',
        description: 'Failed to update notification preferences',
        variant: 'destructive'
      });
      return false;
    }
  }

  // Get providers who need availability reminders
  public async getProvidersNeedingReminders(): Promise<ProviderNotification[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_providers_needing_availability_reminder');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching providers needing reminders:', error);
      return [];
    }
  }

  // Send availability reminder to a specific provider
  public async sendAvailabilityReminder(
    providerId: string,
    weekStart: string,
    providerName: string,
    email: string
  ): Promise<boolean> {
    try {
      // Log the notification in the database
      const { error: logError } = await supabase
        .from('provider_availability_notifications')
        .insert({
          provider_id: providerId,
          notification_type: 'availability_reminder',
          week_start: weekStart,
          status: 'sent',
          message: `Reminder to set availability for week starting ${weekStart}`
        });

      if (logError) throw logError;

      // In a real application, you would integrate with an email service here
      // For now, we'll simulate the notification
      console.log(`📧 Availability reminder sent to ${providerName} (${email}) for week ${weekStart}`);
      
      // You could integrate with services like:
      // - SendGrid
      // - AWS SES
      // - Mailgun
      // - Twilio (for SMS)
      
      return true;
    } catch (error) {
      console.error('Error sending availability reminder:', error);
      return false;
    }
  }

  // Send bulk availability reminders
  public async sendBulkAvailabilityReminders(): Promise<{
    sent: number;
    failed: number;
    details: { provider: string; success: boolean; error?: string }[];
  }> {
    const providers = await this.getProvidersNeedingReminders();
    const results = {
      sent: 0,
      failed: 0,
      details: [] as { provider: string; success: boolean; error?: string }[]
    };

    for (const provider of providers) {
      try {
        const success = await this.sendAvailabilityReminder(
          provider.provider_id,
          provider.week_start,
          provider.provider_name,
          provider.email
        );

        if (success) {
          results.sent++;
          results.details.push({
            provider: provider.provider_name,
            success: true
          });
        } else {
          results.failed++;
          results.details.push({
            provider: provider.provider_name,
            success: false,
            error: 'Failed to send notification'
          });
        }
      } catch (error) {
        results.failed++;
        results.details.push({
          provider: provider.provider_name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  // Check if provider has availability set for upcoming weeks
  public async checkProviderAvailability(
    providerId: string,
    daysAhead: number = 15
  ): Promise<{
    hasAvailability: boolean;
    missingWeeks: string[];
    nextReminderDate: string;
  }> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);
      
      const { data: availability, error } = await supabase
        .from('provider_weekly_availability')
        .select('week_start')
        .eq('provider_id', providerId)
        .gte('week_start', futureDate.toISOString().split('T')[0]);

      if (error) throw error;

      const hasAvailability = availability && availability.length > 0;
      const missingWeeks: string[] = [];
      
      // Check for missing weeks in the next 4 weeks
      for (let i = 0; i < 4; i++) {
        const weekDate = new Date(futureDate);
        weekDate.setDate(futureDate.getDate() + (i * 7));
        const weekStart = weekDate.toISOString().split('T')[0];
        
        const hasWeek = availability?.some(a => a.week_start === weekStart);
        if (!hasWeek) {
          missingWeeks.push(weekStart);
        }
      }

      const nextReminderDate = new Date();
      nextReminderDate.setDate(nextReminderDate.getDate() + daysAhead);

      return {
        hasAvailability,
        missingWeeks,
        nextReminderDate: nextReminderDate.toISOString().split('T')[0]
      };
    } catch (error) {
      console.error('Error checking provider availability:', error);
      return {
        hasAvailability: false,
        missingWeeks: [],
        nextReminderDate: new Date().toISOString().split('T')[0]
      };
    }
  }

  // Get notification history for a provider
  public async getNotificationHistory(
    providerId: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('provider_availability_notifications')
        .select('*')
        .eq('provider_id', providerId)
        .order('sent_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notification history:', error);
      return [];
    }
  }

  // Schedule next reminder (this would typically be handled by a cron job or scheduled function)
  public async scheduleNextReminder(providerId: string): Promise<void> {
    const preferences = await this.getNotificationPreferences(providerId);
    if (!preferences || !preferences.availability_reminder_enabled) {
      return;
    }

    const nextReminderDate = new Date();
    nextReminderDate.setDate(nextReminderDate.getDate() + preferences.reminder_days_advance);

    // In a real application, you would schedule this with a job queue or cron service
    console.log(`📅 Next reminder scheduled for ${providerId} on ${nextReminderDate.toISOString()}`);
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// React hook for using notification service
export const useNotificationService = () => {
  const { toast } = useToast();
  
  // Initialize the service with toast
  React.useEffect(() => {
    notificationService.initialize(toast);
  }, [toast]);

  return {
    getNotificationPreferences: notificationService.getNotificationPreferences.bind(notificationService),
    updateNotificationPreferences: notificationService.updateNotificationPreferences.bind(notificationService),
    sendAvailabilityReminder: notificationService.sendAvailabilityReminder.bind(notificationService),
    checkProviderAvailability: notificationService.checkProviderAvailability.bind(notificationService),
    getNotificationHistory: notificationService.getNotificationHistory.bind(notificationService),
    sendBulkReminders: notificationService.sendBulkAvailabilityReminders.bind(notificationService)
  };
};

// Add React import at the top
import React from 'react';