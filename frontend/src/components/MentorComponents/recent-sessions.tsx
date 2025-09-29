"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Calendar, Clock, User } from "lucide-react"

interface Session {
  id: string
  studentName: string
  studentEmail: string
  sessionDate: string
  sessionTime: string
  duration: number
  status: "upcoming" | "completed" | "cancelled" | "in-progress"
  topic: string
  type: "one-on-one" | "group" | "workshop"
}

interface RecentSessionsProps {
  sessions: Session[]
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "upcoming":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100"
    case "completed":
      return "bg-green-100 text-green-800 hover:bg-green-100"
    case "cancelled":
      return "bg-red-100 text-red-800 hover:bg-red-100"
    case "in-progress":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "one-on-one":
      return "bg-purple-100 text-purple-800 hover:bg-purple-100"
    case "group":
      return "bg-orange-100 text-orange-800 hover:bg-orange-100"
    case "workshop":
      return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">Recent Sessions</CardTitle>
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {sessions.map((session, index) => (
          <div
            key={session.id}
            className={`flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors ${
              index !== sessions.length - 1 ? 'mb-4' : ''
            }`}
          >
            {/* Student Info */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{session.studentName}</div>
                <div className="text-xs text-gray-500 truncate">{session.studentEmail}</div>
              </div>
            </div>

            {/* Session Details */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="text-sm font-medium text-gray-900 truncate">{session.topic}</div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  <span className="whitespace-nowrap">{session.sessionDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  <span className="whitespace-nowrap">{session.sessionTime}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="whitespace-nowrap">{session.duration}min</span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Badge variant="secondary" className={`${getTypeColor(session.type)} text-xs px-2 py-1`}>
                {session.type.charAt(0).toUpperCase() + session.type.slice(1).replace('-', ' ')}
              </Badge>
              <Badge variant="secondary" className={`${getStatusColor(session.status)} text-xs px-2 py-1`}>
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </Badge>
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0">
              <Button variant="outline" size="sm" className="gap-1 h-8 px-3 text-xs">
                <Eye className="h-3 w-3" />
                View
              </Button>
            </div>
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No recent sessions found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
