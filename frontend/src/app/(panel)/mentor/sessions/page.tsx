"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Home, Users, Calendar, User, HelpCircle, MessageSquare, Video, Phone } from "lucide-react"
import type { JSX } from "react/jsx-runtime" // Import JSX to fix the undeclared variable error

// TypeScript interfaces
interface MentorshipSession {
  id: number
  date: string
  time: string
  mentorName: string
  topic: string
  avatar: string
  avatarBg: string
  status: "upcoming" | "completed" | "cancelled"
}

interface SidebarItem {
  icon: JSX.Element // Change type to JSX.Element
  label: string
  href: string
  active?: boolean
}

// Mock data for upcoming sessions - exactly matching the design
const upcomingSessions: MentorshipSession[] = [
  {
    id: 1,
    date: "Today",
    time: "10:00 AM",
    mentorName: "Alex Johnson",
    topic: "Career Path Guidance",
    avatar: "/placeholder.svg?height=120&width=120",
    avatarBg: "bg-amber-200",
    status: "upcoming",
  },
  {
    id: 2,
    date: "Tomorrow",
    time: "2:00 PM",
    mentorName: "Emily Davis",
    topic: "Resume Review",
    avatar: "/placeholder.svg?height=120&width=120",
    avatarBg: "bg-pink-200",
    status: "upcoming",
  },
  {
    id: 3,
    date: "Today",
    time: "10:00 AM",
    mentorName: "Alex Johnson",
    topic: "Career Path Guidance",
    avatar: "/placeholder.svg?height=120&width=120",
    avatarBg: "bg-amber-200",
    status: "upcoming",
  },
  {
    id: 4,
    date: "Tomorrow",
    time: "2:00 PM",
    mentorName: "Emily Davis",
    topic: "Resume Review",
    avatar: "/placeholder.svg?height=120&width=120",
    avatarBg: "bg-pink-200",
    status: "upcoming",
  },
  {
    id: 5,
    date: "Today",
    time: "10:00 AM",
    mentorName: "Alex Johnson",
    topic: "Career Path Guidance",
    avatar: "/placeholder.svg?height=120&width=120",
    avatarBg: "bg-amber-200",
    status: "upcoming",
  },
  {
    id: 6,
    date: "Tomorrow",
    time: "2:00 PM",
    mentorName: "Emily Davis",
    topic: "Resume Review",
    avatar: "/placeholder.svg?height=120&width=120",
    avatarBg: "bg-pink-200",
    status: "upcoming",
  },
  {
    id: 7,
    date: "Tomorrow",
    time: "2:00 PM",
    mentorName: "Emily Davis",
    topic: "Resume Review",
    avatar: "/placeholder.svg?height=120&width=120",
    avatarBg: "bg-pink-200",
    status: "upcoming",
  },
  {
    id: 8,
    date: "Today",
    time: "10:00 AM",
    mentorName: "Alex Johnson",
    topic: "Career Path Guidance",
    avatar: "/placeholder.svg?height=120&width=120",
    avatarBg: "bg-amber-200",
    status: "upcoming",
  },
]

const sidebarItems: SidebarItem[] = [
  {
    icon: <Home className="h-5 w-5" />,
    label: "Dashboard",
    href: "/mentor/dashboard"
  },
  {
    icon: <Users className="h-5 w-5" />,
    label: "Mentorship",
    href: "/mentor/mentorship"
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    label: "Sessions",
    href: "/mentor/sessions",
    active: true
  },
  {
    icon: <User className="h-5 w-5" />,
    label: "Profile",
    href: "/mentor/profile"
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

export default function SessionsPage(): JSX.Element {
  const [hoveredSession, setHoveredSession] = useState<number | null>(null)

  const handleSessionClick = (sessionId: number): void => {
    console.log("Session clicked:", sessionId)
  }

  const handleJoinSession = (sessionId: number): void => {
    console.log("Joining session:", sessionId)
  }

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
      <div className="flex-1 overflow-auto bg-white">
        <div className="p-8">
          <div className="max-w-4xl">
            {/* Header */}
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Mentorship Sessions</h1>

            {/* Upcoming Sessions */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Sessions</h2>

              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <Card
                    key={session.id}
                    className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer bg-white"
                    onMouseEnter={() => setHoveredSession(session.id)}
                    onMouseLeave={() => setHoveredSession(null)}
                    onClick={() => handleSessionClick(session.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {/* Date and Time */}
                          <div className="text-sm text-gray-500 font-medium mb-2">
                            {session.date}, {session.time}
                          </div>

                          {/* Session Title */}
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Mentorship Session with {session.mentorName}
                          </h3>

                          {/* Topic */}
                          <p className="text-sm text-gray-600">Topic: {session.topic}</p>

                          {/* Action Buttons - Show on Hover */}
                          {hoveredSession === session.id && (
                            <div className="flex gap-2 mt-4">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleJoinSession(session.id)
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Video className="h-4 w-4 mr-2" />
                                Join Session
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                Call
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Avatar */}
                        <div className="ml-6">
                          <div
                            className={`w-24 h-20 rounded-xl ${session.avatarBg} flex items-center justify-center overflow-hidden`}
                          >
                            <Avatar className="w-20 h-16">
                              <AvatarImage src="/placeholder.svg" alt={session.mentorName} />
                              <AvatarFallback className="bg-transparent text-gray-700 font-semibold text-lg">
                                {session.mentorName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
