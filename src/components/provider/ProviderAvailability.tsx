
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ToggleLeft, ToggleRight, Save, Plus, Trash2, CalendarDays, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { WeeklyScheduleSelector } from './WeeklyScheduleSelector';
import NotificationSettings from './NotificationSettings';

export const ProviderAvailability = () => {
  const [emergencyOffline, setEmergencyOffline] = useState(false);
  const [activeTab, setActiveTab] = useState('weekly-schedule');
  const { user } = useAuth();
  const { toast } = useToast();
  const { availability, updateProviderAvailability, refetch } = useTimeSlots();
  
  const [weekDays, setWeekDays] = useState([
    { id: 0, day: 'Sunday', enabled: false, start: '10:00', end: '15:00' },
    { id: 1, day: 'Monday', enabled: true, start: '09:00', end: '17:00' },
    { id: 2, day: 'Tuesday', enabled: true, start: '09:00', end: '17:00' },
    { id: 3, day: 'Wednesday', enabled: true, start: '09:00', end: '17:00' },
    { id: 4, day: 'Thursday', enabled: true, start: '09:00', end: '17:00' },
    { id: 5, day: 'Friday', enabled: true, start: '09:00', end: '17:00' },
    { id: 6, day: 'Saturday', enabled: false, start: '10:00', end: '15:00' },
  ]);

  // Load existing availability data
  useEffect(() => {
    if (availability && availability.length > 0) {
      setWeekDays(prev => prev.map(day => {
        const existing = availability.find(a => a.day_of_week === day.id);
        if (existing) {
          return {
            ...day,
            enabled: existing.is_available,
            start: existing.start_time,
            end: existing.end_time
          };
        }
        return day;
      }));
    }
  }, [availability]);

  const updateScheduleDay = (dayId: number, field: string, value: any) => {
    setWeekDays(prev => prev.map(day => 
      day.id === dayId ? { ...day, [field]: value } : day
    ));
  };

  const saveAvailability = async () => {
    try {
      for (const day of weekDays) {
        await updateProviderAvailability(
          day.id, 
          day.start, 
          day.end, 
          day.enabled,
          30 // Default 30-minute slots
        );
      }
      toast({
        title: 'Success',
        description: 'Availability schedule updated successfully',
      });
      refetch();
    } catch (error) {
      console.error('Error saving availability:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-h2 font-bold text-text-primary">Schedule & Availability</h2>
            <p className="text-body text-text-muted mt-1">
              Manage your working hours, weekly schedules, and availability settings
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-small text-text-muted">Status</p>
              <p className={`text-h4 font-bold ${
                emergencyOffline ? 'text-error' : 'text-success'
              }`}>
                {emergencyOffline ? 'Offline' : 'Online'}
              </p>
            </div>
            <Button
              variant={emergencyOffline ? 'destructive' : 'outline'}
              onClick={() => setEmergencyOffline(!emergencyOffline)}
              className="min-w-[120px]"
            >
              {emergencyOffline ? 'Go Online' : 'Go Offline'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weekly-schedule" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Weekly Schedule
          </TabsTrigger>
          <TabsTrigger value="default-hours" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Default Hours
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Weekly Schedule Tab */}
        <TabsContent value="weekly-schedule" className="space-y-6">
          <WeeklyScheduleSelector 
            onScheduleUpdate={(schedules) => {
              toast({
                title: 'Schedule Updated',
                description: `Updated availability for ${schedules.length} week(s)`,
              });
              refetch();
            }}
          />
        </TabsContent>

        {/* Default Hours Tab */}
        <TabsContent value="default-hours" className="space-y-6">
          <div className="bg-surface rounded-2xl border border-border">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-h3 font-bold text-text-primary">Default Weekly Hours</h3>
                  <p className="text-body text-text-muted mt-1">
                    Set your standard working hours for each day of the week
                  </p>
                </div>
                <Button onClick={saveAvailability} variant="default" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {weekDays.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-4 bg-background rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary">{schedule.day}</h4>
                      <p className="text-small text-text-muted">
                        {schedule.enabled ? `${schedule.start} - ${schedule.end}` : 'Closed'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {schedule.enabled && (
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-text-muted" />
                          <Input
                            type="time"
                            value={schedule.start}
                            onChange={(e) => updateScheduleDay(schedule.id, 'start', e.target.value)}
                            className="w-24 text-small"
                          />
                        </div>
                        <span className="text-text-muted">to</span>
                        <Input
                          type="time"
                          value={schedule.end}
                          onChange={(e) => updateScheduleDay(schedule.id, 'end', e.target.value)}
                          className="w-24 text-small"
                        />
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateScheduleDay(schedule.id, 'enabled', !schedule.enabled)}
                      className={schedule.enabled ? 'border-success text-success' : 'border-error text-error'}
                    >
                      {schedule.enabled ? 'Available' : 'Closed'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <NotificationSettings providerId={user?.id || ''} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
