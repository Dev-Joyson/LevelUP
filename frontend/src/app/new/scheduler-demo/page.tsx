"use client"

import { useState } from "react"
import { SimpleScheduler } from "@/components/MentorComponents/SimpleScheduler"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  date: string; // Format: YYYY-MM-DD
  timeSlots: TimeSlot[];
}

export default function SchedulerDemo() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [showSchedule, setShowSchedule] = useState(false);
  
  // Handle saving the schedule
  const handleSaveSchedule = (newSchedule: DaySchedule[]) => {
    setSchedule(newSchedule);
    toast.success("Schedule saved successfully");
    
    // In a real app, you would save this to your backend
    console.log("Schedule saved:", newSchedule);
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
  
  // Format time for display (24h to 12h)
  const formatTimeForDisplay = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Mentor Schedule Management</h1>
      
      <div className="mb-8">
        <p className="text-gray-600 mb-4">
          Use the calendar below to set your availability for mentoring sessions. Select dates and add time slots when you're available to meet with students.
        </p>
        
        <SimpleScheduler initialSchedule={schedule} onSave={handleSaveSchedule} />
      </div>
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Schedule Summary</h2>
          <Button variant="outline" onClick={() => setShowSchedule(!showSchedule)}>
            {showSchedule ? "Hide Details" : "Show Details"}
          </Button>
        </div>
        
        {showSchedule && (
          <Card>
            <CardHeader>
              <CardTitle>Complete Schedule</CardTitle>
              <CardDescription>
                All your scheduled availability dates and time slots
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schedule.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  You haven't set any availability yet. Use the calendar above to add dates and time slots.
                </p>
              ) : (
                <div className="space-y-6">
                  {schedule
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((day) => (
                      <div key={day.date} className="border-b pb-4 last:border-0">
                        <h3 className="font-medium mb-2">{formatDateForDisplay(day.date)}</h3>
                        {day.timeSlots.length === 0 ? (
                          <p className="text-gray-500">No time slots available</p>
                        ) : (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Available Time Slots:</h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {day.timeSlots.map((slot) => (
                                <li key={slot.id} className="text-sm bg-gray-50 p-2 rounded-md">
                                  {formatTimeForDisplay(slot.startTime)} - {formatTimeForDisplay(slot.endTime)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Select a date on the calendar to set your availability for that day.</li>
            <li>Add one or more time slots when you'll be available for mentoring sessions.</li>
            <li>Click "Save" to confirm your availability for the selected date.</li>
            <li>Repeat for all dates you want to offer mentoring sessions.</li>
            <li>Students will only be able to book sessions during your specified time slots.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
