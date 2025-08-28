"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "sonner"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock, Plus, Edit } from "lucide-react"
import { SessionTypeEditor, type SessionType } from "./SessionTypeEditor"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"

interface MentorProfile {
  id: string
  name: string
  email?: string
  phone?: string
  location?: string
  avatar?: string
  bio?: string
  expertise?: string[]
  experience?: string
  education?: string
  rating?: number
  totalSessions?: number
  totalMentees?: number
  joinedDate?: string
  availability?: string[]
  certifications?: string[]
  languages?: string[]
  about?: string
  company?: string
  title?: string
  skills?: string[]
  reviewCount?: number
  pricePerMonth?: number
  isQuickResponder?: boolean
  sessionTypes?: {
    _id: string
    name: string
    description: string
    duration: number
    price: number
    isActive: boolean
  }[]
}

interface ScheduleSessionModalProps {
  isOpen: boolean
  onClose: () => void
  mentor: MentorProfile
  isLoggedIn: boolean
}

// Time slots
const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
]

// Fallback session types in case mentor doesn't have any defined
const fallbackSessionTypes = [
  { _id: "career", name: "Career Guidance", description: "Get advice on career paths and professional growth", duration: 30, price: 0 },
  { _id: "technical", name: "Technical Mentoring", description: "Learn specific technical skills or get help with projects", duration: 60, price: 2000 },
  { _id: "interview", name: "Interview Preparation", description: "Practice for technical interviews with feedback", duration: 45, price: 1500 },
  { _id: "resume", name: "Resume Review", description: "Get feedback on your resume and portfolio", duration: 30, price: 1000 }
]

