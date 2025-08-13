"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AvailabilitySettings } from "@/components/MentorComponents/AvailabilitySettings"
import { BookingCalendar } from "@/components/MentorComponents/BookingCalendar"
import { 
  getMentorAvailability, 
  saveMentorAvailability, 
  createBooking, 
  getMentorBookings,
  MentorAvailability,
  Booking
} from "@/lib/availability-service"
import { toast } from "sonner"

// Session types
const sessionTypes = [
  {
    id: "free-intro",
    name: "Free Intro Call",
    duration: 10,
    price: 0
  },
  {
    id: "expert-consultation",
    name: "Expert Consultation",
    duration: 60,
    price: 5000
  },
  {
    id: "quick-help",
    name: "Quick Help Session",
    duration: 30,
    price: 2500
  }
];

export default function AvailabilityDemo() {
  const [activeTab, setActiveTab] = useState<string>("mentor")
  const [mentorId, setMentorId] = useState<string>("demo-mentor-123")
  const [studentId, setStudentId] = useState<string>("demo-student-456")
  const [availability, setAvailability] = useState<MentorAvailability | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedSessionType, setSelectedSessionType] = useState<string>("expert-consultation")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  
  // Load mentor availability and bookings
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const mentorAvailability = await getMentorAvailability(mentorId)
        const mentorBookings = await getMentorBookings(mentorId)
        
        setAvailability(mentorAvailability)
        setBookings(mentorBookings)
      } catch (error) {
        console.error("Error loading data:", error)
        toast.error("Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [mentorId])
  
  // Handle saving mentor availability
  const handleSaveAvailability = async (updatedAvailability: MentorAvailability) => {
    try {
      await saveMentorAvailability(updatedAvailability)
      setAvailability(updatedAvailability)
      toast.success("Availability settings saved successfully")
    } catch (error) {
      console.error("Error saving availability:", error)
      toast.error("Failed to save availability settings")
    }
  }
  
  // Handle booking slot selection
  const handleBookingSlotSelect = async (slot: {
    date: Date;
    startTime: string;
    endTime: string;
    duration: number;
  }) => {
    try {
      const selectedSession = sessionTypes.find(type => type.id === selectedSessionType)
      
      if (!selectedSession) {
        toast.error("Please select a session type")
        return
      }
      
      // Create booking
      const booking = await createBooking({
        mentorId,
        studentId,
        date: format(slot.date, "yyyy-MM-dd"),
        startTime: slot.startTime,
        endTime: slot.endTime,
        sessionType: selectedSession.name,
        sessionDuration: selectedSession.duration
      })
      
      // Update bookings list
      setBookings([...bookings, booking])
      
      toast.success("Session booked successfully!")
    } catch (error) {
      console.error("Error booking session:", error)
      toast.error("Failed to book session")
    }
  }
  
  // Handle session type change
  const handleSessionTypeChange = (value: string) => {
    setSelectedSessionType(value)
  }
  
  if (isLoading || !availability) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2">Loading...</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Availability & Booking System Demo</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="mentor">Mentor View</TabsTrigger>
          <TabsTrigger value="student">Student View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mentor">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Mentor Dashboard - Set Your Availability</CardTitle>
                <CardDescription>
                  Configure when you're available for mentoring sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AvailabilitySettings
                  mentorId={mentorId}
                  initialAvailability={availability}
                  onSave={handleSaveAvailability}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Bookings</CardTitle>
                <CardDescription>
                  View and manage your upcoming mentoring sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-4 border rounded-md flex items-center justify-between"
                      >
                        <div>
                          <h3 className="font-medium">{booking.sessionType}</h3>
                          <p className="text-sm text-gray-500">
                            {format(new Date(booking.date), "MMMM d, yyyy")} at{" "}
                            {booking.startTime} - {booking.endTime}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No bookings yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="student">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Book a Session</CardTitle>
                <CardDescription>
                  Select a session type and find a time that works for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Session Type</label>
                  <Select value={selectedSessionType} onValueChange={handleSessionTypeChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a session type" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessionTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} ({type.duration} min) - $
                          {type.price.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <BookingCalendar
                  mentorId={mentorId}
                  mentorName="Demo Mentor"
                  sessionTypes={sessionTypes}
                  selectedSessionType={selectedSessionType}
                  availability={availability}
                  onSlotSelect={handleBookingSlotSelect}
                  existingBookings={bookings.map(booking => ({
                    date: booking.date,
                    startTime: booking.startTime,
                    endTime: booking.endTime
                  }))}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Bookings</CardTitle>
                <CardDescription>
                  View your upcoming mentoring sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-4 border rounded-md flex items-center justify-between"
                      >
                        <div>
                          <h3 className="font-medium">{booking.sessionType}</h3>
                          <p className="text-sm text-gray-500">
                            {format(new Date(booking.date), "MMMM d, yyyy")} at{" "}
                            {booking.startTime} - {booking.endTime}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No bookings yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
