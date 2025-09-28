"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

interface CreateInterviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface InterviewFormData {
  title: string
  domain: string
  difficulty: string
  numberOfQuestions: number
  duration: number
  description: string
  tags: string[]
}

const DOMAINS = [
  "Web Development",
  "Data Structures & Algorithms", 
  "System Design",
  "Machine Learning",
  "Mobile Development",
  "DevOps",
  "Database Design",
  "Other"
]

const DIFFICULTIES = ["Easy", "Medium", "Hard"]

export function CreateInterviewModal({ isOpen, onClose, onSuccess }: CreateInterviewModalProps) {
  const [formData, setFormData] = useState<InterviewFormData>({
    title: "",
    domain: "",
    difficulty: "",
    numberOfQuestions: 5,
    duration: 30,
    description: "",
    tags: []
  })
  const [newTag, setNewTag] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // API configuration
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000') + '/api'
  
  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      domain: "",
      difficulty: "",
      numberOfQuestions: 5,
      duration: 30,
      description: "",
      tags: []
    })
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/admin/interviews/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create interview')
      }
      
      const result = await response.json()

      if (result.mockInterview) {
        console.log('Interview created successfully')
        resetForm()
        onSuccess?.()
      } else {
        setError(result.message || 'Failed to create interview')
      }
    } catch (err) {
      console.error('Error creating interview:', err)
      setError(err instanceof Error ? err.message : 'Failed to create interview')
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Mock Interview</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Interview Title*</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Senior React Developer Interview"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="domain">Domain*</Label>
                <Select 
                  value={formData.domain} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, domain: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOMAINS.map(domain => (
                      <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty*</Label>
                <Select 
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map(difficulty => (
                      <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numberOfQuestions">Number of Questions*</Label>
                <Input
                  id="numberOfQuestions"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.numberOfQuestions}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    numberOfQuestions: parseInt(e.target.value) || 5 
                  }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)*</Label>
                <Input
                  id="duration"
                  type="number"
                  min="5"
                  max="180"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    duration: parseInt(e.target.value) || 30 
                  }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of what this interview covers..."
                rows={3}
                maxLength={500}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="newTag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag..."
                  className="flex-1"
                />
                <Button type="button" onClick={addTag} size="sm" className="gap-1">
                  <Plus className="h-3 w-3" />
                  Add
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                resetForm()
                onClose()
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Interview"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
