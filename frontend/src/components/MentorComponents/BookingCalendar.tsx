"use client"

import { useState } from "react"
import { format, addDays, startOfWeek, addWeeks, isSameDay, parse } from "date-fns"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { PaymentProcessor } from "@/components/PaymentGateway/PaymentProcessor"

// Types
interface TimeSlot {
  time: string
  available: boolean
}

interface DaySchedule {
  date: Date
  slots: TimeSlot[]
}

interface BookingCalendarProps {
  mentorId: string
  mentorName?: string
  sessionType: string
  sessionDuration: string
  sessionPrice: number
  onClose: () => void
}

// Mock data for available slots
const generateMockSchedule = (startDate: Date): DaySchedule[] => {
  const schedule: DaySchedule[] = []
  
  // Generate 14 days of schedule starting from the given date
  for (let i = 0; i < 14; i++) {
    const date = addDays(startDate, i)
    
    // Skip generating slots for past dates
    if (date < new Date()) continue
    
    // Generate time slots from 9 AM to 5 PM
    const slots: TimeSlot[] = []
    for (let hour = 9; hour < 17; hour++) {
      // Randomly determine if slot is available (70% chance)
      const isAvailable = Math.random() > 0.3
      
      slots.push({
        time: `${hour}:00`,
        available: isAvailable
      })
      
      // Add half-hour slots
      slots.push({
        time: `${hour}:30`,
        available: isAvailable
      })
    }
    
    schedule.push({
      date,
      slots
    })
  }
  
  return schedule
}

export function BookingCalendar({ mentorId, mentorName = "Mentor", sessionType, sessionDuration, sessionPrice, onClose }: BookingCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [schedule, setSchedule] = useState<DaySchedule[]>(generateMockSchedule(currentWeekStart))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showPaymentGateway, setShowPaymentGateway] = useState(false)
  
  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newWeekStart = addDays(currentWeekStart, -7)
    setCurrentWeekStart(newWeekStart)
    // In a real app, you would fetch the schedule for the new week from the API
    setSchedule(generateMockSchedule(newWeekStart))
  }
  
  // Navigate to next week
  const goToNextWeek = () => {
    const newWeekStart = addDays(currentWeekStart, 7)
    setCurrentWeekStart(newWeekStart)
    // In a real app, you would fetch the schedule for the new week from the API
    setSchedule(generateMockSchedule(newWeekStart))
  }
  
  // Get days for the current week view
  const getDaysInView = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      days.push(addDays(currentWeekStart, i))
    }
    return days
  }
  
  // Get available slots for the selected date
  const getAvailableSlotsForDate = (date: Date) => {
    const daySchedule = schedule.find(day => isSameDay(day.date, date))
    return daySchedule?.slots.filter(slot => slot.available) || []
  }
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTimeSlot(null)
  }
  
  // Handle time slot selection
  const handleTimeSlotSelect = (time: string) => {
    setSelectedTimeSlot(time)
  }
  
  // Handle booking confirmation
  const handleConfirmBooking = () => {
    setShowConfirmation(true)
  }
  
  // Handle proceeding to payment
  const handleProceedToPayment = () => {
    // Show the payment gateway
    setShowPaymentGateway(true)
    
    console.log("Proceeding to payment for:", {
      mentorId,
      sessionType,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      price: sessionPrice
    })
  }
  
  // Handle payment success
  const handlePaymentSuccess = () => {
    // In a real app, you would redirect to a booking confirmation page
    onClose()
  }
  
  // Format date for display
  const formatDateForDisplay = (date: Date) => {
    return format(date, "EEE, MMM d")
  }
  
  // Format time for display
  const formatTimeForDisplay = (time: string) => {
    try {
      const parsedTime = parse(time, "H:mm", new Date())
      return format(parsedTime, "h:mm a")
    } catch (error) {
      return time
    }
  }
  
  // Get the current week range for display
  const weekRangeDisplay = `${format(currentWeekStart, "MMM d")} - ${format(addDays(currentWeekStart, 6), "MMM d, yyyy")}`
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        {showPaymentGateway && selectedDate && selectedTimeSlot ? (
          <PaymentProcessor 
            sessionDetails={{
              mentorId,
              mentorName,
              sessionType,
              sessionDate: format(selectedDate, "EEE, MMM d, yyyy"),
              sessionTime: formatTimeForDisplay(selectedTimeSlot),
              price: sessionPrice
            }}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPaymentGateway(false)}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Book a {sessionType}</DialogTitle>
              <DialogDescription>
                Select a date and time for your {sessionDuration} session with the mentor.
              </DialogDescription>
            </DialogHeader>
            
            {!showConfirmation ? (
          <>
            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToPreviousWeek}
                disabled={currentWeekStart <= new Date()}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="font-medium">{weekRangeDisplay}</span>
              <Button variant="outline" size="sm" onClick={goToNextWeek}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1 mb-6">
              {getDaysInView().map((day, index) => {
                const availableSlots = getAvailableSlotsForDate(day)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isPast = day < new Date()
                const hasAvailableSlots = availableSlots.length > 0
                
                return (
                  <div 
                    key={index} 
                    className={`
                      flex flex-col items-center p-2 rounded-md cursor-pointer border
                      ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200'}
                      ${isPast || !hasAvailableSlots ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
                    `}
                    onClick={() => {
                      if (!isPast && hasAvailableSlots) {
                        handleDateSelect(day)
                      }
                    }}
                  >
                    <span className="text-xs text-gray-500">{format(day, "EEE")}</span>
                    <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                      {format(day, "d")}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {hasAvailableSlots ? `${availableSlots.length} slots` : 'No slots'}
                    </span>
                  </div>
                )
              })}
            </div>
            
            {/* Time Slots */}
            {selectedDate && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-2">
                  Available times for {formatDateForDisplay(selectedDate)}
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {getAvailableSlotsForDate(selectedDate).map((slot, index) => (
                    <div
                      key={index}
                      className={`
                        flex items-center justify-center p-2 border rounded-md cursor-pointer
                        ${selectedTimeSlot === slot.time ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-primary/50'}
                      `}
                      onClick={() => handleTimeSlotSelect(slot.time)}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      <span className="text-sm">{formatTimeForDisplay(slot.time)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                onClick={handleConfirmBooking} 
                disabled={!selectedDate || !selectedTimeSlot}
              >
                Continue
              </Button>
            </DialogFooter>
          </>
        ) : (
          // Confirmation Dialog
          <div className="py-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Session</span>
                    <span className="font-medium">{sessionType} ({sessionDuration})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium">{selectedDate && formatDateForDisplay(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time</span>
                    <span className="font-medium">{selectedTimeSlot && formatTimeForDisplay(selectedTimeSlot)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-4 mt-4">
                    <span className="text-gray-900 font-medium">Total</span>
                    <span className="text-gray-900 font-bold">
                      {sessionPrice === 0 ? 'Free' : `$${sessionPrice.toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Payment Method</h4>
              <RadioGroup defaultValue="card" className="space-y-3">
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex-1">Credit/Debit Card</Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="flex-1">PayPal</Label>
                </div>
              </RadioGroup>
            </div>
            
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setShowConfirmation(false)}>Back</Button>
              <Button onClick={handleProceedToPayment}>
                {sessionPrice === 0 ? 'Confirm Booking' : 'Proceed to Payment'}
              </Button>
            </DialogFooter>
          </div>
        )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
