"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Home, Users, Calendar, User, HelpCircle, MessageSquare } from "lucide-react"
import type { JSX } from "react/jsx-runtime"

// TypeScript interfaces
interface MentorshipRequest {
  id: number
  studentName: string
  field: string
  year: string
  message: string
  avatar: string
  status: "pending" | "accepted" | "declined"
}

interface SidebarItem {
  icon: JSX.Element
  label: string
  href: string
  active?: boolean
}

// Mock data for mentorship requests
const mentorshipRequests: MentorshipRequest[] = [
  {
    id: 1,
    studentName: "Ethan Harper",
    field: "Computer Science",
    year: "Junior",
    message:
      "Hi, I'm Ethan, a junior in Computer Science. I'm looking for guidance on how to prepare for technical interviews and would love to learn from your experience in the tech industry.",
    avatar: "/placeholder.svg?height=60&width=60",
    status: "pending",
  },
  {
    id: 2,
    studentName: "Olivia Bennett",
    field: "Business Administration",
    year: "Senior",
    message:
      "Hello, I'm Olivia, a senior studying Business Administration. I'm interested in exploring career paths in consulting and would appreciate your insights on networking and industry trends.",
    avatar: "/placeholder.svg?height=60&width=60",
    status: "pending",
  },
  {
    id: 3,
    studentName: "Noah Carter",
    field: "Mechanical Engineering",
    year: "Sophomore",
    message:
      "Hi, I'm Noah, a sophomore in Mechanical Engineering. I'm seeking advice on internships in the automotive industry and would be grateful for your mentorship on skill development and application strategies.",
    avatar: "/placeholder.svg?height=60&width=60",
    status: "pending",
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
    active: true,
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    label: "Sessions",
    href: "/mentor/sessions",
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

export default function MentorshipPage(): JSX.Element {
  const [requests, setRequests] = useState<MentorshipRequest[]>(mentorshipRequests)

  const handleAcceptRequest = (requestId: number): void => {
    setRequests((prev) =>
      prev.map((request) => (request.id === requestId ? { ...request, status: "accepted" as const } : request)),
    )
    console.log("Accepted request:", requestId)
  }

  const handleDeclineRequest = (requestId: number): void => {
    setRequests((prev) =>
      prev.map((request) => (request.id === requestId ? { ...request, status: "declined" as const } : request)),
    )
    console.log("Declined request:", requestId)
  }

  const pendingRequests = requests.filter((request) => request.status === "pending")

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
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Mentorship Requests</h1>

            {/* Mentorship Requests */}
            <div className="space-y-6">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Users className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending requests</h3>
                  <p className="text-gray-600">You don't have any mentorship requests at the moment.</p>
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <Card key={request.id} className="border border-gray-100 shadow-sm bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <Avatar className="h-16 w-16 flex-shrink-0">
                          <AvatarImage src="/placeholder.svg" alt={request.studentName} />
                          <AvatarFallback className="bg-gray-100 text-gray-600 font-semibold text-lg">
                            {request.studentName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Student Info */}
                          <div className="mb-3">
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">{request.studentName}</h3>
                            <p className="text-sm text-gray-500 font-medium">
                              {request.field}, {request.year}
                            </p>
                          </div>

                          {/* Message */}
                          <p className="text-gray-700 leading-relaxed mb-4">{request.message}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 flex-shrink-0">
                          <Button
                            variant="outline"
                            onClick={() => handleDeclineRequest(request.id)}
                            className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            Decline
                          </Button>
                          <Button
                            onClick={() => handleAcceptRequest(request.id)}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Accept
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
