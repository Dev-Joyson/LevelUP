"use client"

import { useState, useEffect } from "react"
import { SimpleScheduler } from "@/components/MentorComponents/SimpleScheduler"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Plus } from "lucide-react"
import { toast } from "sonner"
import { SessionTypeEditor, type SessionType } from "@/components/MentorComponents/SessionTypeEditor"
import { EditSessionTypeModal } from "@/components/MentorComponents/EditSessionTypeModal"
import { ProfileCompletionCard } from "@/components/MentorComponents/ProfileCompletionCard"
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

interface SessionFromAPI {
  id: string;
  studentName: string;
  studentEmail: string;
  sessionDate: string;
  sessionTime: string;
  duration: number;
  status: string;
  topic: string;
  type: string;
}

export default function MentorSchedulePage() {
  const { token, user } = useAuth();
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    cancelledSessions: 0
  });
  const [isSessionTypeEditorOpen, setIsSessionTypeEditorOpen] = useState(false);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [isFetchingSessionTypes, setIsFetchingSessionTypes] = useState(false);
  const [editingSessionType, setEditingSessionType] = useState<SessionType | undefined>(undefined);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Load mentor's schedule and session types
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch schedule from database first, fallback to localStorage
        if (token) {
          await Promise.all([
            fetchScheduleFromDatabase(),
            fetchSessionTypes(),
            fetchUpcomingSessions()
          ]);
        } else {
          // If no token, try localStorage as fallback
          const savedSchedule = localStorage.getItem('mentor-schedule');
          if (savedSchedule) {
            setSchedule(JSON.parse(savedSchedule));
          }
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
  
  // Fetch schedule from database
  const fetchScheduleFromDatabase = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      
      console.log("🔄 Fetching schedule from database...");
      
      const response = await axios.get(
        `${API_BASE_URL}/api/mentor/availability`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("✅ Database response:", response.data);
      
      if (response.data && response.data.schedule) {
        console.log("📅 Setting schedule from database:", response.data.schedule);
        setSchedule(response.data.schedule);
        
        // Also update localStorage as backup
        localStorage.setItem('mentor-schedule', JSON.stringify(response.data.schedule));
        
        toast.success("Schedule loaded from database");
      } else {
        console.log("📅 No schedule data in database, checking localStorage...");
        // Fallback to localStorage if no database data
        const savedSchedule = localStorage.getItem('mentor-schedule');
        if (savedSchedule) {
          console.log("📅 Loading from localStorage as fallback");
          setSchedule(JSON.parse(savedSchedule));
        }
      }
    } catch (error) {
      console.error("❌ Error fetching schedule from database:", error);
      
      // Fallback to localStorage on error
      const savedSchedule = localStorage.getItem('mentor-schedule');
      if (savedSchedule) {
        console.log("📅 Loading from localStorage due to API error");
        setSchedule(JSON.parse(savedSchedule));
      }
      
      toast.error("Failed to load schedule from database, using local backup");
    }
  };
  
  // Fetch upcoming sessions from database
  const fetchUpcomingSessions = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      
      console.log("🔄 Fetching upcoming sessions from database...");
      
      const response = await axios.get(
        `${API_BASE_URL}/api/mentor/sessions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("✅ Sessions response:", response.data);
      
      if (response.data && response.data.sessions) {
        // Filter only upcoming sessions (status: 'upcoming')
        const upcoming = response.data.sessions.filter((session: SessionFromAPI) => 
          session.status === 'upcoming'
        );
        
        // Sort by date (sessions are already sorted by date from backend)
        const sortedUpcoming = upcoming.sort((a: SessionFromAPI, b: SessionFromAPI) => {
          return new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime();
        });
        
        // Map to the format expected by the UI
        const formattedSessions = sortedUpcoming.map((session: SessionFromAPI) => ({
          id: session.id,
          studentName: session.studentName,
          date: session.sessionDate,
          startTime: session.sessionTime, // This is already formatted (e.g., "2:00 PM")
          endTime: calculateEndTimeFromFormatted(session.sessionTime, session.duration),
          topic: session.topic,
          duration: session.duration
        }));
        
        console.log("📅 Setting upcoming sessions:", formattedSessions);
        setUpcomingSessions(formattedSessions);
        
        // Update session stats
        if (response.data.stats) {
          setSessionStats({
            totalSessions: response.data.stats.total || 0,
            upcomingSessions: response.data.stats.upcoming || 0,
            completedSessions: response.data.stats.completed || 0,
            cancelledSessions: response.data.stats.cancelled || 0
          });
        } else {
          // Fallback: calculate stats from sessions data
          setSessionStats({
            totalSessions: response.data.sessions.length,
            upcomingSessions: response.data.sessions.filter((s: SessionFromAPI) => s.status === 'upcoming').length,
            completedSessions: response.data.sessions.filter((s: SessionFromAPI) => s.status === 'completed').length,
            cancelledSessions: response.data.sessions.filter((s: SessionFromAPI) => s.status === 'cancelled').length
          });
        }
        
        toast.success(`${formattedSessions.length} upcoming sessions loaded`);
      } else {
        console.log("📅 No upcoming sessions found");
        setUpcomingSessions([]);
      }
    } catch (error) {
      console.error("❌ Error fetching upcoming sessions:", error);
      setUpcomingSessions([]);
      toast.error("Failed to load upcoming sessions");
    }
  };
  
  // Helper function to calculate end time from formatted start time and duration
  const calculateEndTimeFromFormatted = (startTime: string, duration: number) => {
    // startTime is formatted like "2:00 PM"
    // Parse it to get 24-hour format
    const [time, period] = startTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;
    
    if (period === 'PM' && hours !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }
    
    const startMinutes = hour24 * 60 + minutes;
    const endMinutes = startMinutes + duration;
    const endHours = Math.floor(endMinutes / 60) % 24;
    const endMins = endMinutes % 60;
    
    // Convert back to 12-hour format
    const endPeriod = endHours >= 12 ? 'PM' : 'AM';
    const displayHours = endHours % 12 || 12;
    return `${displayHours}:${endMins.toString().padStart(2, '0')} ${endPeriod}`;
  };
  
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
        toast.success("Session types loaded successfully");
      }
    } catch (error) {
      console.error("Error fetching session types:", error);
      toast.error("Failed to load session types");
    } finally {
      setIsFetchingSessionTypes(false);
    }
  };
  
  // Handle saving a session type (for new session types)
  const handleSaveSessionType = async (sessionType: SessionType) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      
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
      
      // Close the editor
      setIsSessionTypeEditorOpen(false);
    } catch (error) {
      console.error("Error saving session type:", error);
      toast.error("Failed to save session type");
    }
  };

  // Handle updating existing session type
  const handleUpdateSessionType = async (sessionType: SessionType) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      
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
      
      // Close the edit modal
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating session type:", error);
      toast.error("Failed to update session type");
    }
  };
  
  // Handle saving the schedule
  const handleSaveSchedule = async (newSchedule: DaySchedule[]) => {
    setSchedule(newSchedule);
    
    try {
      // DEBUG: Log what we're saving
      console.log("🔧 SAVING SCHEDULE:", newSchedule);
      
      // Save to database via API
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.put(
        `${API_BASE_URL}/api/mentor/availability`,
        { schedule: newSchedule },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("✅ SAVE RESPONSE:", response.data);
      
      // Also save to localStorage as backup
      localStorage.setItem('mentor-schedule', JSON.stringify(newSchedule));
      toast.success("Your availability has been updated and saved to database");
    } catch (error) {
      console.error("❌ ERROR saving schedule:", error);
      
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

      {/* Profile Completion Card */}
      {/* <div className="mb-8">
        <ProfileCompletionCard />
      </div> */}
      
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
                          {formatDateForDisplay(session.date)} • {session.startTime} - {session.endTime}
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
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-md">
                <span className="text-gray-600">Available Days</span>
                <span className="font-bold text-purple-600">{schedule.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-md">
                <span className="text-gray-600">Available Time Slots</span>
                <span className="font-bold text-orange-600">
                  {schedule.reduce((total, day) => total + day.timeSlots.length, 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <span className="text-gray-600">Next Session</span>
                <span className="font-bold">
                  {upcomingSessions.length > 0
                    ? new Date(upcomingSessions[0].date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })
                    : "None"}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-100 rounded-md">
                <span className="text-gray-600">Completed Sessions</span>
                <span className="font-bold text-green-700">{sessionStats.completedSessions}</span>
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
                    setIsEditModalOpen(true);
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
      
      {/* Session Type Editor - For creating new session types */}
      <SessionTypeEditor
        isOpen={isSessionTypeEditorOpen}
        onClose={() => {
          setIsSessionTypeEditorOpen(false);
          setEditingSessionType(undefined);
        }}
        onSave={handleSaveSessionType}
        sessionType={undefined} // Always undefined for new session types
        title="Create Session Type"
      />

      {/* Edit Session Type Modal - For editing existing session types */}
      <EditSessionTypeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingSessionType(undefined);
        }}
        onSuccess={() => fetchSessionTypes()}
        sessionType={editingSessionType}
      />
    </div>
  );
}
