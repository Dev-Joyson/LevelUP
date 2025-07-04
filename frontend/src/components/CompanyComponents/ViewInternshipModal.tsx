"use client"

import { MapPin, Calendar, DollarSign, Users, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Internship {
  _id: string
  title: string
  domain: string
  location: string
  workMode: string
  salary: {
    min: number
    max: number
    display: string
  }
  matchingCriteria: {
    skills: number
    projects: number
    experience: number
    gpa: number
    certifications: number
  }
  preferredSkills: string[]
  minimumGPA: number
  applicationDeadline?: string
  positions: number
  isPublished: boolean
  applicationCount: number
  createdAt: string
  description?: string
  requirements?: string[]
  benefits?: string[]
}

interface ViewInternshipModalProps {
  internship: Internship
  isOpen: boolean
  onClose: () => void
}

export function ViewInternshipModal({ internship, isOpen, onClose }: ViewInternshipModalProps) {
  const getStatusBadge = (isPublished: boolean) => {
    return isPublished ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
  }

  const getWorkModeBadge = (workMode: string) => {
    const variants: { [key: string]: string } = {
      "Full-time": "bg-blue-100 text-blue-800",
      "Part-time": "bg-purple-100 text-purple-800",
      Remote: "bg-green-100 text-green-800",
      Hybrid: "bg-orange-100 text-orange-800",
      "On-site": "bg-gray-100 text-gray-800",
    }
    return variants[workMode] || "bg-gray-100 text-gray-800"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">{internship.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex flex-wrap items-center gap-4">
            <Badge className={`${getStatusBadge(internship.isPublished)} text-sm`}>
              {internship.isPublished ? "Published" : "Draft"}
            </Badge>
            <Badge className={`${getWorkModeBadge(internship.workMode)} text-sm`}>{internship.workMode}</Badge>
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="h-4 w-4" />
              {internship.location}
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <DollarSign className="h-4 w-4" />
              {internship.salary.display}
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Users className="h-4 w-4" />
              {internship.applicationCount} applicants
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Target className="h-4 w-4" />
              {internship.positions} positions
            </div>
          </div>

          {/* Dates and Domain */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Domain</div>
              <div className="font-medium text-gray-900">{internship.domain}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Minimum GPA</div>
              <div className="font-medium text-gray-900">{internship.minimumGPA}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Posted Date</div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                {new Date(internship.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Application Deadline</div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                {internship.applicationDeadline
                  ? new Date(internship.applicationDeadline).toLocaleDateString()
                  : "Not set"}
              </div>
            </div>
          </div>

          {/* Matching Criteria */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Matching Criteria</h3>
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{internship.matchingCriteria.skills}%</div>
                <div className="text-sm text-gray-600">Skills</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{internship.matchingCriteria.projects}%</div>
                <div className="text-sm text-gray-600">Projects</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{internship.matchingCriteria.experience}%</div>
                <div className="text-sm text-gray-600">Experience</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{internship.matchingCriteria.gpa}%</div>
                <div className="text-sm text-gray-600">GPA</div>
              </div>
              <div className="bg-pink-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-pink-600">{internship.matchingCriteria.certifications}%</div>
                <div className="text-sm text-gray-600">Certifications</div>
              </div>
            </div>
          </div>

          {/* Preferred Skills */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Preferred Skills</h3>
            <div className="flex flex-wrap gap-2">
              {internship.preferredSkills.map((skill, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Description */}
          {internship.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">{internship.description}</p>
            </div>
          )}

          {/* Requirements */}
          {internship.requirements && internship.requirements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
              <ul className="space-y-2">
                {internship.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {internship.benefits && internship.benefits.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
              <ul className="space-y-2">
                {internship.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
