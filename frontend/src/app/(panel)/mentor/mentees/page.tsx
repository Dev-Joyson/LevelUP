"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader } from "@/components/common/Loader"
import { useAuth } from "@/context/AuthContext"
import axios from "axios"
import { 
  Search, 
  Filter, 
  User, 
  MessageSquare, 
  Calendar, 
  Eye, 
  Star,
  Clock,
  TrendingUp,
  GraduationCap,
  Phone,
  Mail
} from "lucide-react"

interface Session {
  sessionId: string
  date: string
  startTime: string
  endTime: string
  sessionTypeName: string
  duration: number
  price: number
  status: "confirmed" | "completed" | "cancelled"
  createdAt: string
}

interface Mentee {
  studentId: string
  firstname: string
  lastname: string
  email: string
  university: string
  graduationYear: string
  profileImageUrl?: string
  education?: string
  skills: string[]
  phoneNumber?: string
  sessions: Session[]
  totalSessions: number
  completedSessions: number
  upcomingSessions: number
  firstSessionDate: string
  lastSessionDate: string
}

interface MenteesResponse {
  success: boolean
  message: string
  data: {
    mentees: Mentee[]
    totalMentees: number
    totalSessions: number
  }
}

const getStatusColor = (totalSessions: number, completedSessions: number, upcomingSessions: number) => {
  if (completedSessions === totalSessions && totalSessions > 0) {
    return "bg-blue-100 text-blue-800 hover:bg-blue-100"
  } else if (upcomingSessions > 0) {
    return "bg-green-100 text-green-800 hover:bg-green-100"
  } else {
    return "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }
}

const getStatusText = (totalSessions: number, completedSessions: number, upcomingSessions: number) => {
  if (completedSessions === totalSessions && totalSessions > 0) {
    return "Completed"
  } else if (upcomingSessions > 0) {
    return "Active"
  } else {
    return "Inactive"
  }
}

export default function MenteesPage() {
  const [loading, setLoading] = useState(true)
  const [mentees, setMentees] = useState<Mentee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [error, setError] = useState<string | null>(null)
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { token } = useAuth()

  useEffect(() => {
    fetchMentees()
  }, [])

  const fetchMentees = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
      
      const response = await axios.get<MenteesResponse>(`${API_BASE_URL}/api/mentor/mentees`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      
      if (response.data.success) {
        setMentees(response.data.data.mentees)
      } else {
        setError(response.data.message || "Failed to fetch mentees")
      }
    } catch (error: any) {
      console.error("Error fetching mentees:", error)
      setError(error.response?.data?.message || "Failed to fetch mentees")
    } finally {
      setLoading(false)
    }
  }

  const filteredMentees = mentees.filter(mentee => {
    const fullName = `${mentee.firstname} ${mentee.lastname}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         mentee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentee.university.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (statusFilter === "all") return matchesSearch
    
    const status = getStatusText(mentee.totalSessions, mentee.completedSessions, mentee.upcomingSessions).toLowerCase()
    return matchesSearch && status === statusFilter
  })

  const getNextSession = (sessions: Session[]) => {
    const upcoming = sessions
      .filter(session => session.status === "confirmed" && new Date(session.date) > new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    if (upcoming.length > 0) {
      const nextSession = upcoming[0]
      const date = new Date(nextSession.date).toLocaleDateString()
      return `${date}, ${nextSession.startTime}`
    }
    return "No upcoming"
  }

  const calculateProgress = (completedSessions: number, totalSessions: number) => {
    if (totalSessions === 0) return 0
    return Math.round((completedSessions / totalSessions) * 100)
  }

  const handleViewMentee = (mentee: Mentee) => {
    setSelectedMentee(mentee)
    setIsModalOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) return <Loader />

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="text-red-600 text-center">
              <h3 className="font-semibold mb-2">Error Loading Mentees</h3>
              <p>{error}</p>
              <Button onClick={fetchMentees} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Mentees</h1>
          <p className="text-gray-600 text-sm mt-1">Manage and track your mentees progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Total Mentees</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{mentees.length}</div>
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
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Active Mentees</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {mentees.filter(m => getStatusText(m.totalSessions, m.completedSessions, m.upcomingSessions) === "Active").length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-yellow-50">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Total Sessions</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {mentees.reduce((acc, m) => acc + m.totalSessions, 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-50">
                    <Star className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Completed Goals</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {mentees.filter(m => getStatusText(m.totalSessions, m.completedSessions, m.upcomingSessions) === "Completed").length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search mentees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Mentees ({filteredMentees.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredMentees.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No mentees found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria" 
                  : "No students have booked sessions with you yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-600">Student</TableHead>
                    <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-600">Education</TableHead>
                    <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-600">Sessions</TableHead>
                    <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-600">Progress</TableHead>
                    <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</TableHead>
                    <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-600">Next Session</TableHead>
                    <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-600">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMentees.map((mentee, index) => (
                    <TableRow
                      key={mentee.studentId}
                      className={index !== filteredMentees.length - 1 ? "border-b border-gray-100" : ""}
                    >
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={mentee.profileImageUrl} alt={`${mentee.firstname} ${mentee.lastname}`} />
                            <AvatarFallback>
                              {mentee.firstname.charAt(0)}{mentee.lastname.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {mentee.firstname} {mentee.lastname}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {mentee.email}
                            </div>
                            {mentee.phoneNumber && (
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {mentee.phoneNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {mentee.university}
                          </div>
                          <div className="text-xs text-gray-500">Class of {mentee.graduationYear}</div>
                          {mentee.education && (
                            <div className="text-xs text-gray-500">{mentee.education}</div>
                          )}
                          {mentee.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {mentee.skills.slice(0, 3).map((skill, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {mentee.skills.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{mentee.skills.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="text-sm text-gray-900">
                          {mentee.completedSessions}/{mentee.totalSessions}
                        </div>
                        <div className="text-xs text-gray-500">sessions</div>
                        {mentee.upcomingSessions > 0 && (
                          <div className="text-xs text-green-600">
                            {mentee.upcomingSessions} upcoming
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={calculateProgress(mentee.completedSessions, mentee.totalSessions)} 
                              className="h-2 flex-1" 
                            />
                            <span className="text-xs text-gray-500">
                              {calculateProgress(mentee.completedSessions, mentee.totalSessions)}%
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <Badge 
                          variant="secondary" 
                          className={getStatusColor(mentee.totalSessions, mentee.completedSessions, mentee.upcomingSessions)}
                        >
                          {getStatusText(mentee.totalSessions, mentee.completedSessions, mentee.upcomingSessions)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="text-sm text-gray-900">
                          {getNextSession(mentee.sessions)}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleViewMentee(mentee)}
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mentee Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {selectedMentee ? `${selectedMentee.firstname} ${selectedMentee.lastname}` : 'Mentee Details'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedMentee && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={selectedMentee.profileImageUrl} alt={`${selectedMentee.firstname} ${selectedMentee.lastname}`} />
                        <AvatarFallback className="text-lg">
                          {selectedMentee.firstname.charAt(0)}{selectedMentee.lastname.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {selectedMentee.firstname} {selectedMentee.lastname}
                        </h3>
                        <Badge 
                          variant="secondary" 
                          className={getStatusColor(selectedMentee.totalSessions, selectedMentee.completedSessions, selectedMentee.upcomingSessions)}
                        >
                          {getStatusText(selectedMentee.totalSessions, selectedMentee.completedSessions, selectedMentee.upcomingSessions)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedMentee.email}</span>
                      </div>
                      {selectedMentee.phoneNumber && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{selectedMentee.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedMentee.university}</h4>
                      <p className="text-sm text-gray-500">Class of {selectedMentee.graduationYear}</p>
                    </div>
                    {selectedMentee.education && (
                      <div>
                        <h5 className="font-medium text-sm">Field of Study</h5>
                        <p className="text-sm text-gray-600">{selectedMentee.education}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Skills */}
              {selectedMentee.skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Skills & Expertise</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedMentee.skills.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Session Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Session Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{selectedMentee.totalSessions}</div>
                      <div className="text-sm text-blue-600">Total Sessions</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{selectedMentee.completedSessions}</div>
                      <div className="text-sm text-green-600">Completed</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{selectedMentee.upcomingSessions}</div>
                      <div className="text-sm text-yellow-600">Upcoming</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {calculateProgress(selectedMentee.completedSessions, selectedMentee.totalSessions)}%
                      </div>
                      <div className="text-sm text-purple-600">Progress</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{calculateProgress(selectedMentee.completedSessions, selectedMentee.totalSessions)}%</span>
                    </div>
                    <Progress 
                      value={calculateProgress(selectedMentee.completedSessions, selectedMentee.totalSessions)} 
                      className="h-3" 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Session History */}
              {selectedMentee.sessions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Session History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedMentee.sessions
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((session, idx) => (
                        <div key={session.sessionId} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              session.status === 'completed' ? 'bg-green-100' :
                              session.status === 'confirmed' ? 'bg-blue-100' :
                              'bg-gray-100'
                            }`}>
                              <Calendar className={`h-4 w-4 ${
                                session.status === 'completed' ? 'text-green-600' :
                                session.status === 'confirmed' ? 'text-blue-600' :
                                'text-gray-600'
                              }`} />
                            </div>
                            <div>
                              <div className="font-medium text-sm">{session.sessionTypeName}</div>
                              <div className="text-xs text-gray-500">
                                {formatDate(session.date)} • {formatTime(session.startTime)} - {formatTime(session.endTime)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Duration: {session.duration} min • ${session.price}
                              </div>
                            </div>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={
                              session.status === 'completed' ? 'bg-green-100 text-green-800' :
                              session.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Mentorship Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mentorship Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-sm text-gray-600">First Session</h5>
                      <p className="text-sm">{formatDate(selectedMentee.firstSessionDate)}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm text-gray-600">Latest Session</h5>
                      <p className="text-sm">{formatDate(selectedMentee.lastSessionDate)}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h5 className="font-medium text-sm text-gray-600 mb-2">Next Upcoming Session</h5>
                    <p className="text-sm">{getNextSession(selectedMentee.sessions)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
