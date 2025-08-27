"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Clock, DollarSign, Save, X, Plus } from "lucide-react"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { toast } from "sonner"

export interface SessionType {
  _id?: string
  name: string
  description: string
  duration: number
  price: number
  isActive: boolean
  isNew?: boolean
}

interface SessionTypeEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (sessionType: SessionType) => void
  sessionType?: SessionType
  title?: string
}

export const SESSION_TYPE_TEMPLATES = [
  {
    name: "Free Introduction",
    description: "A short 15-minute session to get to know each other and discuss potential mentorship",
    duration: 15,
    price: 0,
    isActive: true
  },
  {
    name: "Expert Session",
    description: "A comprehensive 60-minute session focused on specific topics or challenges",
    duration: 60,
    price: 2000,
    isActive: true
  },
  {
    name: "Resume Review",
    description: "Get detailed feedback on your resume and portfolio to stand out to employers",
    duration: 30,
    price: 1500,
    isActive: true
  },
  {
    name: "Interview Preparation",
    description: "Practice technical interviews with real-world scenarios and get actionable feedback",
    duration: 45,
    price: 2500,
    isActive: true
  },
  {
    name: "Career Guidance",
    description: "Discuss career paths, industry trends, and personalized advice for your professional growth",
    duration: 45,
    price: 2000,
    isActive: true
  },
  {
    name: "Code Review",
    description: "Get feedback on your code, architecture decisions, and best practices",
    duration: 45,
    price: 2500,
    isActive: true
  }
]

export function SessionTypeEditor({ 
  isOpen, 
  onClose, 
  onSave, 
  sessionType: initialSessionType,
  title = "Edit Session Type"
}: SessionTypeEditorProps) {
  const [sessionType, setSessionType] = useState<SessionType>(
    initialSessionType || {
      name: "",
      description: "",
      duration: 30,
      price: 0,
      isActive: true,
      isNew: true
    }
  )
  const [showTemplates, setShowTemplates] = useState(!initialSessionType)
  const [saving, setSaving] = useState(false)

  const handleChange = (field: keyof SessionType, value: string | number | boolean) => {
    setSessionType({
      ...sessionType,
      [field]: value
    })
  }

  const handleSave = () => {
    // Validate
    if (!sessionType.name.trim()) {
      toast.error("Please enter a session name")
      return
    }

    if (sessionType.duration <= 0) {
      toast.error("Duration must be greater than 0")
      return
    }

    if (sessionType.price < 0) {
      toast.error("Price cannot be negative")
      return
    }

    setSaving(true)
    
    // Simulate API delay
    setTimeout(() => {
      onSave(sessionType)
      setSaving(false)
      onClose()
    }, 500)
  }

  const applyTemplate = (template: SessionType) => {
    setSessionType({
      ...template,
      isNew: true
    })
    setShowTemplates(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {showTemplates 
              ? "Choose a template or create a custom session type" 
              : "Define the details of this session type"}
          </DialogDescription>
        </DialogHeader>

        {showTemplates ? (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-3">
              {SESSION_TYPE_TEMPLATES.map((template, index) => (
                <div 
                  key={index}
                  className="border rounded-lg p-4 hover:border-primary hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => applyTemplate(template)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {template.price === 0 ? "Free" : `LKR ${template.price}`}
                      </div>
                      <div className="text-xs text-gray-500">{template.duration} min</div>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="mt-2 w-full border-dashed"
                onClick={() => setShowTemplates(false)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Session Type
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Session Name</Label>
                <Input
                  id="name"
                  value={sessionType.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g., Expert Session"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={sessionType.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describe what this session offers to students"
                  className="mt-1 min-h-[100px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={sessionType.duration}
                      onChange={(e) => handleChange("duration", parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="price">Price (LKR)</Label>
                  <div className="flex items-center mt-1">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      value={sessionType.price}
                      onChange={(e) => handleChange("price", parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={sessionType.isActive}
                  onCheckedChange={(checked) => handleChange("isActive", checked)}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
            
            {!initialSessionType && (
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => setShowTemplates(true)}
              >
                Back to Templates
              </Button>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          {!showTemplates && (
            <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Session Type
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

