"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Briefcase, Clock, CheckCircle, Calendar, TrendingUp, BarChart3, PieChart } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { toast } from "sonner"

interface DashboardStats {
  totalInternships: number
  totalApplications: number
  pendingReviews: number
  studentsApproved: number
}

interface AnalyticsData {
  applicationsOverTime: Array<{ _id: string; count: number }>
  statusBreakdown: Array<{ _id: string; count: number }>
  topPositions: Array<{ _id: string; count: number }>
}

interface InternshipData {
  _id: string
  title: string
  location: string
  jobType: string
  isActive: boolean
  createdAt: string
  applicationCount: number
}

interface DashboardData {
  stats: DashboardStats
  analytics: AnalyticsData
  recentInternships: InternshipData[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const STATUS_COLORS: Record<string, string> = {
  pending: '#FFBB28',
  reviewed: '#00C49F', 
  shortlisted: '#0088FE',
  accepted: '#10B981',
  rejected: '#EF4444'
}

const mockApplicants = [
  {
    name: "Ethan Carter",
    university: "Stanford University",
    major: "Computer Science",
    skills: "Python, Java, C++",
  },
  {
    name: "Olivia Bennett",
    university: "MIT",
    major: "Electrical Engineering",
    skills: "MATLAB, Simulink",
  },
  {
    name: "Noah Thompson",
    university: "UC Berkeley",
    major: "Data Science",
    skills: "R, SQL, Machine Learning",
  },
  {
    name: "Ava Rodriguez",
    university: "Carnegie Mellon",
    major: "Software Engineering",
    skills: "JavaScript, React, Node.js",
  },
  {
    name: "Liam Walker",
    university: "University of Michigan",
    major: "Computer Engineering",
    skills: "Verilog, VHDL",
  },
]

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [timeRange, setTimeRange] = useState("30") // 30, 90, 180 days
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  })

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      
      if (!token) {
        toast.error("Please login to view dashboard")
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/company/dashboard-analytics?timeRange=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setDashboardData(result.data)
        } else {
          toast.error("Failed to fetch dashboard data")
        }
      } else {
        toast.error("Failed to fetch dashboard data")
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Error fetching dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [timeRange])

  const formatChartData = (data: Array<{ _id: string; count: number }>) => {
    return data.map(item => ({
      date: item._id,
      applications: item.count
    }))
  }

  const formatStatusData = (data: Array<{ _id: string; count: number }>) => {
    return data.map(item => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.count,
      color: STATUS_COLORS[item._id] || '#8884D8'
    }))
  }

  const formatPositionsData = (data: Array<{ _id: string; count: number }>) => {
    return data.map(item => ({
      position: item._id,
      applications: item.count
    }))
  }

  if (loading) {
    return (
      <div className="space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Loading dashboard data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center p-6">
                <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="ml-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-12"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's an overview of your internship program.</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 3 Months</SelectItem>
              <SelectItem value="180">Last 6 Months</SelectItem>
            </SelectContent>
          </Select>
          <DatePickerWithRange
            date={dateRange}
            setDate={setDateRange}
          />
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Internships</p>
                <p className="text-2xl font-bold">{dashboardData?.stats.totalInternships || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Applicants</p>
                <p className="text-2xl font-bold">{dashboardData?.stats.totalApplications || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold">{dashboardData?.stats.pendingReviews || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Students Approved</p>
                <p className="text-2xl font-bold">{dashboardData?.stats.studentsApproved || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Applications Over Time */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Applications Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formatChartData(dashboardData?.analytics.applicationsOverTime || [])}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return `${date.getMonth() + 1}/${date.getDate()}`
                  }}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => `Date: ${value}`}
                  formatter={(value) => [`${value} applications`, 'Applications']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="#0088FE" 
                  strokeWidth={2}
                  dot={{ fill: '#0088FE' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Application Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={formatStatusData(dashboardData?.analytics.statusBreakdown || [])}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {formatStatusData(dashboardData?.analytics.statusBreakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} applications`, 'Applications']} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Positions Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Top Internship Positions by Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formatPositionsData(dashboardData?.analytics.topPositions || [])}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="position" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} applications`, 'Applications']} />
              <Legend />
              <Bar dataKey="applications" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Internship Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Internship Postings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboardData?.recentInternships.map((internship) => (
                <TableRow key={internship._id}>
                  <TableCell className="font-medium">{internship.title}</TableCell>
                  <TableCell className="text-muted-foreground">{internship.location}</TableCell>
                  <TableCell className="text-muted-foreground">{internship.jobType}</TableCell>
                  <TableCell>{internship.applicationCount}</TableCell>
                  <TableCell>
                    <Badge variant={internship.isActive ? "default" : "secondary"}>
                      {internship.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(internship.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Applicant Filtering and Viewing - Keep as is */}
      <Card>
        <CardHeader>
          <CardTitle>Applicant Filtering and Viewing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="internship-filter">Internship</Label>
              <Input id="internship-filter" placeholder="Select internship" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Input id="status-filter" placeholder="Select status" />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Major</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Resume</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockApplicants.map((applicant, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{applicant.name}</TableCell>
                  <TableCell className="text-muted-foreground">{applicant.university}</TableCell>
                  <TableCell className="text-muted-foreground">{applicant.major}</TableCell>
                  <TableCell className="text-muted-foreground">{applicant.skills}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}