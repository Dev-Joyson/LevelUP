"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  date: string; // Format: YYYY-MM-DD
  timeSlots: TimeSlot[];
}

interface SimpleSchedulerProps {
  initialSchedule?: DaySchedule[];
  onSave?: (schedule: DaySchedule[]) => void;
}

export function SimpleScheduler({ initialSchedule = [], onSave }: SimpleSchedulerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  // When a date is selected, load its time slots
  useEffect(() => {
    if (selectedDate) {
      const daySchedule = schedule.find(day => day.date === selectedDate);
      setTimeSlots(daySchedule?.timeSlots || []);
    } else {
      setTimeSlots([]);
    }
  }, [selectedDate, schedule]);
  
  // Generate days for the current month
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const days = [];
    
    // Add days from previous month
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = prevMonthDays - daysFromPrevMonth + 1; i <= prevMonthDays; i++) {
      const date = new Date(year, month - 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        dateString: formatDateString(date),
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, new Date()),
        dateString: formatDateString(date),
      });
    }
    
    // Add days from next month to complete the grid (6 rows x 7 days = 42)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, new Date()),
        dateString: formatDateString(date),
      });
    }
    
    return days;
  };
  
  // Check if a date has scheduled time slots
  const hasSchedule = (dateString: string) => {
    return schedule.some(day => day.date === dateString && day.timeSlots.length > 0);
  };
  
  // Format date as YYYY-MM-DD
  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };
  
  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  // Handle date selection
  const handleDateSelect = (dateString: string) => {
    setSelectedDate(dateString);
  };
  
  // Add a new time slot
  const addTimeSlot = () => {
    const newTimeSlot: TimeSlot = {
      id: `slot-${Date.now()}`,
      startTime: "09:00",
      endTime: "10:00",
    };
    
    setTimeSlots([...timeSlots, newTimeSlot]);
  };
  
  // Remove a time slot
  const removeTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };
  
  // Update a time slot
  const updateTimeSlot = (id: string, field: keyof TimeSlot, value: string) => {
    setTimeSlots(
      timeSlots.map(slot => (slot.id === id ? { ...slot, [field]: value } : slot))
    );
  };
  
  // Save the current time slots for the selected date
  const saveTimeSlots = () => {
    if (!selectedDate) return;
    
    const updatedSchedule = [...schedule];
    const existingIndex = updatedSchedule.findIndex(day => day.date === selectedDate);
    
    if (existingIndex >= 0) {
      updatedSchedule[existingIndex].timeSlots = timeSlots;
    } else {
      updatedSchedule.push({
        date: selectedDate,
        timeSlots,
      });
    }
    
    setSchedule(updatedSchedule);
    
    if (onSave) {
      onSave(updatedSchedule);
    }
  };
  
  // Generate time options for dropdowns (30-minute intervals)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        options.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return options;
  };
  
  const timeOptions = generateTimeOptions();
  
  // Format time for display (24h to 12h)
  const formatTimeForDisplay = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Calendar */}
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                Previous
              </Button>
              <CardTitle>
                {currentMonth.toLocaleDateString(undefined, {
                  month: 'long',
                  year: 'numeric',
                })}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                Next
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center font-medium text-sm py-1">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth().map((day, index) => (
                <div
                  key={index}
                  className={`
                    aspect-square p-1 text-center cursor-pointer border rounded-md flex flex-col items-center justify-center
                    ${!day.isCurrentMonth ? 'text-gray-400' : ''}
                    ${day.isToday ? 'bg-blue-100' : ''}
                    ${selectedDate === day.dateString ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                    ${hasSchedule(day.dateString) ? 'font-bold' : ''}
                    hover:border-blue-300
                  `}
                  onClick={() => handleDateSelect(day.dateString)}
                >
                  <span className="text-sm">{day.date.getDate()}</span>
                  {hasSchedule(day.dateString) && (
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Time Slots */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>
              {selectedDate
                ? `Time Slots for ${formatDateForDisplay(selectedDate)}`
                : 'Select a date to manage time slots'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="space-y-4">
                {timeSlots.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No time slots added yet. Click "Add Time Slot" to create one.
                  </p>
                ) : (
                  timeSlots.map((slot, index) => (
                    <div key={slot.id} className="flex items-center gap-2">
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        <div className="space-y-1">
                          <Label htmlFor={`start-${slot.id}`}>Start Time</Label>
                          <select
                            id={`start-${slot.id}`}
                            value={slot.startTime}
                            onChange={(e) => updateTimeSlot(slot.id, 'startTime', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            {timeOptions.map((time) => (
                              <option key={time} value={time}>
                                {formatTimeForDisplay(time)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`end-${slot.id}`}>End Time</Label>
                          <select
                            id={`end-${slot.id}`}
                            value={slot.endTime}
                            onChange={(e) => updateTimeSlot(slot.id, 'endTime', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            {timeOptions
                              .filter((time) => time > slot.startTime)
                              .map((time) => (
                                <option key={time} value={time}>
                                  {formatTimeForDisplay(time)}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="mt-6"
                        onClick={() => removeTimeSlot(slot.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                )}
                
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={addTimeSlot}>
                    Add Time Slot
                  </Button>
                  <Button onClick={saveTimeSlots}>Save</Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Please select a date from the calendar to manage time slots
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Schedule Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Your Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {schedule.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No schedule set yet. Select dates and add time slots to create your schedule.
            </p>
          ) : (
            <div className="space-y-4">
              {schedule
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((day) => (
                  <div key={day.date} className="border-b pb-4 last:border-0">
                    <h3 className="font-medium mb-2">{formatDateForDisplay(day.date)}</h3>
                    {day.timeSlots.length === 0 ? (
                      <p className="text-gray-500">No time slots available</p>
                    ) : (
                      <ul className="space-y-1">
                        {day.timeSlots.map((slot) => (
                          <li key={slot.id} className="text-sm">
                            {formatTimeForDisplay(slot.startTime)} - {formatTimeForDisplay(slot.endTime)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
