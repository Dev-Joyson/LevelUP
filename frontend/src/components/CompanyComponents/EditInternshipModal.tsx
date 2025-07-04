"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, Plus } from "lucide-react"

interface Internship {
  id: string
  title: string
  department: string
  location: string
  type: "Full-time" | "Part-time" | "Remote"
  salary: string
  postedDate: string
  deadline: string
  status: "Active" | "Closed" | "Draft"
  applicants: number
  description: string
  requirements: string[]
  benefits: string[]
}

interface EditInternshipModalProps {
  internship: Internship
  isOpen: boolean
  onClose: () => void
  onSave: (internship: Internship) => void
}

export function EditInternshipModal({ internship, isOpen, onClose, onSave }: EditInternshipModalProps) {
  const [formData, setFormData] = useState<Internship>(internship)
  const [newRequirement, setNewRequirement] = useState("")
  const [newBenefit, setNewBenefit] = useState("")

  const handleInputChange = (field: keyof Internship, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }))
      setNewRequirement("")
    }
  }

  const removeRequirement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }))
  }

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData((prev) => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()],
      }))
      setNewBenefit("")
    }
  }

  const removeBenefit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }))
  }

  const handleSave = () => {
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Edit Internship</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Position Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                value={formData.salary}
                onChange={(e) => handleInputChange("salary", e.target.value)}
                className="mt-1"
                placeholder="e.g., $25-30/hour"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deadline">Application Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange("deadline", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="mt-1 min-h-[100px]"
              placeholder="Describe the internship role and responsibilities..."
            />
          </div>

          {/* Requirements */}
          <div>
            <Label>Requirements</Label>
            <div className="mt-2 space-y-2">
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={requirement} readOnly className="flex-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRequirement(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="Add a requirement..."
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={addRequirement}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div>
            <Label>Benefits</Label>
            <div className="mt-2 space-y-2">
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={benefit} readOnly className="flex-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBenefit(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  placeholder="Add a benefit..."
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={addBenefit}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-[#535c91] hover:bg-[#535c91]/90">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
