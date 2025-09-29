"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Briefcase, Clock, CheckCircle, Calendar, TrendingUp, BarChart3, PieChart } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { DateRange } from "react-day-picker"
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
  jobType?: string
  workMode?: string
  isActive: boolean
  createdAt: string
  applicationCount: number
  applicationDeadline?: string
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

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [timeRange, setTimeRange] = useState("30") // 30, 90, 180 days
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [selectedInternship, setSelectedInternship] = useState<InternshipData | null>(null)

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

  const getInternshipStatus = (internship: InternshipData) => {
    const now = new Date()
    const applicationDeadline = internship.applicationDeadline ? new Date(internship.applicationDeadline) : null
    
    // If no deadline is set, show as active (green)
    if (!applicationDeadline) {
      return { status: 'Active', variant: 'default' as const }
    }
    
    // Compare current date with application deadline
    if (now > applicationDeadline) {
      return { status: 'Inactive', variant: 'secondary' as const }  // Gray - deadline passed
    } else {
      return { status: 'Active', variant: 'default' as const }      // Green - deadline not passed
    }
  }

  const formatWorkMode = (workMode: string | undefined | null) => {
    if (!workMode || typeof workMode !== 'string') {
      return 'Not Specified'
    }
    return workMode.charAt(0).toUpperCase() + workMode.slice(1).toLowerCase()
  }

  const handleViewInternship = (internship: InternshipData) => {
    setSelectedInternship(internship)
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
          <CardContent className="p-6">
            {dashboardData?.analytics.statusBreakdown && dashboardData.analytics.statusBreakdown.length > 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                <div className="w-full flex justify-center">
                  <div style={{ width: '280px', height: '280px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <Pie
                          data={formatStatusData(dashboardData?.analytics.statusBreakdown || [])}
                          cx="50%"
                          cy="50%"
                          startAngle={90}
                          endAngle={450}
                          labelLine={false}
                          label={false}
                          outerRadius={100}
                          innerRadius={40}
                          fill="#8884d8"
                          dataKey="value"
                          stroke="#ffffff"
                          strokeWidth={3}
                        >
                          {formatStatusData(dashboardData?.analytics.statusBreakdown || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => [`${value} applications`, name]}
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-3 w-full">
                  {formatStatusData(dashboardData?.analytics.statusBreakdown || []).map((entry, index, array) => {
                    const totalApplications = array.reduce((sum, item) => sum + item.value, 0);
                    const percentage = totalApplications > 0 ? ((entry.value / totalApplications) * 100).toFixed(1) : 0;
                    
                    return (
                      <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700">
                            {entry.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {entry.value} applications ({percentage}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm">No application data available</p>
                </div>
              </div>
            )}
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
              {dashboardData?.recentInternships.map((internship) => {
                const statusInfo = getInternshipStatus(internship)
                return (
                  <TableRow key={internship._id}>
                    <TableCell className="font-medium">{internship.title}</TableCell>
                    <TableCell className="text-muted-foreground">{internship.location}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatWorkMode(internship.workMode || internship.jobType)}
                    </TableCell>
                    <TableCell>{internship.applicationCount}</TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>
                        {statusInfo.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(internship.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewInternship(internship)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Internship Details Modal */}
      <Dialog open={!!selectedInternship} onOpenChange={() => setSelectedInternship(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Internship Details</DialogTitle>
          </DialogHeader>
          {selectedInternship && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="border-b pb-4">
                <h3 className="text-xl font-semibold mb-2">{selectedInternship.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    📍 {selectedInternship.location}
                  </span>
                  <span className="flex items-center gap-1">
                    💼 {formatWorkMode(selectedInternship.workMode || selectedInternship.jobType)}
                  </span>
                  <Badge variant={getInternshipStatus(selectedInternship).variant}>
                    {getInternshipStatus(selectedInternship).status}
                  </Badge>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedInternship.applicationCount}
                  </div>
                  <div className="text-sm text-gray-600">Applications</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {new Date(selectedInternship.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600">Posted Date</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedInternship.isActive ? 'Active' : 'Inactive'}
                  </div>
                  <div className="text-sm text-gray-600">Current Status</div>
                </div>
              </div>

              {/* Application Deadline */}
              {selectedInternship.applicationDeadline && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Application Timeline</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Posted Date</div>
                      <div className="font-medium">
                        {new Date(selectedInternship.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Application Deadline</div>
                      <div className="font-medium">
                        {new Date(selectedInternship.applicationDeadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => window.open(`/internship/${selectedInternship._id}`, '_blank')}
                  className="flex-1"
                >
                  View Full Details
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.open(`/company/applicants?internship=${selectedInternship._id}`, '_blank')}
                  className="flex-1"
                >
                  View Applicants
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}