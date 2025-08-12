"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Loader } from "@/components/common/Loader"
import { 
  Search, 
  Filter, 
  User, 
  MessageSquare, 
  Calendar, 
  Eye, 
  Plus,
  Star,
  Clock,
  TrendingUp
} from "lucide-react"

interface Mentee {
  id: string
  name: string
  email: string
  avatar?: string
  major: string
  year: string
  progress: number
  goalTitle: string
  sessionsCompleted: number
  totalSessions: number
  lastSession: string
  nextSession?: string
  status: "active" | "inactive" | "completed"
  rating: number
  joinedDate: string
}

// Mock data - Replace with actual API calls
const mockMentees: Mentee[] = [
  {
    id: "1",
    name: "Ethan Harper",
    email: "ethan.harper@email.com",
    major: "Computer Science",
    year: "Senior",
    progress: 75,
    goalTitle: "Full-Stack Developer Role",
    sessionsCompleted: 8,
    totalSessions: 12,
    lastSession: "Aug 10, 2024",
    nextSession: "Aug 15, 10:00 AM",
    status: "active",
    rating: 4.8,
    joinedDate: "Jan 15, 2024",
  },
  {
    id: "2",
    name: "Olivia Bennett",
    email: "olivia.bennett@email.com",
    major: "Business Administration",
    year: "Junior",
    progress: 60,
    goalTitle: "Product Manager Transition",
    sessionsCompleted: 6,
    totalSessions: 10,
    lastSession: "Aug 14, 2024",
    nextSession: "Aug 18, 2:00 PM",
    status: "active",
    rating: 4.6,
    joinedDate: "Feb 20, 2024",
  },
  {
    id: "3",
    name: "Noah Carter",
    email: "noah.carter@email.com",
    major: "Software Engineering",
    year: "Graduate",
    progress: 90,
    goalTitle: "Senior Developer Position",
    sessionsCompleted: 9,
    totalSessions: 10,
    lastSession: "Aug 13, 2024",
    status: "active",
    rating: 4.9,
    joinedDate: "Mar 5, 2024",
  },
  {
    id: "4",
    name: "Emma Wilson",
    email: "emma.wilson@email.com",
    major: "Data Science",
    year: "Senior",
    progress: 45,
    goalTitle: "Data Analyst Role",
    sessionsCompleted: 4,
    totalSessions: 8,
    lastSession: "Aug 12, 2024",
    nextSession: "Aug 16, 3:00 PM",
    status: "active",
    rating: 4.7,
    joinedDate: "Apr 10, 2024",
  },
  {
    id: "5",
    name: "James Rodriguez",
    email: "james.rodriguez@email.com",
    major: "Information Systems",
    year: "Sophomore",
    progress: 100,
    goalTitle: "Internship at Tech Company",
    sessionsCompleted: 6,
    totalSessions: 6,
    lastSession: "Aug 5, 2024",
    status: "completed",
    rating: 5.0,
    joinedDate: "May 1, 2024",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 hover:bg-green-100"
    case "inactive":
      return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    case "completed":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }
}

export default function MenteesPage() {
  const [loading, setLoading] = useState(true)
  const [mentees, setMentees] = useState<Mentee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    // Simulate loading and data fetching
    const timer = setTimeout(() => {
      setMentees(mockMentees)
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const filteredMentees = mentees.filter(mentee => {
    const matchesSearch = mentee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentee.major.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || mentee.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) return <Loader />

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Mentees</h1>
          <p className="text-gray-600 text-sm mt-1">Manage and track your mentees' progress</p>
        </div>
        <Button className="bg-[#535c91] hover:bg-[#464f7a] gap-2">
          <Plus className="h-4 w-4" />
          Add New Mentee
        </Button>
      </div>

      {/* Stats Cards */}
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
                  {mentees.filter(m => m.status === "active").length}
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
                    <Star className="h-4 w-4 text-yellow-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Avg. Rating</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {(mentees.reduce((acc, m) => acc + m.rating, 0) / mentees.length).toFixed(1)}
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
                    <Clock className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Completed Goals</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {mentees.filter(m => m.status === "completed").length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
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

      {/* Mentees Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Mentees ({filteredMentees.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200">
                  <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-600">Mentee</TableHead>
                  <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-600">Goal & Progress</TableHead>
                  <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-600">Sessions</TableHead>
                  <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-600">Rating</TableHead>
                  <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</TableHead>
                  <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-600">Next Session</TableHead>
                  <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMentees.map((mentee, index) => (
                  <TableRow
                    key={mentee.id}
                    className={index !== filteredMentees.length - 1 ? "border-b border-gray-100" : ""}
                  >
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={mentee.avatar} alt={mentee.name} />
                          <AvatarFallback>
                            <User className="h-5 w-5 text-gray-600" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{mentee.name}</div>
                          <div className="text-xs text-gray-500">{mentee.email}</div>
                          <div className="text-xs text-gray-500">{mentee.major} • {mentee.year}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-900">{mentee.goalTitle}</div>
                        <div className="flex items-center gap-2">
                          <Progress value={mentee.progress} className="h-2 flex-1" />
                          <span className="text-xs text-gray-500">{mentee.progress}%</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="text-sm text-gray-900">
                        {mentee.sessionsCompleted}/{mentee.totalSessions}
                      </div>
                      <div className="text-xs text-gray-500">sessions</div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-gray-900">{mentee.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <Badge variant="secondary" className={getStatusColor(mentee.status)}>
                        {mentee.status.charAt(0).toUpperCase() + mentee.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="text-sm text-gray-900">
                        {mentee.nextSession || "No upcoming"}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <MessageSquare className="h-3 w-3" />
                          Message
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Calendar className="h-3 w-3" />
                          Schedule
                        </Button>
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
