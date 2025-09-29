"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Loader } from "@/components/common/Loader"
import { MentorStatsCards } from "@/components/MentorComponents/mentor-stats-cards"
import { RecentSessions } from "@/components/MentorComponents/recent-sessions"
import { MenteeProgress } from "@/components/MentorComponents/mentee-progress"
import { QuickActions } from "@/components/MentorComponents/quick-actions"
import { TrendingUp } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import axios from "axios"
import { toast } from "sonner"

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
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuth()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
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

  if (loading) return <Loader />
  
  if (error || !dashboardData) {
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
          studentEmail: '', // Not provided in API response
          sessionDate: new Date(session.sessionDate).toISOString().split('T')[0],
          sessionTime: session.startTime,
          duration: session.duration,
          status: session.status as "upcoming" | "completed" | "cancelled",
          topic: session.sessionType,
          type: "one-on-one" as const
        }))} />
        <MenteeProgress mentees={[]} /> {/* Empty for now as we don't have mentee progress data */}
      </div>
    </div>
  )
}
