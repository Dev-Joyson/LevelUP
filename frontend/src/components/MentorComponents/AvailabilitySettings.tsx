"use client"

import { useState, useEffect } from "react"
import { format, parse, addDays, startOfWeek, addWeeks, isSameDay } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

// Types
interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface DaySchedule {
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface SpecificDateOverride {
  date: string;
  isAvailable: boolean;
  timeSlots?: TimeSlot[];
}

interface MentorAvailability {
  mentorId: string;
  weeklySchedule: WeeklySchedule;
  dateOverrides: SpecificDateOverride[];
  sessionDurations: number[];
  bufferBetweenSessions: number;
  advanceBookingLimit: number;
  timezone: string;
}

interface AvailabilitySettingsProps {
  mentorId: string;
  initialAvailability?: MentorAvailability;
  onSave: (availability: MentorAvailability) => void;
}

// Default time slots
const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { startTime: "09:00", endTime: "10:00", isAvailable: true },
  { startTime: "10:00", endTime: "11:00", isAvailable: true },
  { startTime: "11:00", endTime: "12:00", isAvailable: true },
  { startTime: "13:00", endTime: "14:00", isAvailable: true },
  { startTime: "14:00", endTime: "15:00", isAvailable: true },
  { startTime: "15:00", endTime: "16:00", isAvailable: true },
  { startTime: "16:00", endTime: "17:00", isAvailable: true },
];

// Default day schedule
const DEFAULT_DAY_SCHEDULE: DaySchedule = {
  isAvailable: true,
  timeSlots: DEFAULT_TIME_SLOTS,
};

// Default weekend schedule
const DEFAULT_WEEKEND_SCHEDULE: DaySchedule = {
  isAvailable: false,
  timeSlots: DEFAULT_TIME_SLOTS,
};

// Default weekly schedule
const DEFAULT_WEEKLY_SCHEDULE: WeeklySchedule = {
  monday: DEFAULT_DAY_SCHEDULE,
  tuesday: DEFAULT_DAY_SCHEDULE,
  wednesday: DEFAULT_DAY_SCHEDULE,
  thursday: DEFAULT_DAY_SCHEDULE,
  friday: DEFAULT_DAY_SCHEDULE,
  saturday: DEFAULT_WEEKEND_SCHEDULE,
  sunday: DEFAULT_WEEKEND_SCHEDULE,
};

// Time options for dropdowns
const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
});

