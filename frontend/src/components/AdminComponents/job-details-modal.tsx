"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Building2, MapPin, Calendar, DollarSign, Users, Clock, Trash2 } from "lucide-react"

interface Job {
  id: number
  title: string
  company: string
  location: string
  type: string
  salary: string
  posted: string
  deadline: string
  applicants: number
  status: string
  description: string
  requirements: string[]
  benefits: string[]
}

interface JobDetailsModalProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
  onDeleteJob: (jobId: number) => void
}

export function JobDetailsModal({ job, isOpen, onClose, onDeleteJob }: JobDetailsModalProps) {
  if (!job) return null

  const handleDeleteJob = () => {
    onDeleteJob(job.id)
    onClose()
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "closed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Closed</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Draft</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "full-time":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Full-time</Badge>
      case "part-time":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Part-time</Badge>
      case "internship":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Internship</Badge>
      case "contract":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Contract</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-bold">{job.title}</DialogTitle>
          <div className="flex items-center gap-2">
            {getStatusBadge(job.status)}
            {getTypeBadge(job.type)}
            <Button variant="destructive" size="sm" onClick={handleDeleteJob} className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Job
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{job.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{job.salary}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{job.applicants} applicants</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Posted: {job.posted}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Deadline: {job.deadline}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {job.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recent Applicants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Applicants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Sarah Johnson</h4>
                    <p className="text-sm text-gray-600">Computer Science • State University</p>
                  </div>
                  <Badge variant="outline">2 days ago</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Mike Chen</h4>
                    <p className="text-sm text-gray-600">Software Engineering • Tech Institute</p>
                  </div>
                  <Badge variant="outline">3 days ago</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Emma Davis</h4>
                    <p className="text-sm text-gray-600">Information Systems • City College</p>
                  </div>
                  <Badge variant="outline">1 week ago</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button>Edit Job</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
