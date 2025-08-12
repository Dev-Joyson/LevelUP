"use client"

import { useState } from "react"
import { format, parse, addDays } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TimePickerInput } from "./TimePickerInput"

interface TimeSlot {
  day: string
  startTime: string
  endTime: string
  enabled: boolean
}

interface AvailabilitySettingsProps {
  mentorId: string
  onSave: () => void
}

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
]

export function AvailabilitySettings({ mentorId, onSave }: AvailabilitySettingsProps) {
  // Default availability - weekdays 9 AM to 5 PM
  const defaultTimeSlots = daysOfWeek.map(day => ({
    day,
    startTime: "09:00",
    endTime: "17:00",
    enabled: ["Saturday", "Sunday"].includes(day) ? false : true
  }))

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(defaultTimeSlots)
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([])
  
  // Handle time slot changes
  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: any) => {
    const updatedSlots = [...timeSlots]
    updatedSlots[index] = { ...updatedSlots[index], [field]: value }
    setTimeSlots(updatedSlots)
  }
  
  // Handle saving availability
  const handleSaveAvailability = () => {
    // In a real app, you would send this data to your API
    console.log("Saving availability for mentor:", mentorId)
    console.log("Weekly schedule:", timeSlots)
    console.log("Unavailable dates:", unavailableDates)
    
    onSave()
  }
  
  // Handle date selection for unavailable dates
  const handleDateSelect = (date: Date) => {
    const dateExists = unavailableDates.some(d => 
      d.getDate() === date.getDate() && 
      d.getMonth() === date.getMonth() && 
      d.getFullYear() === date.getFullYear()
    )
    
    if (dateExists) {
      setUnavailableDates(unavailableDates.filter(d => 
        !(d.getDate() === date.getDate() && 
          d.getMonth() === date.getMonth() && 
          d.getFullYear() === date.getFullYear())
      ))
    } else {
      setUnavailableDates([...unavailableDates, date])
    }
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Set Your Availability</CardTitle>
        <CardDescription>
          Configure when you're available for mentoring sessions. Students will only be able to book during these times.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly">
          <TabsList className="mb-4">
            <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
            <TabsTrigger value="dates">Specific Dates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly">
            <div className="space-y-4">
              {timeSlots.map((slot, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-24">
                    <Switch
                      checked={slot.enabled}
                      onCheckedChange={(checked) => updateTimeSlot(index, 'enabled', checked)}
                    />
                    <Label className={`ml-2 ${!slot.enabled ? 'text-gray-400' : ''}`}>
                      {slot.day}
                    </Label>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Start Time</Label>
                      <TimePickerInput
                        value={slot.startTime}
                        onChange={(value) => updateTimeSlot(index, 'startTime', value)}
                        disabled={!slot.enabled}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">End Time</Label>
                      <TimePickerInput
                        value={slot.endTime}
                        onChange={(value) => updateTimeSlot(index, 'endTime', value)}
                        disabled={!slot.enabled}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="dates">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Mark dates you're unavailable</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Select dates when you won't be available for mentoring sessions.
                </p>
                
                <Calendar
                  mode="multiple"
                  selected={unavailableDates}
                  onSelect={setUnavailableDates}
                  className="border rounded-md p-3"
                  disabled={(date) => date < new Date()}
                />
              </div>
              
              {unavailableDates.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Unavailable Dates</h3>
                  <div className="flex flex-wrap gap-2">
                    {unavailableDates.map((date, index) => (
                      <div 
                        key={index} 
                        className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        <span>{format(date, "MMM d, yyyy")}</span>
                        <button 
                          className="ml-2 text-gray-500 hover:text-gray-700"
                          onClick={() => handleDateSelect(date)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center">
          <Checkbox id="auto-confirm" />
          <Label htmlFor="auto-confirm" className="ml-2 text-sm">
            Auto-confirm bookings
          </Label>
        </div>
        <Button onClick={handleSaveAvailability}>Save Availability</Button>
      </CardFooter>
    </Card>
  )
}
