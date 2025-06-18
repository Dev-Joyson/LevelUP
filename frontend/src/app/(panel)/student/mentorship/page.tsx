"use client"

import Image from "next/image"
import { Calendar, Clock, Video, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface MentorshipSession {
  id: string
  type: string
  mentorName: string
  mentorTitle: string
  mentorImage: string
  date: string
  time: string
  status: "upcoming" | "completed"
  backgroundColor?: string
}

const sessions: MentorshipSession[] = [
  {
    id: "1",
    type: "Career Coaching",
    mentorName: "Dr. Anya Sharma",
    mentorTitle: "Senior Career Advisor",
    mentorImage: "/placeholder.svg?height=120&width=120",
    date: "Tuesday, July 23, 2024",
    time: "10:00 AM - 11:00 AM",
    status: "upcoming",
    backgroundColor: "bg-orange-200",
  },
  {
    id: "2",
    type: "Resume Review",
    mentorName: "Mr. Ben Carter",
    mentorTitle: "HR Manager",
    mentorImage: "/placeholder.svg?height=120&width=120",
    date: "Monday, June 10, 2024",
    time: "2:00 PM - 3:00 PM",
    status: "completed",
    backgroundColor: "bg-gray-200",
  },
  {
    id: "3",
    type: "Interview Prep",
    mentorName: "Ms. Chloe Bennett",
    mentorTitle: "Recruitment Specialist",
    mentorImage: "/placeholder.svg?height=120&width=120",
    date: "Wednesday, May 15, 2024",
    time: "4:00 PM - 5:00 PM",
    status: "completed",
    backgroundColor: "bg-orange-200",
  },
]

export default function StudentMentorshipPage() {
  const upcomingSessions = sessions.filter((session) => session.status === "upcoming")
  const pastSessions = sessions.filter((session) => session.status === "completed")

  const handleJoinSession = (sessionId: string) => {
    console.log("Joining session:", sessionId)
    // Handle join session logic
  }

  const handleViewFeedback = (sessionId: string) => {
    console.log("Viewing feedback for session:", sessionId)
    // Handle view feedback logic
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Mentorship Sessions</h1>

        {/* Upcoming Sessions */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Sessions</h2>

          {upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <Card key={session.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Upcoming
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {session.type} with {session.mentorName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{session.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{session.time}</span>
                          </div>
                        </div>
                        <Button onClick={() => handleJoinSession(session.id)} className="bg-gray-900 hover:bg-gray-800">
                          <Video className="h-4 w-4 mr-2" />
                          Join Session
                        </Button>
                      </div>

                      {/* Mentor Image */}
                      <div className="ml-6">
                        <div className={`w-24 h-24 rounded-lg overflow-hidden ${session.backgroundColor}`}>
                          <Image
                            src={session.mentorImage || "/placeholder.svg"}
                            alt={session.mentorName}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No upcoming sessions scheduled.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Past Sessions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Past Sessions</h2>

          {pastSessions.length > 0 ? (
            <div className="space-y-4">
              {pastSessions.map((session) => (
                <Card key={session.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Completed
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {session.type} with {session.mentorName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{session.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{session.time}</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => handleViewFeedback(session.id)}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Feedback
                        </Button>
                      </div>

                      {/* Mentor Image */}
                      <div className="ml-6">
                        <div className={`w-24 h-24 rounded-lg overflow-hidden ${session.backgroundColor}`}>
                          <Image
                            src={session.mentorImage || "/placeholder.svg"}
                            alt={session.mentorName}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No past sessions found.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{upcomingSessions.length}</div>
              <div className="text-sm text-gray-600">Upcoming Sessions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{pastSessions.length}</div>
              <div className="text-sm text-gray-600">Completed Sessions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">{sessions.length}</div>
              <div className="text-sm text-gray-600">Total Sessions</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