export function ScheduleSessionModal({ isOpen, onClose, mentor, isLoggedIn }: ScheduleSessionModalProps) {
  const { user, token } = useAuth()
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [timeSlot, setTimeSlot] = useState<string | null>(null)
  const [sessionType, setSessionType] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [isSessionTypeEditorOpen, setIsSessionTypeEditorOpen] = useState(false)
  const [editingSessionType, setEditingSessionType] = useState<SessionType | undefined>(undefined)
  const [customSessionTypes, setCustomSessionTypes] = useState<SessionType[]>([])
  const isMentor = user?.role === 'mentor'
  
  // Handle adding a new session type
  const handleAddSessionType = () => {
    setEditingSessionType(undefined)
    setIsSessionTypeEditorOpen(true)
  }
  
  // Handle editing an existing session type
  const handleEditSessionType = (type: any) => {
    // Ensure type has isActive property
    const sessionTypeWithDefaults: SessionType = {
      _id: type._id,
      name: type.name,
      description: type.description,
      duration: type.duration,
      price: type.price,
      isActive: type.isActive !== undefined ? type.isActive : true
    }
    setEditingSessionType(sessionTypeWithDefaults)
    setIsSessionTypeEditorOpen(true)
  }
  
  // Handle saving a session type - only for mentors
  const handleSaveSessionType = async (sessionType: SessionType) => {
    try {
      if (!isMentor || !token) {
        toast.error("Only mentors can create or edit session types")
        return
      }
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      
      if (sessionType.isNew) {
        // Create new session type
        const response = await axios.post(
          `${API_BASE_URL}/api/mentor/session-types`, 
          { sessionType },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        // Get the created session type with proper _id from backend
        const createdSessionType = response.data.sessionType
        setCustomSessionTypes([...customSessionTypes, createdSessionType])
        toast.success("Session type created successfully")
      } else {
        // Update existing session type
        const response = await axios.put(
          `${API_BASE_URL}/api/mentor/session-types/${sessionType._id}`, 
          { sessionType },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        
        // Get the updated session type from backend
        const updatedSessionType = response.data.sessionType
        setCustomSessionTypes(
          customSessionTypes.map(type => 
            type._id === sessionType._id ? updatedSessionType : type
          )
        )
        toast.success("Session type updated successfully")
      }
    } catch (error) {
      console.error("Error saving session type:", error)
      toast.error("Failed to save session type")
    }
  }
  
  // Get all available session types (mentor's + custom ones for this session)
  const getAllSessionTypes = () => {
    const baseSessions = mentor.sessionTypes && mentor.sessionTypes.length > 0 
      ? mentor.sessionTypes 
      : fallbackSessionTypes
      
    return [...baseSessions, ...customSessionTypes]
  }

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      toast.error("Please log in to schedule a session")
      router.push("/login?redirect=/mentorship/" + mentor.id)
      onClose()
      return
    }
    
    if (!date || !timeSlot || !sessionType) {
      toast.error("Please fill in all required fields")
      return
    }
    
    try {
      setSubmitting(true)
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      const sessionData = {
        mentorId: mentor.id,
        date: date,
        time: timeSlot,
        sessionType: sessionType,
        message: message
      }
      
      console.log("Scheduling session with data:", sessionData)
      
      // Get token from localStorage or auth context
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error("Please log in to schedule a session")
        router.push("/login?redirect=/mentorship/" + mentor.id)
        onClose()
        return
      }
      
      // Make actual API call to book session
      const response = await axios.post(
        `${API_BASE_URL}/api/student/book-session`, 
        sessionData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      console.log("Session scheduled successfully:", response.data)
      
      toast.success("Session scheduled successfully!")
      onClose()
      
      // Reset form
      setDate(undefined)
      setTimeSlot(null)
      setSessionType(null)
      setMessage("")
      
    } catch (error) {
      console.error("Error scheduling session:", error)
      toast.error("Failed to schedule session. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule a Session</DialogTitle>
          <DialogDescription>
            Book a mentoring session with {mentor.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={mentor.avatar} alt={mentor.name} />
            <AvatarFallback className="bg-blue-100 text-blue-800">
              {mentor.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-gray-900">{mentor.name}</h3>
            <p className="text-sm text-gray-500">{mentor.title} at {mentor.company}</p>
          </div>
        </div>
        
        <div className="grid gap-4 py-4">
          {/* Session Type */}
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="session-type">Session Type</Label>
              {isMentor && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleAddSessionType}
                  className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Custom Type
                </Button>
              )}
            </div>
            
            <RadioGroup 
              id="session-type" 
              value={sessionType || ""} 
              onValueChange={(value) => setSessionType(value)}
              className="grid grid-cols-1 gap-2"
            >
              {getAllSessionTypes().map((type) => (
                <div key={type._id || `type-${Math.random()}`} className="flex items-start space-x-2 border rounded-md p-3 hover:bg-gray-50">
                  <RadioGroupItem value={type._id || ""} id={type._id || `id-${Math.random()}`} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={type._id} className="flex flex-col cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{type.name}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {type.price === 0 ? 'Free' : `LKR ${type.price.toLocaleString()}`}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{type.description}</span>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">{type.duration} minutes</span>
                        </div>
                        
                        {/* Edit button - only for mentors */}
                        {isMentor && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.preventDefault()
                              handleEditSessionType(type)
                            }}
                            className="h-6 w-6 p-0 rounded-full"
                          >
                            <Edit className="h-3 w-3 text-gray-500" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        )}
                      </div>
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          {/* Date Picker */}
          <div className="grid gap-2">
            <Label>Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => 
                    date < new Date() || // Can't select past dates
                    date > new Date(new Date().setMonth(new Date().getMonth() + 2)) // Can't select more than 2 months ahead
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Time Slot */}
          <div className="grid gap-2">
            <Label>Select Time</Label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  type="button"
                  variant={timeSlot === time ? "default" : "outline"}
                  className={cn(
                    "flex items-center justify-center py-2 px-3",
                    timeSlot === time ? "bg-primary text-primary-foreground" : ""
                  )}
                  onClick={() => setTimeSlot(time)}
                >
                  <Clock className="mr-2 h-3 w-3" />
                  <span className="text-xs">{time}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {/* Message */}
          <div className="grid gap-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Let the mentor know what you'd like to discuss"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {!isLoggedIn && (
            <p className="text-sm text-amber-600 mb-2 sm:mb-0">
              You need to be logged in to schedule a session
            </p>
          )}
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || (!date || !timeSlot || !sessionType)}
            className="bg-primary hover:bg-primary/90"
          >
            {submitting ? "Scheduling..." : "Schedule Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Session Type Editor */}
      <SessionTypeEditor
        isOpen={isSessionTypeEditorOpen}
        onClose={() => setIsSessionTypeEditorOpen(false)}
        onSave={handleSaveSessionType}
        sessionType={editingSessionType}
        title={editingSessionType ? "Edit Session Type" : "Add Session Type"}
      />
    </Dialog>
  )
}
