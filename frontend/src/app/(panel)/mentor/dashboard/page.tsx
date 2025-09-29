"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Loader } from "@/components/common/Loader"
import { MentorStatsCards } from "@/components/MentorComponents/mentor-stats-cards"
import { RecentSessions } from "@/components/MentorComponents/recent-sessions"
import { MenteeProgress } from "@/components/MentorComponents/mentee-progress"
import { QuickActions } from "@/components/MentorComponents/quick-actions"
import { Download, Plus, TrendingUp } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import axios from "axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

// Chart data for mentor performance
const chartData = [
  { name: "Jan", sessions: 12, rating: 4.2 },
  { name: "Feb", sessions: 15, rating: 4.5 },
  { name: "Mar", sessions: 18, rating: 4.3 },
  { name: "Apr", sessions: 22, rating: 4.7 },
  { name: "May", sessions: 25, rating: 4.8 },
  { name: "Jun", sessions: 28, rating: 4.9 },
  { name: "Jul", sessions: 32, rating: 4.8 },
]

// Fallback mentee progress data (until API provides this)
const menteeProgress = [
  {
    id: "1",
    name: "Ethan Harper",
    email: "ethan.harper@email.com",
    progress: 75,
    goalTitle: "Full-Stack Developer Role",
    sessionsCompleted: 8,
    totalSessions: 12,
    lastSession: "Aug 10",
    nextSession: "Aug 15, 10:00 AM",
  },
  {
    id: "2",
    name: "Olivia Bennett", 
    email: "olivia.bennett@email.com",
    progress: 60,
    goalTitle: "Product Manager Transition",
    sessionsCompleted: 6,
    totalSessions: 10,
    lastSession: "Aug 14",
    nextSession: "Aug 18, 2:00 PM",
  },
  {
    id: "3",
    name: "Noah Carter",
    email: "noah.carter@email.com", 
    progress: 90,
    goalTitle: "Senior Developer Position",
    sessionsCompleted: 9,
    totalSessions: 10,
    lastSession: "Aug 13",
  },
]

// Interface for dashboard data
interface DashboardData {
  mentor: {
    id: string;
    name: string;
    fullName: string;
    title: string;
    profileImage?: string;
  };
  analytics: {
    totalMentees: number;
    totalSessions: number;
    averageRating: number;
    completedSessions: number;
    upcomingSessions: number;
    hoursSpent: number;
  };
  recentSessions: Array<{
    id: string;
    studentName: string;
    sessionDate: string;
    startTime: string;
    duration: number;
    status: string;
    sessionType: string;
  }>;
}

export default function MentorDashboard() {
  const [loading, setLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { token, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && token) {
      fetchDashboardData()
    }
  }, [token, authLoading])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!token) {
        setError('Authentication required. Please log in.')
        return
      }
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      
      const response = await axios.get(`${API_BASE_URL}/api/mentor/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        setDashboardData(response.data.data)
      } else {
        throw new Error(response.data.message || 'Failed to fetch dashboard data')
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
      setError(error.response?.data?.message || error.message || 'Failed to load dashboard data')
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Show loading when auth is loading, we're fetching data, or we have token but no data yet
  if (authLoading || loading || (token && !dashboardData && !error)) return <Loader />
  
  if (error || (!loading && !dashboardData)) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {error || 'Unable to load dashboard data'}
            </p>
            <button 
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-[#535c91] text-white rounded-md hover:bg-[#464f7a]"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Ensure dashboardData is not null beyond this point
  if (!dashboardData) return <Loader />

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome Back, {dashboardData.mentor.name}!
          </h1>
          <p className="text-gray-600 text-sm mt-1">Here's your mentoring activity overview</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
          <Button className="bg-[#535c91] hover:bg-[#464f7a] gap-2">
            <Plus className="h-4 w-4" />
            Schedule Session
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <MentorStatsCards data={dashboardData.analytics} />

      {/* Charts and Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-900">Performance Overview</CardTitle>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">+25% this month</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#535c91" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#535c91" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    className="text-xs text-gray-600"
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    className="text-xs text-gray-600"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    stroke="#535c91"
                    fillOpacity={1}
                    fill="url(#colorSessions)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <QuickActions />
      </div>

      {/* Recent Sessions and Mentee Progress Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RecentSessions sessions={dashboardData.recentSessions.map(session => ({
          id: session.id,
          studentName: session.studentName,
          studentEmail: `${session.studentName.toLowerCase().replace(' ', '.')}@email.com`, // Generate email
          sessionDate: new Date(session.sessionDate).toISOString().split('T')[0],
          sessionTime: session.startTime,
          duration: session.duration,
          status: session.status as "upcoming" | "completed" | "cancelled",
          topic: session.sessionType || 'Mentoring Session',
          type: "one-on-one" as const
        }))} />
        <MenteeProgress mentees={menteeProgress} />
      </div>
    </div>
  )
}
