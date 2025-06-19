"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCheck, Mail, Building2, MapPin, Calendar, Phone, Award, Users, Shield } from "lucide-react"

interface Mentor {
  id: number
  name: string
  email: string
  company: string
  status: string
  lastActive: string
  mentoringSessions: number
  expertise: string
  experience: string
  bio: string
  phone: string
  location: string
  joinedDate: string
}

interface MentorDetailsModalProps {
  mentor: Mentor | null
  isOpen: boolean
  onClose: () => void
  onDeactivateMentor: (mentorId: number) => void
}

export function MentorDetailsModal({ mentor, isOpen, onClose, onDeactivateMentor }: MentorDetailsModalProps) {
  if (!mentor) return null

  const handleDeactivateMentor = () => {
    onDeactivateMentor(mentor.id)
    onClose()
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-bold">{mentor.name} - Mentor Profile</DialogTitle>
          <div className="flex items-center gap-2">
            {getStatusBadge(mentor.status)}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeactivateMentor}
              className="flex items-center gap-2"
              disabled={mentor.status.toLowerCase() === "inactive"}
            >
              <Shield className="h-4 w-4" />
              {mentor.status.toLowerCase() === "inactive" ? "Deactivated" : "Deactivate"}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mentor Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Mentor Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{mentor.bio}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{mentor.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{mentor.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{mentor.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{mentor.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Expertise: {mentor.expertise}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Joined: {mentor.joinedDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mentoring Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{mentor.mentoringSessions}</div>
                <p className="text-sm text-gray-500">Completed sessions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{mentor.experience}</div>
                <p className="text-sm text-gray-500">Professional experience</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Last Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{mentor.lastActive}</div>
                <p className="text-sm text-gray-500">Platform activity</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Mentoring Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Mentoring Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Career Guidance Session</h4>
                    <p className="text-sm text-gray-600">with Sarah Johnson • 2 days ago</p>
                  </div>
                  <Badge variant="outline">Completed</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Technical Interview Prep</h4>
                    <p className="text-sm text-gray-600">with Mike Chen • 1 week ago</p>
                  </div>
                  <Badge variant="outline">Completed</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Resume Review</h4>
                    <p className="text-sm text-gray-600">with Emma Davis • 1 week ago</p>
                  </div>
                  <Badge variant="outline">Completed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expertise & Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Expertise & Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Primary Expertise</h4>
                  <Badge className="bg-blue-50 text-blue-700">{mentor.expertise}</Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Additional Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Leadership</Badge>
                    <Badge variant="secondary">Team Management</Badge>
                    <Badge variant="secondary">Strategic Planning</Badge>
                    <Badge variant="secondary">Communication</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
