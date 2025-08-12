"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader } from "@/components/common/Loader"
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
  CheckCircle
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

// Mock data - Replace with actual API calls
const mockSessions: Session[] = [
  {
    id: "1",
    studentName: "Ethan Harper",
    studentEmail: "ethan.harper@email.com",
    sessionDate: "2024-08-15",
    sessionTime: "10:00 AM",
    duration: 60,
    status: "upcoming",
    topic: "React Component Architecture",
    type: "one-on-one",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    createdAt: "2024-08-10",
  },
  {
    id: "2",
    studentName: "Olivia Bennett",
    studentEmail: "olivia.bennett@email.com",
    sessionDate: "2024-08-14",
    sessionTime: "2:00 PM",
    duration: 45,
    status: "completed",
    topic: "Career Development Planning",
    type: "one-on-one",
    notes: "Discussed career goals and next steps for PM role",
    createdAt: "2024-08-12",
  },
]

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
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Simulate loading and data fetching
    const timer = setTimeout(() => {
      setSessions(mockSessions)
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return <Loader />

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
                <div className="text-2xl font-bold text-gray-900">{sessions.length}</div>
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
                <div className="text-2xl font-bold text-gray-900">
                  {sessions.filter(s => s.status === "upcoming").length}
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
                  <div className="p-2 rounded-lg bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Completed</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {sessions.filter(s => s.status === "completed").length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Recent Sessions
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
                {sessions.map((session, index) => (
                  <TableRow
                    key={session.id}
                    className={index !== sessions.length - 1 ? "border-b border-gray-100" : ""}
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}