"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import axios from 'axios'
import { toast } from 'sonner'
import Image from "next/image"
import { Calendar, Clock, Video, FileText, MessageCircle, AlertTriangle, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader } from "@/components/common/Loader"

interface MentorshipSession {
  _id: string
  sessionType: string
  mentorName?: string
  mentorTitle?: string
  mentorImage?: string
  date: string
  duration: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  notes?: string
  backgroundColor?: string
}

// Helper functions
const isSessionActive = (sessionDate: string, duration: number) => {
  const sessionStart = new Date(sessionDate);
  const sessionEnd = new Date(sessionStart.getTime() + duration * 60000);
  const now = new Date();
  return now >= sessionStart && now <= sessionEnd;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const formatTime = (dateString: string, duration: number) => {
  const startDate = new Date(dateString);
  const endDate = new Date(startDate.getTime() + duration * 60000);
  
  return `${startDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })} - ${endDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })}`;
};

export default function StudentMentorshipPage() {
  const [sessions, setSessions] = useState<MentorshipSession[]>([])
  const [loading, setLoading] = useState(true)
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()

  // Fetch student sessions
  const fetchSessions = async () => {
    try {
      setLoading(true)
      
      // Don't show error if auth is still loading
      if (!token) {
        if (!authLoading) {
          toast.error('Authentication required')
        }
        return
      }

      // Fetch real student sessions from API
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      const response = await axios.get(`${API_BASE_URL}/api/student/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data?.sessions) {
        setSessions(response.data.sessions)
      } else {
        setSessions([])
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
      toast.error('Failed to load sessions')
      setSessions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      fetchSessions()
    }
  }, [token, authLoading])

  const upcomingSessions = sessions.filter((session) => 
    session.status === "pending" || session.status === "confirmed"
  )
  const pastSessions = sessions.filter((session) => 
    session.status === "completed" || session.status === "cancelled"
  )

  const handleJoinChat = (sessionId: string, sessionDate: string, duration: number) => {
    if (!isSessionActive(sessionDate, duration)) {
      toast.error('Chat is only available during the scheduled session time')
      return
    }
    
    // Navigate to chat page
    router.push(`/chat/${sessionId}`)
  }

  const handleConfirmSession = async (sessionId: string) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      const response = await axios.post(
        `${API_BASE_URL}/api/student/sessions/${sessionId}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      toast.success('Session confirmed successfully!')
      fetchSessions() // Refresh the sessions list
    } catch (error) {
      console.error('Error confirming session:', error)
      toast.error('Failed to confirm session')
    }
  }

  const handleCancelSession = async (sessionId: string) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      const response = await axios.post(
        `${API_BASE_URL}/api/student/sessions/${sessionId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      toast.success('Session cancelled successfully!')
      fetchSessions() // Refresh the sessions list
    } catch (error) {
      console.error('Error cancelling session:', error)
      toast.error('Failed to cancel session')
    }
  }

  const handleViewFeedback = (sessionId: string) => {
    console.log("Viewing feedback for session:", sessionId)
    // Handle view feedback logic
  }

  if (loading || authLoading) return <Loader />

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Mentorship Sessions</h1>

        {/* Upcoming Sessions */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Sessions</h2>

          {upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map((session) => {
                const isActive = isSessionActive(session.date, session.duration);
                
                return (
                  <Card key={session._id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {session.status === "confirmed" ? "Confirmed" : "Pending"}
                            </Badge>
                            {isActive && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                                Live Now
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {session.sessionType} with {session.mentorName}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(session.date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatTime(session.date, session.duration)}</span>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            {/* Chat Button - Only for confirmed sessions during session time */}
                            {session.status === "confirmed" && (
                              <>
                                {isActive ? (
                                  <Button 
                                    onClick={() => handleJoinChat(session._id, session.date, session.duration)} 
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Join Chat
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="outline"
                                    onClick={() => handleJoinChat(session._id, session.date, session.duration)} 
                                    disabled={!isActive}
                                    className="text-gray-500"
                                    title="Chat only available during session time"
                                  >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Chat
                                  </Button>
                                )}
                              </>
                            )}
                            
                            {/* Confirm/Cancel Buttons - Only for pending sessions */}
                            {session.status === "pending" && (
                              <>
                                <Button 
                                  onClick={() => handleConfirmSession(session._id)}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Confirm
                                </Button>
                                <Button 
                                  variant="outline"
                                  onClick={() => handleCancelSession(session._id)}
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Cancel
                                </Button>
                              </>
                            )}
                            
                            {/* Session Details Button - Always available */}
                            <Button variant="outline" className="gap-1">
                              <Video className="h-4 w-4" />
                              Details
                            </Button>
                          </div>
                        </div>

                        {/* Mentor Image */}
                        <div className="ml-6">
                          <div className={`w-24 h-24 rounded-lg overflow-hidden ${session.backgroundColor || 'bg-gray-200'}`}>
                            <Image
                              src={session.mentorImage || "/placeholder.svg"}
                              alt={session.mentorName || "Mentor"}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No upcoming sessions scheduled.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Past Sessions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Past Sessions</h2>

          {pastSessions.length > 0 ? (
            <div className="space-y-4">
              {pastSessions.map((session) => (
                <Card key={session._id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {session.status === "completed" ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              Cancelled
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {session.sessionType} with {session.mentorName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(session.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(session.date, session.duration)}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {session.status === "completed" && (
                            <Button
                              variant="outline"
                              onClick={() => handleViewFeedback(session._id)}
                              className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View Feedback
                            </Button>
                          )}
                          
                          {(session.status === "completed" || session.status === "cancelled") && (
                            <Button
                              variant="outline"
                              className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Chat History
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Mentor Image */}
                      <div className="ml-6">
                        <div className={`w-24 h-24 rounded-lg overflow-hidden ${session.backgroundColor || 'bg-gray-200'}`}>
                          <Image
                            src={session.mentorImage || "/placeholder.svg"}
                            alt={session.mentorName || "Mentor"}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No past sessions found.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{upcomingSessions.length}</div>
              <div className="text-sm text-gray-600">Upcoming Sessions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{pastSessions.length}</div>
              <div className="text-sm text-gray-600">Completed Sessions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">{sessions.length}</div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
