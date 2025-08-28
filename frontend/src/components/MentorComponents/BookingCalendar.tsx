"use client"

import { useState, useEffect } from "react"
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isBefore, isAfter, addWeeks } from "date-fns"
import { ChevronLeft, ChevronRight, Clock, Calendar, Info, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import axios from "axios"
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

interface BookingSlot {
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
}

interface BookingCalendarProps {
  mentorId: string;
  mentorName: string;
  sessionTypes: {
    id: string;
    name: string;
    duration: number; // in minutes
    price: number;
  }[];
  selectedSessionType: string;
  availability: MentorAvailability;
  onSlotSelect: (slot: BookingSlot) => void;
  existingBookings?: {
    date: string;
    startTime: string;
    endTime: string;
  }[];
}

export function BookingCalendar({
  mentorId,
  mentorName,
  sessionTypes,
  selectedSessionType,
  availability,
  onSlotSelect,
  existingBookings = []
}: BookingCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<{ [date: string]: string[] }>({});
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  
  // Selected session type details
  const sessionType = sessionTypes.find(type => type.id === selectedSessionType);
  const sessionDuration = sessionType?.duration || 60;
  
  // Calculate available slots based on mentor availability and existing bookings
  useEffect(() => {
    calculateAvailableSlots();
  }, [currentWeekStart, availability, existingBookings, sessionDuration]);
  
  const calculateAvailableSlots = () => {
    const slots: { [date: string]: string[] } = {};
    const currentDate = new Date();
    const maxBookingDate = addDays(currentDate, availability.advanceBookingLimit);
    
    // For each day in the current week view
    for (let i = 0; i < 7; i++) {
      const date = addDays(currentWeekStart, i);
      const dateString = format(date, "yyyy-MM-dd");
      
      // Skip if date is in the past or beyond advance booking limit
      if (isBefore(date, currentDate) || isAfter(date, maxBookingDate)) {
        slots[dateString] = [];
        continue;
      }
      
      // Check if date has an override
      const dateOverride = availability.dateOverrides.find(
        override => override.date === dateString
      );
      
      // If date is marked as unavailable, skip
      if (dateOverride && !dateOverride.isAvailable) {
        slots[dateString] = [];
        continue;
      }
      
      // Get day of week
      const dayOfWeek = format(date, "EEEE").toLowerCase() as keyof WeeklySchedule;
      
      // Get schedule for this day
      const daySchedule = dateOverride?.timeSlots || availability.weeklySchedule[dayOfWeek].timeSlots;
      
      // If day is not available, skip
      if (!availability.weeklySchedule[dayOfWeek].isAvailable && !dateOverride) {
        slots[dateString] = [];
        continue;
      }
      
      // Calculate available time slots for this day
      const availableTimesForDay: string[] = [];
      
      for (const slot of daySchedule) {
        if (!slot.isAvailable) continue;
        
        // Parse start and end times
        const [startHour, startMinute] = slot.startTime.split(":").map(Number);
        const [endHour, endMinute] = slot.endTime.split(":").map(Number);
        
        // Convert to minutes since midnight
        const slotStartMinutes = startHour * 60 + startMinute;
        const slotEndMinutes = endHour * 60 + endMinute;
        
        // Check if slot is long enough for the selected session duration
        if (slotEndMinutes - slotStartMinutes < sessionDuration) {
          continue;
        }
        
        // Generate potential start times at 15-minute intervals
        for (let minutes = slotStartMinutes; minutes <= slotEndMinutes - sessionDuration; minutes += 15) {
          const hour = Math.floor(minutes / 60);
          const minute = minutes % 60;
          const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
          
          // Calculate end time
          const endMinutes = minutes + sessionDuration;
          const endHour = Math.floor(endMinutes / 60);
          const endMinute = endMinutes % 60;
          const endTimeString = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;
          
          // Check if this time slot conflicts with existing bookings
          const hasConflict = existingBookings.some(booking => {
            if (booking.date !== dateString) return false;
            
            const bookingStart = booking.startTime;
            const bookingEnd = booking.endTime;
            
            // Check for overlap
            return (
              (timeString < bookingEnd && endTimeString > bookingStart) ||
              (timeString === bookingStart && endTimeString === bookingEnd)
            );
          });
          
          if (!hasConflict) {
            availableTimesForDay.push(timeString);
          }
        }
      }
      
      slots[dateString] = availableTimesForDay;
    }
    
    setAvailableSlots(slots);
  };
  
  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newWeekStart = addDays(currentWeekStart, -7);
    if (!isBefore(newWeekStart, new Date())) {
      setCurrentWeekStart(newWeekStart);
      setSelectedDate(null);
      setSelectedTimeSlot(null);
    }
  };
  
  // Navigate to next week
  const goToNextWeek = () => {
    const newWeekStart = addDays(currentWeekStart, 7);
    const maxBookingDate = addDays(new Date(), availability.advanceBookingLimit);
    
    if (!isAfter(newWeekStart, maxBookingDate)) {
      setCurrentWeekStart(newWeekStart);
      setSelectedDate(null);
      setSelectedTimeSlot(null);
    }
  };
  
  // Get days for the current week view
  const getDaysInView = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(currentWeekStart, i));
    }
    return days;
  };
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };
  
  // Handle time slot selection
  const handleTimeSlotSelect = (time: string) => {
    setSelectedTimeSlot(time);
  };
  
  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTimeSlot || !sessionType) return;
    
    try {
      setIsBooking(true);
      
      // Calculate end time
      const [startHour, startMinute] = selectedTimeSlot.split(":").map(Number);
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = startMinutes + sessionDuration;
      const endHour = Math.floor(endMinutes / 60);
      const endMinute = endMinutes % 60;
      const endTimeString = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;
      
      // Prepare booking data
      const bookingData = {
        mentorId: mentorId,
        date: format(selectedDate, "yyyy-MM-dd"),
        startTime: selectedTimeSlot,
        endTime: endTimeString,
        sessionTypeId: sessionType.id,
        sessionTypeName: sessionType.name,
        duration: sessionType.duration,
        price: sessionType.price
      };
      
      console.log('Booking session with data:', bookingData);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Please log in to book a session");
        return;
      }
      
      // Make API call
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const response = await axios.post(
        `${API_BASE_URL}/api/student/book-mentor-session`,
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Session booked successfully:', response.data);
      
      // Show success message
      toast.success("Session booked successfully!");
      setBookingSuccess(true);
      
      // Call the original onSlotSelect for any parent component handling
      const bookingSlot: BookingSlot = {
        date: selectedDate,
        startTime: selectedTimeSlot,
        endTime: endTimeString,
        duration: sessionDuration
      };
      onSlotSelect(bookingSlot);
      
      // Reset selections
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      
    } catch (error: any) {
      console.error('Error booking session:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to book session. Please try again.");
      }
    } finally {
      setIsBooking(false);
    }
  };
  
  // Format date for display
  const formatDateForDisplay = (date: Date) => {
    return format(date, "EEE, MMM d");
  };
  
  // Format time for display
  const formatTimeForDisplay = (time: string) => {
    try {
      const [hours, minutes] = time.split(":").map(Number);
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
    } catch (error) {
      return time;
    }
  };
  
  // Get the current week range for display
  const weekRangeDisplay = `${format(currentWeekStart, "MMM d")} - ${format(
    endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
    "MMM d, yyyy"
  )}`;
  
  // Count available slots for a date
  const countAvailableSlotsForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return availableSlots[dateString]?.length || 0;
  };
  
  // Check if date is selectable
  const isDateSelectable = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return (
      !isBefore(date, new Date()) &&
      !isAfter(date, addDays(new Date(), availability.advanceBookingLimit)) &&
      (availableSlots[dateString]?.length || 0) > 0
    );
  };
  
  return (
    <div>
      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousWeek}
          disabled={isBefore(currentWeekStart, new Date())}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <span className="font-medium">{weekRangeDisplay}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextWeek}
          disabled={isAfter(
            currentWeekStart,
            addDays(new Date(), availability.advanceBookingLimit - 7)
          )}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {getDaysInView().map((day, index) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isSelectable = isDateSelectable(day);
          const slotCount = countAvailableSlotsForDate(day);
          
          return (
            <div
              key={index}
              className={`
                flex flex-col items-center p-2 rounded-md cursor-pointer border
                ${isSelected ? "border-primary bg-primary/5" : "border-gray-200"}
                ${isSelectable ? "hover:border-primary/50" : "opacity-50 cursor-not-allowed"}
              `}
              onClick={() => {
                if (isSelectable) {
                  handleDateSelect(day);
                }
              }}
            >
              <span className="text-xs text-gray-500">{format(day, "EEE")}</span>
              <span
                className={`text-sm font-medium ${isSelected ? "text-primary" : "text-gray-900"}`}
              >
                {format(day, "d")}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {slotCount > 0 ? `${slotCount} slots` : "No slots"}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Time Slots */}
      {selectedDate && (
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Available times for {formatDateForDisplay(selectedDate)}
          </h3>
          
          {availableSlots[format(selectedDate, "yyyy-MM-dd")]?.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availableSlots[format(selectedDate, "yyyy-MM-dd")].map((time, index) => (
                <div
                  key={index}
                  className={`
                    flex items-center justify-center p-2 border rounded-md cursor-pointer
                    ${
                      selectedTimeSlot === time
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 hover:border-primary/50"
                    }
                  `}
                  onClick={() => handleTimeSlotSelect(time)}
                >
                  <span className="text-sm">{formatTimeForDisplay(time)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 border border-dashed rounded-md">
              No available time slots for this date
            </div>
          )}
        </div>
      )}
      
      {/* Selected Session Info */}
      {sessionType && (
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Session Type</span>
            <span>{sessionType.name}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Duration</span>
            <span>{sessionType.duration} minutes</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Price</span>
            <Badge variant="outline" className="font-medium">
              ${sessionType.price.toFixed(2)}
            </Badge>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-sm text-gray-500">
                <Info className="h-4 w-4 mr-1" />
                <span>All times shown in {availability.timezone}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Times are displayed in the mentor's timezone</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Button
          onClick={handleConfirmBooking}
          disabled={!selectedDate || !selectedTimeSlot || isBooking}
          className="min-w-[140px]"
        >
          {isBooking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Booking...
            </>
          ) : (
            "Confirm Booking"
          )}
        </Button>
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Confirmed</DialogTitle>
            <DialogDescription>Your session has been booked successfully.</DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Mentor</span>
                <span className="font-medium">{mentorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Session Type</span>
                <span className="font-medium">{sessionType?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">
                  {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-medium">
                  {selectedTimeSlot && formatTimeForDisplay(selectedTimeSlot)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-4 mt-4">
                <span className="font-medium">Total</span>
                <span className="font-bold">${sessionType?.price.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowConfirmation(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}