"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Home, Users, Calendar, User, HelpCircle, MessageSquare, ChevronDown } from "lucide-react"
import type { JSX } from "react/jsx-runtime"

// TypeScript interfaces
interface SessionStats {
  totalSessions: number
  averageRating: number
  studentsMentored: number
}

interface UpcomingSession {
  id: number
  studentName: string
  sessionDate: string
  sessionTime: string
  status: "Scheduled" | "Completed" | "Cancelled"
}

interface SidebarItem {
  icon: JSX.Element
  label: string
  href: string
  active?: boolean
}

// Mock data
const sessionStats: SessionStats = {
  totalSessions: 15,
  averageRating: 4.8,
  studentsMentored: 10,
}

const upcomingSessions: UpcomingSession[] = [
  {
    id: 1,
    studentName: "Ethan Harper",
    sessionDate: "2024-07-15",
    sessionTime: "10:00 AM",
    status: "Scheduled",
  },
  {
    id: 2,
    studentName: "Olivia Bennett",
    sessionDate: "2024-07-16",
    sessionTime: "2:00 PM",
    status: "Scheduled",
  },
  {
    id: 3,
    studentName: "Noah Carter",
    sessionDate: "2024-07-17",
    sessionTime: "11:00 AM",
    status: "Scheduled",
  },
]

const sidebarItems: SidebarItem[] = [
  {
    icon: <Home className="h-5 w-5" />,
    label: "Dashboard",
    href: "/mentor/dashboard",
  },
  {
    icon: <Users className="h-5 w-5" />,
    label: "Mentorship",
    href: "/mentor/mentorship",
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    label: "Sessions",
    href: "/mentor/sessions",
    active: true,
  },
  {
    icon: <User className="h-5 w-5" />,
    label: "Profile",
    href: "/mentor/profile",
  },
]

const bottomSidebarItems: SidebarItem[] = [
  {
    icon: <HelpCircle className="h-5 w-5" />,
    label: "Help",
    href: "/help",
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    label: "Feedback",
    href: "/feedback",
  },
]

// Simple line chart component
function ProgressChart() {
  return (
    <div className="w-full h-48 flex items-end justify-between px-4 py-4">
      {/* Week 1 */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-24 flex items-end">
          <svg width="64" height="96" viewBox="0 0 64 96" className="text-gray-400">
            <path
              d="M 8 80 Q 16 60 24 65 Q 32 70 40 55 Q 48 40 56 45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
        <span className="text-xs text-gray-500 mt-2">Week 1</span>
      </div>

      {/* Week 2 */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-24 flex items-end">
          <svg width="64" height="96" viewBox="0 0 64 96" className="text-gray-400">
            <path
              d="M 8 70 Q 16 50 24 55 Q 32 60 40 45 Q 48 30 56 35"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
        <span className="text-xs text-gray-500 mt-2">Week 2</span>
      </div>

      {/* Week 3 */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-24 flex items-end">
          <svg width="64" height="96" viewBox="0 0 64 96" className="text-gray-400">
            <path
              d="M 8 75 Q 16 55 24 60 Q 32 65 40 50 Q 48 35 56 40"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
        <span className="text-xs text-gray-500 mt-2">Week 3</span>
      </div>

      {/* Week 4 */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-24 flex items-end">
          <svg width="64" height="96" viewBox="0 0 64 96" className="text-gray-400">
            <path
              d="M 8 78 Q 16 58 24 63 Q 32 68 40 53 Q 48 38 56 43"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
        <span className="text-xs text-gray-500 mt-2">Week 4</span>
      </div>

      {/* Week 5 */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-24 flex items-end">
          <svg width="64" height="96" viewBox="0 0 64 96" className="text-gray-400">
            <path
              d="M 8 65 Q 16 45 24 50 Q 32 55 40 40 Q 48 25 56 30"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
        <span className="text-xs text-gray-500 mt-2">Week 5</span>
      </div>

      {/* Week 6 */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-24 flex items-end">
          <svg width="64" height="96" viewBox="0 0 64 96" className="text-gray-400">
            <path
              d="M 8 72 Q 16 52 24 57 Q 32 62 40 47 Q 48 32 56 37"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
        <span className="text-xs text-gray-500 mt-2">Week 6</span>
      </div>

      {/* Week 7 */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-24 flex items-end">
          <svg width="64" height="96" viewBox="0 0 64 96" className="text-gray-400">
            <path
              d="M 8 68 Q 16 48 24 53 Q 32 58 40 43 Q 48 28 56 33"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
        <span className="text-xs text-gray-500 mt-2">Week 7</span>
      </div>
    </div>
  )
}

export default function SessionsPage(): JSX.Element {
  const [selectedStudent, setSelectedStudent] = useState<string>("All Students")
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>("Last 3 Months")

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-100">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-xl text-gray-900">LevelUP</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-1">
          {sidebarItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                item.active ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-100">
          <div className="space-y-1">
            {bottomSidebarItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                {item.icon}
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Sessions Overview</h1>

              {/* Filters */}
              <div className="flex gap-4">
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Students">Student</SelectItem>
                    <SelectItem value="Ethan Harper">Ethan Harper</SelectItem>
                    <SelectItem value="Olivia Bennett">Olivia Bennett</SelectItem>
                    <SelectItem value="Noah Carter">Noah Carter</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedTimePeriod} onValueChange={setSelectedTimePeriod}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Last 3 Months">Time Period</SelectItem>
                    <SelectItem value="Last Week">Last Week</SelectItem>
                    <SelectItem value="Last Month">Last Month</SelectItem>
                    <SelectItem value="Last 3 Months">Last 3 Months</SelectItem>
                    <SelectItem value="Last 6 Months">Last 6 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Sessions</h3>
                  <p className="text-3xl font-bold text-gray-900">{sessionStats.totalSessions}</p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Average Student Rating</h3>
                  <p className="text-3xl font-bold text-gray-900">{sessionStats.averageRating}</p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Students Mentored</h3>
                  <p className="text-3xl font-bold text-gray-900">{sessionStats.studentsMentored}</p>
                </CardContent>
              </Card>
            </div>

            {/* Student Progress */}
            <Card className="bg-white border border-gray-200 mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Student Progress</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Progress Over Time</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-green-600">+15%</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Last 3 Months +15%</p>
                </div>

                <ProgressChart />
              </CardContent>
            </Card>

            {/* Upcoming Sessions */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Upcoming Sessions</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200">
                      <tr>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Student Name</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Session Date</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Session Time</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingSessions.map((session, index) => (
                        <tr
                          key={session.id}
                          className={index !== upcomingSessions.length - 1 ? "border-b border-gray-100" : ""}
                        >
                          <td className="py-4 px-6 text-sm font-medium text-gray-900">{session.studentName}</td>
                          <td className="py-4 px-6 text-sm text-gray-600">{session.sessionDate}</td>
                          <td className="py-4 px-6 text-sm text-gray-600">{session.sessionTime}</td>
                          <td className="py-4 px-6">
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                              {session.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
