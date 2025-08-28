"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Loader } from "@/components/common/Loader"
import { MentorStatsCards } from "@/components/MentorComponents/mentor-stats-cards"
import { RecentSessions } from "@/components/MentorComponents/recent-sessions"
import { MenteeProgress } from "@/components/MentorComponents/mentee-progress"
import { QuickActions } from "@/components/MentorComponents/quick-actions"
import { MinimalProfileCompletion } from "@/components/MentorComponents/MinimalProfileCompletion"
import { Download, Plus, TrendingUp } from "lucide-react"

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

// Mock data - Replace with actual API calls
const statsData = {
  totalMentees: 15,
  totalSessions: 142,
  averageRating: 4.8,
  completedSessions: 128,
  upcomingSessions: 8,
  hoursSpent: 340,
}

const recentSessions = [
  {
    id: "1",
    studentName: "Ethan Harper",
    studentEmail: "ethan.harper@email.com",
    sessionDate: "2024-08-15",
    sessionTime: "10:00 AM",
    duration: 60,
    status: "upcoming" as const,
    topic: "React Component Architecture",
    type: "one-on-one" as const,
  },
  {
    id: "2",
    studentName: "Olivia Bennett",
    studentEmail: "olivia.bennett@email.com",
    sessionDate: "2024-08-14",
    sessionTime: "2:00 PM",
    duration: 45,
    status: "completed" as const,
    topic: "Career Development Planning",
    type: "one-on-one" as const,
  },
  {
    id: "3",
    studentName: "Noah Carter",
    studentEmail: "noah.carter@email.com",
    sessionDate: "2024-08-13",
    sessionTime: "11:00 AM",
    duration: 90,
    status: "completed" as const,
    topic: "Technical Interview Preparation",
    type: "workshop" as const,
  },
  {
    id: "4",
    studentName: "Emma Wilson",
    studentEmail: "emma.wilson@email.com",
    sessionDate: "2024-08-16",
    sessionTime: "3:00 PM",
    duration: 60,
    status: "upcoming" as const,
    topic: "JavaScript Fundamentals",
    type: "one-on-one" as const,
  },
]

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

export default function MentorDashboard() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading for demonstration
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return <Loader />

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back, Dr. Wilson!</h1>
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

      {/* Profile Completion Alert */}
      <MinimalProfileCompletion />

      {/* Stats Cards */}
      <MentorStatsCards data={statsData} />

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
        <RecentSessions sessions={recentSessions} />
        <MenteeProgress mentees={menteeProgress} />
      </div>
    </div>
  )
}
