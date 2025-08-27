"use client"

import { useState, useEffect } from "react"
import { SimpleScheduler } from "@/components/MentorComponents/SimpleScheduler"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Plus } from "lucide-react"
import { toast } from "sonner"
import { SessionTypeEditor, type SessionType } from "@/components/MentorComponents/SessionTypeEditor"
import axios from "axios"
import { useAuth } from "@/context/AuthContext"

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  date: string; // Format: YYYY-MM-DD
  timeSlots: TimeSlot[];
}

export default function MentorSchedulePage() {
  const { token } = useAuth();
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [isSessionTypeEditorOpen, setIsSessionTypeEditorOpen] = useState(false);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [isFetchingSessionTypes, setIsFetchingSessionTypes] = useState(false);
  const [editingSessionType, setEditingSessionType] = useState<SessionType | undefined>(undefined);
  
  // Load mentor's schedule and session types
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load schedule from localStorage
        const savedSchedule = localStorage.getItem('mentor-schedule');
        if (savedSchedule) {
          setSchedule(JSON.parse(savedSchedule));
        }
        
        // Mock upcoming sessions data
        setUpcomingSessions([
          {
            id: "session-1",
            studentName: "Alex Johnson",
            date: "2024-05-20",
            startTime: "14:00",
            endTime: "15:00",
            topic: "Career Guidance"
          },
          {
            id: "session-2",
            studentName: "Maria Garcia",
            date: "2024-05-22",
            startTime: "10:00",
            endTime: "11:00",
            topic: "Technical Interview Prep"
          }
        ]);
        
        // Fetch session types from API
        if (token) {
          await fetchSessionTypes();
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load your schedule");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [token]);
  
  // Fetch session types from API
  const fetchSessionTypes = async () => {
    setIsFetchingSessionTypes(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.get(
        `${API_BASE_URL}/api/mentor/session-types`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && response.data.sessionTypes) {
        setSessionTypes(response.data.sessionTypes);
      }
    } catch (error) {
      console.error("Error fetching session types:", error);
      toast.error("Failed to load session types");
    } finally {
      setIsFetchingSessionTypes(false);
    }
  };
  
  // Handle saving a session type
  const handleSaveSessionType = async (sessionType: SessionType) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      
      if (sessionType.isNew) {
        // Create new session type
        const response = await axios.post(
          `${API_BASE_URL}/api/mentor/session-types`, 
          { sessionType },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Add the new session type to the list
        if (response.data && response.data.sessionType) {
          setSessionTypes([...sessionTypes, response.data.sessionType]);
        }
        
        toast.success("Session type created successfully");
      } else {
        // Update existing session type
        const response = await axios.put(
          `${API_BASE_URL}/api/mentor/session-types/${sessionType._id}`, 
          { sessionType },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Update the session type in the list
        if (response.data && response.data.sessionType) {
          setSessionTypes(
            sessionTypes.map(type => 
              type._id === sessionType._id ? response.data.sessionType : type
            )
          );
        }
        
        toast.success("Session type updated successfully");
      }
      
      // Close the editor
      setIsSessionTypeEditorOpen(false);
    } catch (error) {
      console.error("Error saving session type:", error);
      toast.error("Failed to save session type");
    }
  };
  
  // Handle saving the schedule
  const handleSaveSchedule = (newSchedule: DaySchedule[]) => {
    setSchedule(newSchedule);
    
    // Save to localStorage (in a real app, this would be saved to your API)
    try {
      localStorage.setItem('mentor-schedule', JSON.stringify(newSchedule));
      toast.success("Your availability has been updated");
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Failed to save your availability");
    }
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
  
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2">Loading your schedule...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule Sessions</h1>
          <p className="text-gray-600 mt-1">
            Set your availability and manage upcoming mentoring sessions
          </p>
        </div>
        <Button 
          variant="default" 
          className="bg-primary hover:bg-primary/90"
          onClick={() => {
            setEditingSessionType(undefined);
            setIsSessionTypeEditorOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Session Type
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Upcoming Sessions
            </CardTitle>
            <CardDescription>
              Your scheduled mentoring sessions with students
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>You have no upcoming sessions scheduled.</p>
                <p className="mt-2 text-sm">
                  Set your availability below to allow students to book sessions with you.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        {session.studentName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium">{session.studentName}</h3>
                        <p className="text-sm text-gray-500">
                          {formatDateForDisplay(session.date)} • {formatTimeForDisplay(session.startTime)} - {formatTimeForDisplay(session.endTime)}
                        </p>
                        <p className="text-sm mt-1">
                          <span className="font-medium">Topic:</span> {session.topic}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                      <Button variant="default" size="sm">
                        Join Session
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Quick Stats
            </CardTitle>
            <CardDescription>
              Overview of your mentoring schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <span className="text-gray-600">Upcoming Sessions</span>
                <span className="font-bold">{upcomingSessions.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <span className="text-gray-600">Available Days</span>
                <span className="font-bold">{schedule.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <span className="text-gray-600">Available Time Slots</span>
                <span className="font-bold">
                  {schedule.reduce((total, day) => total + day.timeSlots.length, 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <span className="text-gray-600">Next Session</span>
                <span className="font-bold">
                  {upcomingSessions.length > 0
                    ? formatDateForDisplay(upcomingSessions[0].date).split(',')[0]
                    : "None"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Set Your Availability
          </CardTitle>
          <CardDescription>
            Define when you're available for mentoring sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleScheduler initialSchedule={schedule} onSave={handleSaveSchedule} />
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Your Session Types
          </CardTitle>
          <CardDescription>
            Types of sessions you offer to students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFetchingSessionTypes ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : sessionTypes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>You haven't created any session types yet.</p>
              <p className="mt-2 text-sm">
                Click the "Create Session Type" button above to define the types of sessions you offer.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsSessionTypeEditorOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Session Type
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessionTypes.map((type) => (
                <div 
                  key={type._id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setEditingSessionType(type);
                    setIsSessionTypeEditorOpen(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{type.name}</h3>
                    <div className="flex items-center">
                      <span className={`h-2 w-2 rounded-full mr-2 ${type.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      <span className="text-sm text-gray-500">{type.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600">{type.duration} minutes</span>
                    </div>
                    <span className="text-sm font-medium">
                      {type.price === 0 ? 'Free' : `LKR ${type.price.toLocaleString()}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Availability Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>Set your availability at least 2 weeks in advance to give students time to book sessions.</li>
            <li>You can add multiple time slots for each day based on your schedule.</li>
            <li>Students will only be able to book sessions during your specified time slots.</li>
            <li>You'll receive notifications when students book sessions with you.</li>
            <li>You can always update your availability if your schedule changes.</li>
          </ul>
        </CardContent>
      </Card>
      
      {/* Session Type Editor */}
      <SessionTypeEditor
        isOpen={isSessionTypeEditorOpen}
        onClose={() => {
          setIsSessionTypeEditorOpen(false);
          setEditingSessionType(undefined);
        }}
        onSave={handleSaveSessionType}
        sessionType={editingSessionType}
        title={editingSessionType ? "Edit Session Type" : "Create Session Type"}
      />
    </div>
  );
}
