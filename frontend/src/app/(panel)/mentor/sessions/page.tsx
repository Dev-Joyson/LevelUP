"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader } from "@/components/common/Loader"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "sonner"
import { 
  Search, 
  Filter, 
  User, 
  Calendar, 
  Clock, 
  Plus,
  Eye,
  Edit,
  Video,
  CheckCircle,
  MessageCircle
} from "lucide-react"

interface Session {
  id: string
  studentName: string
  studentEmail: string
  studentAvatar?: string
  sessionDate: string
  sessionTime: string
  duration: number
  status: "upcoming" | "completed" | "cancelled" | "in-progress"
  topic: string
  type: "one-on-one" | "group" | "workshop"
  meetingLink?: string
  notes?: string
  createdAt: string
}

interface SessionStats {
  total: number;
  upcoming: number;
  completed: number;
  inProgress: number;
  cancelled: number;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "upcoming":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100"
    case "completed":
      return "bg-green-100 text-green-800 hover:bg-green-100"
    case "cancelled":
      return "bg-red-100 text-red-800 hover:bg-red-100"
    case "in-progress":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "one-on-one":
      return "bg-purple-100 text-purple-800 hover:bg-purple-100"
    case "group":
      return "bg-orange-100 text-orange-800 hover:bg-orange-100"
    case "workshop":
      return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }
}

export default function SessionsPage() {
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<Session[]>([])
  const [stats, setStats] = useState<SessionStats>({ total: 0, upcoming: 0, completed: 0, inProgress: 0, cancelled: 0 })
  const [searchTerm, setSearchTerm] = useState("")
  const { token, loading: authLoading } = useAuth()
  const router = useRouter()

  // Check if session is active (during session time)
  const isSessionActive = (sessionDate: string, sessionTime: string, duration: number, status: string) => {
    console.log('🔍 Checking session active:', { sessionDate, sessionTime, duration, status })
    
    // If status is already "in-progress", session is definitely active
    if (status === "in-progress") {
      console.log('✅ Session is in-progress, returning true')
      return true
    }
    
    const now = new Date()
    
    // Handle different time formats (12-hour vs 24-hour)
    let sessionStart: Date
    
    try {
      if (sessionTime.includes('AM') || sessionTime.includes('PM')) {
        // 12-hour format: "11:30 AM"
        const dateTimeString = `${sessionDate} ${sessionTime}`
        sessionStart = new Date(dateTimeString)
      } else {
        // 24-hour format: "11:30"
        const [year, month, day] = sessionDate.split('-').map(Number)
        const [hours, minutes] = sessionTime.split(':').map(Number)
        sessionStart = new Date(year, month - 1, day, hours, minutes)
      }
      
      const sessionEnd = new Date(sessionStart.getTime() + (duration * 60000))
      return now >= sessionStart && now <= sessionEnd
    } catch (error) {
      console.error('Error parsing session time:', error)
      return false
    }
  }

  // Handle joining chat
  const handleJoinChat = (sessionId: string, sessionDate: string, sessionTime: string, duration: number, status: string) => {
    if (!isSessionActive(sessionDate, sessionTime, duration, status)) {
      toast.error('Chat is only available during the scheduled session time')
      return
    }
    
    // Navigate to chat page
    router.push(`/chat/${sessionId}`)
  }

  // Fetch mentor sessions
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

      // Fetch real mentor sessions from API
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      const response = await axios.get(`${API_BASE_URL}/api/mentor/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data?.sessions) {
        setSessions(response.data.sessions)
        setStats(response.data.stats || { total: 0, upcoming: 0, completed: 0, inProgress: 0, cancelled: 0 })
      } else {
        setSessions([])
        setStats({ total: 0, upcoming: 0, completed: 0, inProgress: 0, cancelled: 0 })
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
      toast.error('Failed to load sessions')
      setSessions([])
      setStats({ total: 0, upcoming: 0, completed: 0, inProgress: 0, cancelled: 0 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      fetchSessions()
    }
  }, [token, authLoading])

  // Filter sessions based on search term
  const filteredSessions = sessions.filter(session =>
    session.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.topic.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading || authLoading) return <Loader />

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your mentoring sessions</p>
        </div>
        <Button className="bg-[#535c91] hover:bg-[#464f7a] gap-2">
          <Plus className="h-4 w-4" />
          Schedule New Session
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Total Sessions</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-orange-50">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Upcoming</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.upcoming}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Completed</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions by student, email, or topic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Sessions {filteredSessions.length > 0 && `(${filteredSessions.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200">
                  <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-600">Student</TableHead>
                  <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-600">Session Details</TableHead>
                  <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-600">Type</TableHead>
                  <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</TableHead>
                  <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.length > 0 ? filteredSessions.map((session, index) => (
                  <TableRow
                    key={session.id}
                    className={index !== filteredSessions.length - 1 ? "border-b border-gray-100" : ""}
                  >
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={session.studentAvatar} alt={session.studentName} />
                          <AvatarFallback>
                            <User className="h-5 w-5 text-gray-600" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{session.studentName}</div>
                          <div className="text-xs text-gray-500">{session.studentEmail}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">{session.topic}</div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {session.sessionDate}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {session.sessionTime}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <Badge variant="secondary" className={getTypeColor(session.type)}>
                        {session.type.charAt(0).toUpperCase() + session.type.slice(1).replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <Badge variant="secondary" className={getStatusColor(session.status)}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1).replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                        
                        {/* Chat Button - Show for upcoming and in-progress sessions */}
                        {(session.status === "upcoming" || session.status === "in-progress") && (
                          <>
                            {isSessionActive(session.sessionDate, session.sessionTime, session.duration, session.status) ? (
                              <Button 
                                onClick={() => handleJoinChat(session.id, session.sessionDate, session.sessionTime, session.duration, session.status)} 
                                className="bg-green-600 hover:bg-green-700 gap-1"
                                size="sm"
                              >
                                <MessageCircle className="h-3 w-3" />
                                Join Chat
                              </Button>
                            ) : (
                              <Button 
                                variant="outline"
                                onClick={() => handleJoinChat(session.id, session.sessionDate, session.sessionTime, session.duration, session.status)} 
                                disabled={!isSessionActive(session.sessionDate, session.sessionTime, session.duration, session.status)}
                                className="text-gray-500 gap-1"
                                size="sm"
                                title="Chat only available during session time"
                              >
                                <MessageCircle className="h-3 w-3" />
                                Chat
                              </Button>
                            )}
                          </>
                        )}
                        
                        {session.status === "upcoming" && (
                          <>
                            <Button variant="outline" size="sm" className="gap-1">
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            {session.meetingLink && (
                              <Button variant="outline" size="sm" className="gap-1">
                                <Video className="h-3 w-3" />
                                Join
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Calendar className="h-12 w-12 text-gray-300" />
                        <div>
                          <p className="text-gray-500 font-medium">No sessions found</p>
                          <p className="text-gray-400 text-sm">
                            {searchTerm ? 'Try adjusting your search criteria' : 'You haven\'t scheduled any sessions yet'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}