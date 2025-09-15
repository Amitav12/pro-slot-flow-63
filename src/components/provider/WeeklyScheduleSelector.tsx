import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Save, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface WeekSchedule {
  weekStart: Date;
  weekEnd: Date;
  days: {
    date: Date;
    dayName: string;
    enabled: boolean;
    startTime: string;
    endTime: string;
    slots: string[];
  }[];
}

interface WeeklyScheduleSelectorProps {
  onScheduleUpdate?: (schedule: WeekSchedule[]) => void;
}

export const WeeklyScheduleSelector: React.FC<WeeklyScheduleSelectorProps> = ({ 
  onScheduleUpdate 
}) => {
  const [selectedWeeks, setSelectedWeeks] = useState<WeekSchedule[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Get the start of the week (Monday)
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // Get the end of the week (Sunday)
  const getWeekEnd = (date: Date): Date => {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
  };

  // Generate weeks for the current month view
  const generateWeeksForMonth = (month: Date): Date[] => {
    const weeks: Date[] = [];
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    const currentWeek = getWeekStart(firstDay);
    
    while (currentWeek <= lastDay) {
      weeks.push(new Date(currentWeek));
      currentWeek.setDate(currentWeek.getDate() + 7);
    }
    
    return weeks;
  };

  // Check if a week can be selected (15 days in advance)
  const canSelectWeek = (weekStart: Date): boolean => {
    const today = new Date();
    const fifteenDaysFromNow = new Date(today);
    fifteenDaysFromNow.setDate(today.getDate() + 15);
    return weekStart >= fifteenDaysFromNow;
  };

  // Create default week schedule
  const createDefaultWeekSchedule = (weekStart: Date): WeekSchedule => {
    const days = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      
      days.push({
        date,
        dayName: dayNames[i],
        enabled: i < 5, // Monday to Friday enabled by default
        startTime: '09:00',
        endTime: '17:00',
        slots: ['09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00']
      });
    }
    
    return {
      weekStart,
      weekEnd: getWeekEnd(weekStart),
      days
    };
  };

  // Toggle week selection
  const toggleWeekSelection = (weekStart: Date) => {
    if (!canSelectWeek(weekStart)) {
      toast({
        title: 'Cannot Select Week',
        description: 'You can only schedule availability 15 days in advance.',
        variant: 'destructive'
      });
      return;
    }

    const weekKey = weekStart.toISOString();
    const existingIndex = selectedWeeks.findIndex(w => 
      w.weekStart.toISOString() === weekKey
    );

    if (existingIndex >= 0) {
      // Remove week
      const newWeeks = selectedWeeks.filter((_, index) => index !== existingIndex);
      setSelectedWeeks(newWeeks);
    } else {
      // Add week
      const newWeek = createDefaultWeekSchedule(weekStart);
      setSelectedWeeks([...selectedWeeks, newWeek]);
    }
  };

  // Update day schedule within a week
  const updateDaySchedule = (weekIndex: number, dayIndex: number, field: string, value: any) => {
    const newWeeks = [...selectedWeeks];
    newWeeks[weekIndex].days[dayIndex] = {
      ...newWeeks[weekIndex].days[dayIndex],
      [field]: value
    };
    setSelectedWeeks(newWeeks);
  };

  // Save schedule to database
  const saveSchedule = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Save each week's schedule
      for (const week of selectedWeeks) {
        for (const day of week.days) {
          if (day.enabled) {
            const { error } = await supabase
              .from('provider_weekly_availability')
              .upsert({
                provider_id: user.id,
                week_start: week.weekStart.toISOString().split('T')[0],
                week_end: new Date(week.weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                availability_data: {
                  [day.date.toISOString().split('T')[0]]: {
                    day_of_week: day.date.getDay(),
                    start_time: day.startTime,
                    end_time: day.endTime,
                    is_available: true,
                    time_slots: day.slots
                  }
                },
                is_confirmed: true
              });
            
            if (error) throw error;
          }
        }
      }
      
      toast({
        title: 'Success',
        description: 'Weekly schedule saved successfully!',
      });
      
      onScheduleUpdate?.(selectedWeeks);
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to save schedule. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const weeks = generateWeeksForMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Schedule Selector
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select weeks to set your availability. You can schedule up to 15 days in advance.
          </p>
        </CardHeader>
      </Card>

      {/* Month Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold">{monthName}</h3>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Week Selection Grid */}
          <div className="space-y-2">
            {weeks.map((weekStart, index) => {
              const weekEnd = getWeekEnd(weekStart);
              const isSelected = selectedWeeks.some(w => 
                w.weekStart.toISOString() === weekStart.toISOString()
              );
              const canSelect = canSelectWeek(weekStart);
              
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected 
                      ? 'border-primary bg-primary/10' 
                      : canSelect 
                        ? 'border-border hover:border-primary/50' 
                        : 'border-muted bg-muted/50 cursor-not-allowed'
                  }`}
                  onClick={() => toggleWeekSelection(weekStart)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        Week of {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                        {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!canSelect && (
                        <Badge variant="secondary">Too Early</Badge>
                      )}
                      {isSelected && (
                        <Badge variant="default">Selected</Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Weeks Configuration */}
      {selectedWeeks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Configure Selected Weeks</h3>
            <Button onClick={saveSchedule} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Schedule'}
            </Button>
          </div>

          {selectedWeeks.map((week, weekIndex) => (
            <Card key={week.weekStart.toISOString()}>
              <CardHeader>
                <CardTitle className="text-base">
                  Week of {week.weekStart.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {week.days.map((day, dayIndex) => (
                    <div key={dayIndex} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={day.enabled}
                          onChange={(e) => updateDaySchedule(weekIndex, dayIndex, 'enabled', e.target.checked)}
                          className="rounded"
                        />
                        <div>
                          <p className="font-medium">{day.dayName}</p>
                          <p className="text-sm text-muted-foreground">
                            {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      
                      {day.enabled && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <Input
                            type="time"
                            value={day.startTime}
                            onChange={(e) => updateDaySchedule(weekIndex, dayIndex, 'startTime', e.target.value)}
                            className="w-24"
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input
                            type="time"
                            value={day.endTime}
                            onChange={(e) => updateDaySchedule(weekIndex, dayIndex, 'endTime', e.target.value)}
                            className="w-24"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Notification Reminder */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <Bell className="h-4 w-4" />
            <p className="text-sm">
              <strong>Reminder:</strong> You'll receive notifications every 15 days to update your availability schedule.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};