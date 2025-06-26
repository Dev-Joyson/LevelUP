"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/inputAdmin"
import { Label } from "@/components/ui/labelAdmin"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Mail } from "lucide-react"

interface InviteMentorModalProps {
  isOpen: boolean
  onClose: () => void
}

export function InviteMentorModal({ isOpen, onClose }: InviteMentorModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    expertise: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const res = await fetch(`${API_BASE_URL}/api/admin/mentors/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          expertise: formData.expertise,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Failed to send invitation")
      }
      setSuccess(true)
      setFormData({ name: "", email: "", expertise: "" })
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite New Mentor
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter mentor's full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="mentor@company.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expertise">Area of Expertise</Label>
            <Select value={formData.expertise} onValueChange={(value) => handleInputChange("expertise", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select expertise area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="software-engineering">Software Engineering</SelectItem>
                <SelectItem value="product-management">Product Management</SelectItem>
                <SelectItem value="business-strategy">Business Strategy</SelectItem>
                <SelectItem value="digital-marketing">Digital Marketing</SelectItem>
                <SelectItem value="ux-ui-design">UX/UI Design</SelectItem>
                <SelectItem value="data-science">Data Science</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <div className="text-red-500">{error}</div>}
          {success && <div className="text-green-600">Invitation sent!</div>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex items-center gap-2" disabled={loading}>
              <Mail className="h-4 w-4" />
              {loading ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
