"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-600">Student</TableHead>
                <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-600">Session Details</TableHead>
                <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-600">Type</TableHead>
                <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</TableHead>
                <TableHead className="text-left py-4 px-6 text-sm font-medium text-gray-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session, index) => (
                <TableRow
                  key={session.id}
                  className={index !== sessions.length - 1 ? "border-b border-gray-100" : ""}
                >
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{session.studentName}</div>
                        <div className="text-xs text-gray-500">{session.studentEmail}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">{session.topic}</div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {session.sessionDate}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.sessionTime} ({session.duration}min)
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <Badge variant="secondary" className={getTypeColor(session.type)}>
                      {session.type.charAt(0).toUpperCase() + session.type.slice(1).replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <Badge variant="secondary" className={getStatusColor(session.status)}>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
