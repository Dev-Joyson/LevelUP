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
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
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
    setSelectedTemplate("")
  }

  const handleTemplateSelect = (templateIndex: string) => {
    setSelectedTemplate(templateIndex)
    if (templateIndex === "custom") {
      setSessionType({
        name: "",
        description: "",
        duration: 30,
        price: 0,
        isActive: true,
        isNew: true
      })
      setShowTemplates(false)
    } else if (templateIndex !== "") {
      const template = SESSION_TYPE_TEMPLATES[parseInt(templateIndex)]
      if (template) {
        applyTemplate(template)
      }
    }
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
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-select">Choose a template or create custom</Label>
                <select
                  id="template-select"
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select a session type template</option>
                  {SESSION_TYPE_TEMPLATES.map((template, index) => (
                    <option key={index} value={index.toString()}>
                      {template.name} - {template.price === 0 ? "Free" : `LKR ${template.price}`} ({template.duration} min)
                    </option>
                  ))}
                  <option value="custom">Create Custom Session Type</option>
                </select>
              </div>

              {selectedTemplate !== "" && selectedTemplate !== "custom" && (
                <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-medium text-gray-900 mb-2">Preview: {SESSION_TYPE_TEMPLATES[parseInt(selectedTemplate)]?.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{SESSION_TYPE_TEMPLATES[parseInt(selectedTemplate)]?.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium">Duration: {SESSION_TYPE_TEMPLATES[parseInt(selectedTemplate)]?.duration} minutes</span>
                    <span className="font-medium">Price: {SESSION_TYPE_TEMPLATES[parseInt(selectedTemplate)]?.price === 0 ? "Free" : `LKR ${SESSION_TYPE_TEMPLATES[parseInt(selectedTemplate)]?.price}`}</span>
                  </div>
                  <Button 
                    className="mt-3 w-full"
                    onClick={() => applyTemplate(SESSION_TYPE_TEMPLATES[parseInt(selectedTemplate)])}
                  >
                    Use This Template
                  </Button>
                </div>
              )}
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

