"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

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

interface DeleteInternshipDialogProps {
  internship: Internship
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteInternshipDialog({ internship, isOpen, onClose, onConfirm }: DeleteInternshipDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">Delete Internship</DialogTitle>
              <DialogDescription className="text-gray-600">This action cannot be undone.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete the internship position{" "}
            <span className="font-semibold">"{internship.title}"</span>?
          </p>

          {internship.applicationCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <strong>Warning:</strong> This internship has {internship.applicationCount} applicant(s). Deleting it
                will remove all associated applications.
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
              Delete Internship
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
