import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, Mail, MessageSquare, Calendar, History } from 'lucide-react';
import { useNotificationService } from '@/services/NotificationService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NotificationSettingsProps {
  providerId: string;
}

interface NotificationPreferences {
  availability_reminder_enabled: boolean;
  reminder_days_advance: number;
  notification_time: string;
  email_notifications: boolean;
  sms_notifications: boolean;
}

interface NotificationHistory {
  id: string;
  notification_type: string;
  week_start: string;
  status: string;
  message: string;
  sent_at: string;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ providerId }) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    availability_reminder_enabled: true,
    reminder_days_advance: 15,
    notification_time: '09:00',
    email_notifications: true,
    sms_notifications: false
  });
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    hasAvailability: boolean;
    missingWeeks: string[];
    nextReminderDate: string;
  } | null>(null);

  const { 
    getNotificationPreferences, 
    updateNotificationPreferences,
    checkProviderAvailability,
    getNotificationHistory
  } = useNotificationService();
  const { toast } = useToast();

  useEffect(() => {
    loadNotificationData();
  }, [providerId]);

  const loadNotificationData = async () => {
    setLoading(true);
    try {
      // Load preferences
      const prefs = await getNotificationPreferences(providerId);
      if (prefs) {
        setPreferences({
          availability_reminder_enabled: prefs.availability_reminder_enabled,
          reminder_days_advance: prefs.reminder_days_advance,
          notification_time: prefs.notification_time,
          email_notifications: prefs.email_notifications,
          sms_notifications: prefs.sms_notifications
        });
      }

      // Load availability status
      const status = await checkProviderAvailability(providerId, preferences.reminder_days_advance);
      setAvailabilityStatus(status);

      // Load notification history
      const historyData = await getNotificationHistory(providerId, 5);
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading notification data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const success = await updateNotificationPreferences(providerId, preferences);
      if (success) {
        // Reload availability status with new reminder days
        const status = await checkProviderAvailability(providerId, preferences.reminder_days_advance);
        setAvailabilityStatus(status);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'sent': return 'default';
      case 'failed': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Availability Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Availability Status
          </CardTitle>
          <CardDescription>
            Current status of your upcoming availability schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availabilityStatus && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Next {preferences.reminder_days_advance} days:</span>
                <Badge variant={availabilityStatus.hasAvailability ? 'default' : 'destructive'}>
                  {availabilityStatus.hasAvailability ? 'Availability Set' : 'Missing Availability'}
                </Badge>
              </div>
              
              {availabilityStatus.missingWeeks.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Missing availability for weeks:</p>
                  <div className="flex flex-wrap gap-2">
                    {availabilityStatus.missingWeeks.map((week, index) => (
                      <Badge key={index} variant="outline">
                        {formatDate(week)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-sm text-muted-foreground">
                Next reminder: {formatDate(availabilityStatus.nextReminderDate)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Configure how and when you receive availability reminders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Reminders */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Availability Reminders</Label>
              <div className="text-sm text-muted-foreground">
                Receive reminders to set your availability
              </div>
            </div>
            <Switch
              checked={preferences.availability_reminder_enabled}
              onCheckedChange={(checked) => 
                handlePreferenceChange('availability_reminder_enabled', checked)
              }
            />
          </div>

          {preferences.availability_reminder_enabled && (
            <>
              {/* Reminder Days Advance */}
              <div className="space-y-2">
                <Label htmlFor="reminder-days">Reminder Days in Advance</Label>
                <Select
                  value={preferences.reminder_days_advance.toString()}
                  onValueChange={(value) => 
                    handlePreferenceChange('reminder_days_advance', parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="10">10 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="15">15 days</SelectItem>
                    <SelectItem value="21">21 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground">
                  You'll be reminded {preferences.reminder_days_advance} days before you need to set availability
                </div>
              </div>

              {/* Notification Time */}
              <div className="space-y-2">
                <Label htmlFor="notification-time">Preferred Notification Time</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="notification-time"
                    type="time"
                    value={preferences.notification_time}
                    onChange={(e) => 
                      handlePreferenceChange('notification_time', e.target.value)
                    }
                    className="w-32"
                  />
                </div>
              </div>

              {/* Notification Methods */}
              <div className="space-y-4">
                <Label className="text-base">Notification Methods</Label>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-muted-foreground">Receive reminders via email</div>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.email_notifications}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('email_notifications', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">SMS Notifications</div>
                      <div className="text-sm text-muted-foreground">Receive reminders via text message</div>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.sms_notifications}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange('sms_notifications', checked)
                    }
                  />
                </div>
              </div>
            </>
          )}

          <Button 
            onClick={handleSavePreferences} 
            disabled={saving}
            className="w-full"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </CardContent>
      </Card>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Notifications
          </CardTitle>
          <CardDescription>
            Your recent availability reminder history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{notification.message}</div>
                    <div className="text-sm text-muted-foreground">
                      Week of {formatDate(notification.week_start)} • {formatDate(notification.sent_at)}
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(notification.status)}>
                    {notification.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications sent yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;