export function AvailabilitySettings({ mentorId, initialAvailability, onSave }: AvailabilitySettingsProps) {
  // Initialize state with default values or provided initial values
  const [availability, setAvailability] = useState<MentorAvailability>(
    initialAvailability || {
      mentorId,
      weeklySchedule: DEFAULT_WEEKLY_SCHEDULE,
      dateOverrides: [],
      sessionDurations: [30, 60],
      bufferBetweenSessions: 15,
      advanceBookingLimit: 30,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  );
  
  const [selectedDay, setSelectedDay] = useState<keyof WeeklySchedule>("monday");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  
  // Initialize unavailable dates from dateOverrides
  useEffect(() => {
    const dates = availability.dateOverrides
      .filter(override => !override.isAvailable)
      .map(override => new Date(override.date));
    setUnavailableDates(dates);
  }, []);
  
  // Handle day selection
  const handleDaySelect = (day: keyof WeeklySchedule) => {
    setSelectedDay(day);
  };
  
  // Handle day availability toggle
  const handleDayAvailabilityToggle = (day: keyof WeeklySchedule, isAvailable: boolean | string) => {
    const available = isAvailable === true || isAvailable === "true";
    setAvailability(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          isAvailable: available,
        },
      },
    }));
  };
  
  // Handle time slot change
  const handleTimeSlotChange = (
    day: keyof WeeklySchedule,
    index: number,
    field: keyof TimeSlot,
    value: string | boolean
  ) => {
    setAvailability(prev => {
      const updatedTimeSlots = [...prev.weeklySchedule[day].timeSlots];
      updatedTimeSlots[index] = {
        ...updatedTimeSlots[index],
        [field]: value,
      };
      
      return {
        ...prev,
        weeklySchedule: {
          ...prev.weeklySchedule,
          [day]: {
            ...prev.weeklySchedule[day],
            timeSlots: updatedTimeSlots,
          },
        },
      };
    });
  };
  
  // Add a new time slot
  const addTimeSlot = (day: keyof WeeklySchedule) => {
    setAvailability(prev => {
      const timeSlots = prev.weeklySchedule[day].timeSlots;
      const lastSlot = timeSlots[timeSlots.length - 1];
      
      // Default to 1 hour after the last slot, or 9 AM if no slots exist
      const startTime = lastSlot ? lastSlot.endTime : "09:00";
      
      // Parse the start time and add 1 hour for the end time
      const [startHour, startMinute] = startTime.split(":").map(Number);
      let endHour = startHour + 1;
      const endMinute = startMinute;
      
      // Handle day overflow
      if (endHour >= 24) {
        endHour = 23;
      }
      
      const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;
      
      const newTimeSlot: TimeSlot = {
        startTime,
        endTime,
        isAvailable: true,
      };
      
      return {
        ...prev,
        weeklySchedule: {
          ...prev.weeklySchedule,
          [day]: {
            ...prev.weeklySchedule[day],
            timeSlots: [...timeSlots, newTimeSlot],
          },
        },
      };
    });
  };
  
  // Remove a time slot
  const removeTimeSlot = (day: keyof WeeklySchedule, index: number) => {
    setAvailability(prev => {
      const updatedTimeSlots = prev.weeklySchedule[day].timeSlots.filter((_, i) => i !== index);
      
      return {
        ...prev,
        weeklySchedule: {
          ...prev.weeklySchedule,
          [day]: {
            ...prev.weeklySchedule[day],
            timeSlots: updatedTimeSlots,
          },
        },
      };
    });
  };
  
  // Handle date selection for unavailable dates
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Check if date is already selected
    const isAlreadySelected = unavailableDates.some(d => isSameDay(d, date));
    
    if (isAlreadySelected) {
      // Remove date from unavailable dates
      setUnavailableDates(prev => prev.filter(d => !isSameDay(d, date)));
      
      // Remove from dateOverrides
      setAvailability(prev => ({
        ...prev,
        dateOverrides: prev.dateOverrides.filter(
          override => override.date !== format(date, "yyyy-MM-dd")
        ),
      }));
    } else {
      // Add date to unavailable dates
      setUnavailableDates(prev => [...prev, date]);
      
      // Add to dateOverrides
      setAvailability(prev => ({
        ...prev,
        dateOverrides: [
          ...prev.dateOverrides,
          {
            date: format(date, "yyyy-MM-dd"),
            isAvailable: false,
          },
        ],
      }));
    }
    
    setSelectedDate(undefined);
  };
  
  // Handle session duration change
  const handleSessionDurationChange = (duration: number, isChecked: boolean | string) => {
    const checked = isChecked === true || isChecked === "true";
    setAvailability(prev => ({
      ...prev,
      sessionDurations: checked
        ? [...prev.sessionDurations, duration].sort((a, b) => a - b)
        : prev.sessionDurations.filter(d => d !== duration),
    }));
  };
  
  // Handle buffer time change
  const handleBufferTimeChange = (value: string) => {
    const bufferTime = parseInt(value, 10);
    if (!isNaN(bufferTime) && bufferTime >= 0) {
      setAvailability(prev => ({
        ...prev,
        bufferBetweenSessions: bufferTime,
      }));
    }
  };
  
  // Handle advance booking limit change
  const handleAdvanceBookingLimitChange = (value: string) => {
    const days = parseInt(value, 10);
    if (!isNaN(days) && days > 0) {
      setAvailability(prev => ({
        ...prev,
        advanceBookingLimit: days,
      }));
    }
  };
  
  // Handle timezone change
  const handleTimezoneChange = (value: string) => {
    setAvailability(prev => ({
      ...prev,
      timezone: value,
    }));
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // Validate the form
    const isValid = validateAvailability(availability);
    
    if (isValid) {
      onSave(availability);
      toast.success("Availability settings saved successfully");
    }
  };
  
  // Validate availability settings
  const validateAvailability = (data: MentorAvailability): boolean => {
    // Check if at least one day is available
    const hasAvailableDay = Object.values(data.weeklySchedule).some(day => day.isAvailable);
    
    if (!hasAvailableDay) {
      toast.error("Please make at least one day available");
      return false;
    }
    
    // Check if at least one session duration is selected
    if (data.sessionDurations.length === 0) {
      toast.error("Please select at least one session duration");
      return false;
    }
    
    // Validate time slots for each available day
    for (const [day, schedule] of Object.entries(data.weeklySchedule)) {
      if (schedule.isAvailable) {
        // Check if there are any time slots
        if (schedule.timeSlots.length === 0) {
          toast.error(`Please add at least one time slot for ${day}`);
          return false;
        }
        
        // Check for overlapping time slots
        for (let i = 0; i < schedule.timeSlots.length; i++) {
          for (let j = i + 1; j < schedule.timeSlots.length; j++) {
            const slot1 = schedule.timeSlots[i];
            const slot2 = schedule.timeSlots[j];
            
            // Parse times
            const slot1Start = parseTimeString(slot1.startTime);
            const slot1End = parseTimeString(slot1.endTime);
            const slot2Start = parseTimeString(slot2.startTime);
            const slot2End = parseTimeString(slot2.endTime);
            
            // Check for overlap
            if (
              (slot1Start <= slot2Start && slot2Start < slot1End) ||
              (slot2Start <= slot1Start && slot1Start < slot2End)
            ) {
              toast.error(`Overlapping time slots detected on ${day}`);
              return false;
            }
          }
        }
      }
    }
    
    return true;
  };
  
  // Helper function to parse time string to minutes since midnight
  const parseTimeString = (timeString: string): number => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };
  
  // Format time for display
  const formatTime = (timeString: string): string => {
    try {
      const [hours, minutes] = timeString.split(":").map(Number);
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
    } catch (error) {
      return timeString;
    }
  };
  
  // Get day name for display
  const getDayName = (day: keyof WeeklySchedule): string => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };
  
  // Available timezones
  const timezones = Intl.supportedValuesOf("timeZone");
  
  return (
    <div className="space-y-8">
      <Tabs defaultValue="weekly">
        <TabsList>
          <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="dates">Specific Dates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        {/* Weekly Schedule Tab */}
        <TabsContent value="weekly" className="space-y-6">
          <div className="grid grid-cols-7 gap-2">
            {Object.keys(availability.weeklySchedule).map((day) => (
              <Button
                key={day}
                variant={selectedDay === day ? "default" : "outline"}
                className={`${
                  availability.weeklySchedule[day as keyof WeeklySchedule].isAvailable
                    ? ""
                    : "opacity-50"
                }`}
                onClick={() => handleDaySelect(day as keyof WeeklySchedule)}
              >
                {getDayName(day as keyof WeeklySchedule).substring(0, 3)}
              </Button>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{getDayName(selectedDay)}</span>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={availability.weeklySchedule[selectedDay].isAvailable}
                    onCheckedChange={(checked) => handleDayAvailabilityToggle(selectedDay, checked)}
                  />
                  <Label>Available</Label>
                </div>
              </CardTitle>
              <CardDescription>
                Set your availability for {getDayName(selectedDay)}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {availability.weeklySchedule[selectedDay].isAvailable ? (
                <div className="space-y-4">
                  {availability.weeklySchedule[selectedDay].timeSlots.map((slot, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="grid grid-cols-2 gap-4 flex-1">
                        <div className="space-y-2">
                          <Label>Start Time</Label>
                          <Select
                            value={slot.startTime}
                            onValueChange={(value) =>
                              handleTimeSlotChange(selectedDay, index, "startTime", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue>{formatTime(slot.startTime)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_OPTIONS.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {formatTime(time)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>End Time</Label>
                          <Select
                            value={slot.endTime}
                            onValueChange={(value) =>
                              handleTimeSlotChange(selectedDay, index, "endTime", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue>{formatTime(slot.endTime)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_OPTIONS.map((time) => (
                                <SelectItem
                                  key={time}
                                  value={time}
                                  disabled={time <= slot.startTime}
                                >
                                  {formatTime(time)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeTimeSlot(selectedDay, index)}
                      >
                        &times;
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={() => addTimeSlot(selectedDay)}
                    className="w-full"
                  >
                    Add Time Slot
                  </Button>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-500">
                    This day is marked as unavailable. Toggle the switch above to set availability.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Specific Dates Tab */}
        <TabsContent value="dates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Unavailable Dates</CardTitle>
              <CardDescription>
                Mark specific dates when you're unavailable (e.g., vacations, holidays)
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Calendar
                    mode="multiple"
                    selected={unavailableDates}
                    onSelect={(dates) => {
                      if (dates && dates.length > 0) {
                        // Find the newly selected date (the one that's in dates but not in unavailableDates)
                        const newDate = dates.find(
                          date => !unavailableDates.some(d => isSameDay(d, date))
                        );
                        
                        if (newDate) {
                          handleDateSelect(newDate);
                        } else if (unavailableDates.length > dates.length) {
                          // A date was removed
                          const removedDate = unavailableDates.find(
                            date => !dates.some(d => isSameDay(d, date))
                          );
                          if (removedDate) {
                            handleDateSelect(removedDate);
                          }
                        }
                      }
                    }}
                    className="rounded-md border"
                    disabled={(date) => date < new Date()}
                  />
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Selected Unavailable Dates</h3>
                  
                  {unavailableDates.length > 0 ? (
                    <div className="space-y-2">
                      {unavailableDates
                        .sort((a, b) => a.getTime() - b.getTime())
                        .map((date, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                          >
                            <span>{format(date, "MMMM d, yyyy")}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDateSelect(date)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      No unavailable dates selected. Click on dates in the calendar to mark them as
                      unavailable.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Settings</CardTitle>
              <CardDescription>Configure your session preferences</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Session Durations</h3>
                <p className="text-sm text-gray-500">
                  Select the session durations you want to offer
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[15, 30, 45, 60, 90, 120].map((duration) => (
                    <div key={duration} className="flex items-center space-x-2">
                      <Checkbox
                        id={`duration-${duration}`}
                        checked={availability.sessionDurations.includes(duration)}
                        onCheckedChange={(checked) =>
                          handleSessionDurationChange(duration, checked === true)
                        }
                      />
                      <Label htmlFor={`duration-${duration}`}>{duration} minutes</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="buffer-time">Buffer Time Between Sessions (minutes)</Label>
                  <Input
                    id="buffer-time"
                    type="number"
                    min="0"
                    value={availability.bufferBetweenSessions}
                    onChange={(e) => handleBufferTimeChange(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Add buffer time between sessions to prepare for the next one
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="advance-booking">Advance Booking Limit (days)</Label>
                  <Input
                    id="advance-booking"
                    type="number"
                    min="1"
                    value={availability.advanceBookingLimit}
                    onChange={(e) => handleAdvanceBookingLimitChange(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    How far in advance students can book sessions with you
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Your Timezone</Label>
                <Select
                  value={availability.timezone}
                  onValueChange={handleTimezoneChange}
                >
                  <SelectTrigger>
                    <SelectValue>{availability.timezone}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {timezones.map((timezone) => (
                      <SelectItem key={timezone} value={timezone}>
                        {timezone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  All times will be displayed in this timezone for you
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-4">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSubmit}>Save Availability</Button>
      </div>
    </div>
  );
}