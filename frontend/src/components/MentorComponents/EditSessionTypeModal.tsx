"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import axios from "axios"

interface SessionType {
  _id?: string
  name: string
  description: string
  duration: number
  price: number
  isActive: boolean
}

interface EditSessionTypeModalProps {
  isOpen: boolean
  onClose: () => void
  sessionType?: SessionType
  onSuccess: () => void
}

export function EditSessionTypeModal({ isOpen, onClose, sessionType, onSuccess }: EditSessionTypeModalProps) {
  const { token } = useAuth()
  const isEditing = !!sessionType?._id
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<SessionType>({
    name: "",
    description: "",
    duration: 30,
    price: 0,
    isActive: true
  })

  useEffect(() => {
    if (sessionType) {
      setFormData({
        name: sessionType.name || "",
        description: sessionType.description || "",
        duration: sessionType.duration || 30,
        price: sessionType.price || 0,
        isActive: sessionType.isActive !== false
      })
    } else {
      setFormData({
        name: "",
        description: "",
        duration: 30,
        price: 0,
        isActive: true
      })
    }
  }, [sessionType])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === "duration" || name === "price" ? Number(value) : value
    }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isActive: checked
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      
      if (isEditing) {
        // Update existing session type
        await axios.put(
          `${API_BASE_URL}/api/mentor/session-types/${sessionType._id}`, 
          { sessionType: formData },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        toast.success("Session type updated successfully")
      } else {
        // Create new session type
        await axios.post(
          `${API_BASE_URL}/api/mentor/session-types`,
          { sessionType: formData },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        toast.success("Session type created successfully")
      }
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error saving session type:", error)
      toast.error("Failed to save session type")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Session Type" : "Create Session Type"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update your session type details below." 
              : "Define a new type of session you offer to students."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input 
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Career Advice Session"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What students can expect from this session type..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input 
                id="duration"
                name="duration"
                type="number"
                min={5}
                max={240}
                step={5}
                value={formData.duration}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price (LKR) *</Label>
              <Input 
                id="price"
                name="price"
                type="number"
                min={0}
                step={100}
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Active</Label>
            <Switch 
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={handleSwitchChange}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
