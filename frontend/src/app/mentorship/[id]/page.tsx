"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import axios from "axios"
import { toast } from "sonner"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Star,
  Calendar,
  Award,
  Briefcase,
  Clock,
  CheckCircle2,
  ChevronLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ScheduleSessionModal } from "@/components/MentorComponents/ScheduleSessionModal"
import { useAuth } from "@/context/AuthContext"

interface MentorProfile {
  id: string
  name: string
  email: string
  phone: string
  location: string
  avatar?: string
  bio: string
  expertise: string[]
  experience: string
  education: string
  rating: number
  totalSessions: number
  totalMentees: number
  joinedDate: string
  availability: string[]
  certifications: string[]
  languages?: string[]
  about?: string
  company: string
  title: string
  skills: string[]
  reviewCount: number
  pricePerMonth: number
  isQuickResponder?: boolean
}

// Fallback mentor data in case API fails
const fallbackMentor: MentorProfile = {
  id: "1",
  name: "Dr. Sarah Wilson",
  email: "sarah.wilson@levelup.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  bio: "Experienced software engineer and technical mentor with over 10 years in the industry. Passionate about helping students and junior developers grow their careers in technology.",
  expertise: ["JavaScript", "React", "Node.js", "Python", "System Design", "Career Development"],
  experience: "10+ years",
  education: "Ph.D. Computer Science, Stanford University",
  rating: 4.8,
  totalSessions: 142,
  totalMentees: 15,
  joinedDate: "January 2024",
  availability: ["Monday 9:00-17:00", "Tuesday 9:00-17:00", "Wednesday 9:00-17:00", "Thursday 9:00-17:00", "Friday 9:00-15:00"],
  certifications: ["AWS Solutions Architect", "Google Cloud Professional", "Scrum Master"],
  company: "Google",
  title: "Senior Software Engineer",
  skills: ["JavaScript", "React", "Node.js", "Python", "System Design"],
  reviewCount: 142,
  pricePerMonth: 5000,
  isQuickResponder: true,
  languages: ["English", "Spanish"],
  about: "I've been working in the tech industry for over a decade, specializing in full-stack development and system architecture. I'm passionate about mentoring and helping others grow in their careers."
}

// Reviews mock data
const reviews = [
  {
    id: "1",
    name: "Alex Johnson",
    rating: 5,
    date: "March 15, 2024",
    content: "Sarah is an incredible mentor! She helped me prepare for technical interviews and gave me invaluable advice on system design. Highly recommend!"
  },
  {
    id: "2",
    name: "Maya Patel",
    rating: 4,
    date: "February 28, 2024",
    content: "Great mentor with deep technical knowledge. She's very patient and explains complex concepts clearly."
  },
  {
    id: "3",
    name: "Carlos Rodriguez",
    rating: 5,
    date: "January 10, 2024",
    content: "Working with Sarah has been transformative for my career. Her guidance helped me land a job at a top tech company!"
  }
]

export default function MentorDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [mentor, setMentor] = useState<MentorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        setLoading(true)
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
        const response = await axios.get(`${API_BASE_URL}/api/mentor/public/${id}`)
        
        if (response.data && response.data.mentor) {
          setMentor(response.data.mentor)
        } else {
          // If no mentor returned, use fallback data
          setMentor(fallbackMentor)
          toast.warning("Using demo mentor data as the requested mentor was not found.")
        }
      } catch (error) {
        console.error("Error fetching mentor:", error)
        setMentor(fallbackMentor)
        setError(true)
        toast.error("Failed to fetch mentor details. Using demo data instead.")
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      fetchMentor()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Mentor Not Found</h2>
          <p className="text-gray-600 mt-2">The mentor you're looking for doesn't exist or has been removed.</p>
          <Button asChild className="mt-4">
            <Link href="/mentorship">Back to Mentors</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button */}
      <div className="max-w-7xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/mentorship" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ChevronLeft className="h-4 w-4" />
            Back to Mentors
          </Link>
        </Button>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Hero section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <Avatar className="h-24 w-24 border-4 border-white">
                <AvatarImage src={mentor.avatar} alt={mentor.name} />
                <AvatarFallback className="text-2xl bg-white text-blue-600">
                  {mentor.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{mentor.name}</h1>
                  {mentor.isQuickResponder && (
                    <Badge className="bg-green-500 text-white border-0 self-center md:self-auto">
                      Quick Responder
                    </Badge>
                  )}
                </div>
                
                <p className="text-lg opacity-90 mb-1">{mentor.title} at {mentor.company}</p>
                <p className="text-sm opacity-80 mb-3 flex items-center gap-1 justify-center md:justify-start">
                  <MapPin className="h-4 w-4" /> {mentor.location}
                </p>
                
                <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-300 fill-current" />
                    <span className="ml-1 font-medium">{mentor.rating}</span>
                    <span className="ml-1 text-sm opacity-80">({mentor.reviewCount} reviews)</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5" />
                    <span className="ml-1 text-sm">{mentor.totalSessions} sessions completed</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-5 w-5" />
                    <span className="ml-1 text-sm">{mentor.experience} experience</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 text-center">
                <div className="mb-2">
                  <div className="text-2xl font-bold">LKR {mentor.pricePerMonth.toLocaleString()}</div>
                  <div className="text-sm opacity-80">per month</div>
                </div>
                <Button 
                  onClick={() => setIsScheduleModalOpen(true)} 
                  className="bg-white text-blue-700 hover:bg-blue-50"
                >
                  Schedule Session
                </Button>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <Tabs defaultValue="about" className="p-6">
            <TabsList className="mb-6">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="expertise">Expertise</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Bio</h2>
                <p className="text-gray-700 leading-relaxed">{mentor.bio}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      <span>{mentor.experience}</span>
                    </div>
                    <p className="mt-2 text-gray-700">{mentor.company} - {mentor.title}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Education</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-blue-600" />
                      <span>{mentor.education}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {mentor.certifications.map((cert, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Languages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {mentor.languages?.map((lang, index) => (
                        <Badge key={index} variant="outline">
                          {lang}
                        </Badge>
                      )) || <span className="text-gray-500">Not specified</span>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="expertise" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Areas of Expertise</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  {mentor.expertise.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 text-sm py-1 px-3">
                      {skill}
                    </Badge>
                  ))}
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {mentor.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-sm py-1 px-3">
                      {skill}
                    </Badge>
                  ))}
                </div>
                
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">What you'll learn</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Technical skills in {mentor.expertise.slice(0, 3).join(', ')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Career guidance and professional development</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Industry best practices and real-world application</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Personalized feedback and guidance</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="availability" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Availability Schedule</h2>
                <p className="text-gray-700 mb-6">
                  {mentor.name} is generally available during the following times. 
                  You can schedule a session during these hours.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mentor.availability.map((slot, index) => (
                    <Card key={index}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">{slot}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-8">
                  <Button 
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Schedule a Session
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="ml-1 font-medium text-lg">{mentor.rating}</span>
                    <span className="ml-1 text-gray-500">({mentor.reviewCount} reviews)</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{review.name}</h3>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <p className="text-gray-700">{review.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Session scheduling modal */}
      <ScheduleSessionModal 
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        mentor={mentor}
        isLoggedIn={!!user}
      />
    </div>
  )
}