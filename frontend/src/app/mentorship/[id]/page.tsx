"use client"

import { useState } from "react"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Star, Calendar, Clock, MessageCircle, Award, Briefcase, MapPin, Globe, Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Mentor } from "@/components/MentorComponents/MentorCard"
import { BookingCalendar } from "@/components/MentorComponents/BookingCalendar"

// Mock data for a single mentor (this would come from an API in production)
const mentorData: Mentor = {
  id: "1",
  name: "Sofa Carter",
  title: "Lead Software Engineer",
  company: "Generated Health",
  image: "/placeholder.svg?height=120&width=120",
  description: "Accelerate your web development career with personalized mentoring from a senior software engineer",
  skills: ["JavaScript", "Java", "Python", "React", "Angular", "Node.js"],
  experience: "8+ years",
  rating: 4.9,
  reviewCount: 127,
  pricePerMonth: 5000,
  category: ["Web Development", "Software Engineering"],
  isQuickResponder: true,
  location: "Colombo, Srilanka",
  languages: ["Speaks English, Sinhala and Tamil"],
  about: "Built for consumers and companies alike. In a world driven by data, we believe consumers and businesses can coexist. Our founders had a vision to empower consumers and leverage their greatest asset—their data—in exchange for modern financial services. Built with this vision in mind, our platform allows consumers to access savings tools, earned wages and rewards without cost or hidden fees. In exchange, they give permission to use their real-time data for research, insights and targeted advertising. At Mero, our mission is to help us build a more equitable and efficient data sharing ecosystem—whether helping consumers access modern financial services or businesses leverage data to achieve better outcomes. You'll have the opportunity to work directly with hands-on leaders and mission-driven individuals and companies."
}

// Mock reviews
const reviews = [
  {
    id: "1",
    name: "Vijay Kumar",
    role: "Computer Science Junior",
    date: "Dec 15, 2024",
    rating: 4,
    comment: "Sofa is great, very responsive and organized, you can tell that he is passionate about mentoring. He takes the time to understand your goals, and comes up with detailed planning to help you get there Rather than simply providing answers, he offers suggestions that guide you to discover solutions on your own, which in my opinion, is a better way to learn. I highly recommend him. Thank you so much."
  },
  {
    id: "2",
    name: "Noah",
    role: "Computer Science Junior",
    date: "Dec 15, 2024",
    rating: 4,
    comment: "Sofa is great, very responsive and organized, you can tell that he is passionate about mentoring. He takes the time to understand your goals, and comes up with detailed planning to help you get there Rather than simply providing answers, he offers suggestions that guide you to discover solutions on your own, which in my opinion, is a better way to learn. I highly recommend him. Thank you so much."
  },
  {
    id: "3",
    name: "Kumar",
    role: "Computer Science Junior",
    date: "Dec 15, 2024",
    rating: 4,
    comment: "Sofa is great, very responsive and organized, you can tell that he is passionate about mentoring. He takes the time to understand your goals, and comes up with detailed planning to help you get there Rather than simply providing answers, he offers suggestions that guide you to discover solutions on your own, which in my opinion, is a better way to learn. I highly recommend him. Thank you so much."
  }
]

// Mock session options
const sessionOptions = [
  {
    id: "1",
    duration: "10 minutes",
    type: "Free intro call",
    price: 0,
    creditCard: false
  },
  {
    id: "2",
    duration: "60 minutes",
    type: "Expert Consultation",
    price: 5000,
    creditCard: true
  }
]

// Mock similar mentors
const similarMentors = [
  {
    id: "2",
    name: "Vijay Kumar",
    title: "Lead Software Engineer",
    company: "notCode",
    skills: ["JavaScript", "Java", "Python", "React", "Angular"],
    price: 50000
  },
  {
    id: "3",
    name: "Kumar Kumar",
    title: "Lead Software Engineer",
    company: "notCode",
    skills: ["JavaScript", "Java", "Python", "React", "Angular"],
    price: 50000
  }
]

// Mock mentor availability data
const mockAvailability = {
  mentorId: "1",
  weeklySchedule: {
    monday: {
      isAvailable: true,
      timeSlots: [
        { startTime: "09:00", endTime: "12:00", isAvailable: true },
        { startTime: "13:00", endTime: "17:00", isAvailable: true }
      ]
    },
    tuesday: {
      isAvailable: true,
      timeSlots: [
        { startTime: "09:00", endTime: "12:00", isAvailable: true },
        { startTime: "13:00", endTime: "17:00", isAvailable: true }
      ]
    },
    wednesday: {
      isAvailable: true,
      timeSlots: [
        { startTime: "09:00", endTime: "12:00", isAvailable: true },
        { startTime: "13:00", endTime: "17:00", isAvailable: true }
      ]
    },
    thursday: {
      isAvailable: true,
      timeSlots: [
        { startTime: "09:00", endTime: "12:00", isAvailable: true },
        { startTime: "13:00", endTime: "17:00", isAvailable: true }
      ]
    },
    friday: {
      isAvailable: true,
      timeSlots: [
        { startTime: "09:00", endTime: "12:00", isAvailable: true },
        { startTime: "13:00", endTime: "17:00", isAvailable: true }
      ]
    },
    saturday: {
      isAvailable: false,
      timeSlots: []
    },
    sunday: {
      isAvailable: false,
      timeSlots: []
    }
  },
  dateOverrides: [],
  sessionDurations: [15, 30, 60],
  bufferBetweenSessions: 15,
  advanceBookingLimit: 30,
  timezone: "Asia/Colombo"
}

// Mock session types
const mockSessionTypes = [
  {
    id: "1",
    name: "Free Intro Call",
    duration: 10,
    price: 0
  },
  {
    id: "2",
    name: "Expert Consultation",
    duration: 60,
    price: 5000
  }
]

export default function MentorDetailPage({ params }: { params: { id: string } }) {
  const [selectedTab, setSelectedTab] = useState("about")
  const [selectedSessionOption, setSelectedSessionOption] = useState<string | null>(null)
  const [showBookingCalendar, setShowBookingCalendar] = useState(false)
  const [selectedSessionType, setSelectedSessionType] = useState<string | null>(null)
  
  // In a real app, fetch mentor data based on ID
  // const mentor = await getMentorById(params.id)
  // if (!mentor) return notFound()
  
  // Using mock data for now
  const mentor = mentorData
  
  // If no mentor found with this ID
  if (!mentor) {
    return notFound()
  }
  
  // Handle session selection
  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionOption(sessionId)
  }
  
  // Handle booking session
  const handleBookSession = () => {
    if (!selectedSessionOption) return
    
    const session = sessionOptions.find(option => option.id === selectedSessionOption)
    if (!session) return
    
    setSelectedSessionType(session.id)
    setShowBookingCalendar(true)
  }
  
  // Handle booking slot selection
  const handleSlotSelect = (slot: any) => {
    console.log("Selected slot:", slot)
    // Here you would typically send this to your backend API
    // and then show a confirmation or redirect to payment
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Mentors</h1>
        <p className="text-gray-600 mb-8">Manage your personal information and account settings.</p>

        {/* Mentor Profile Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Mentor Image */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                  <Image
                    src={mentor.image || "/placeholder.svg"}
                    alt={mentor.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Mentor Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{mentor.name}</h2>
                <p className="text-gray-600 mb-4">
                  {mentor.title} @ {mentor.company}
                </p>
                
                {/* Location and Languages */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{mentor.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Languages className="w-4 h-4 mr-2" />
                    <span>{mentor.languages}</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {mentor.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="about" onValueChange={setSelectedTab} className="w-full">
                  <TabsList className="mb-6">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="reviews">What mentees say</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="about" className="mt-0">
                    <div className="prose max-w-none">
                      <h3 className="text-lg font-medium mb-4">About</h3>
                      <p className="text-gray-700 leading-relaxed">{mentor.about}</p>
                    </div>
                    <div className="mt-8">
                      <Button className="w-full">Book Sessions</Button>
                      <p className="text-sm text-gray-500 text-center mt-2">
                        You can message Sofa to ask questions before booking their services
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="mt-0">
                    <h3 className="text-lg font-medium mb-4">What mentees say</h3>
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-gray-900">{review.name}</h4>
                                <span className="text-sm text-gray-500">{review.date}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{review.role}</p>
                              <div className="flex items-center mb-3">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-gray-700">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="skills" className="mt-0">
                    <h3 className="text-lg font-medium mb-4">Skills</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4">
                      {mentor.skills.map((skill, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                            {skill}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Similar Mentors Section */}
            <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium mb-6 text-gray-900">Similar mentors</h3>
              <div className="space-y-6">
                {similarMentors.map((similarMentor) => (
                  <div key={similarMentor.id} className="flex items-start gap-4 pb-6 border-b border-gray-200 last:border-0">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{similarMentor.name}</h4>
                      <p className="text-sm text-gray-500 mb-2">
                        {similarMentor.title} @ {similarMentor.company}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {similarMentor.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            From ${similarMentor.price.toLocaleString()} /month
                          </span>
                        </div>
                        <Button size="sm" variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50">
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar with Sticky Session Booking */}
          <div>
            <div className="sticky top-4">
              <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
                <h3 className="text-lg font-medium mb-4 text-gray-900">Sessions</h3>
                <div className="space-y-4">
                  {sessionOptions.map((option) => (
                    <div 
                      key={option.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedSessionOption === option.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleSessionSelect(option.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">{option.duration} {option.type}</span>
                      </div>
                      <div className="text-lg font-bold mb-1 text-gray-900">
                        {option.price === 0 ? 'Free' : `$${option.price.toLocaleString()} per session`}
                      </div>
                      {option.creditCard === false && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Star className="h-3 w-3 mr-1 text-green-500" />
                          No credit card required
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full mt-4 bg-primary text-white"
                  onClick={handleBookSession}
                  disabled={!selectedSessionOption}
                >
                  Book now
                </Button>
                <Button variant="outline" className="w-full mt-2 border-gray-200 text-gray-700 hover:bg-gray-50">
                  View all sessions
                </Button>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-xs">?</span>
                  </div>
                  <span className="text-sm">Open to inquiries</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 ml-8">
                  You can message Sofa to ask questions before booking their services
                </p>
                <Button variant="outline" className="w-full mt-4 border-gray-200 text-gray-700 hover:bg-gray-50">
                  Get in touch
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Calendar Modal */}
      <Dialog open={showBookingCalendar} onOpenChange={setShowBookingCalendar}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogTitle className="text-xl font-semibold mb-4">Book a Session with {mentor.name}</DialogTitle>
          
          {selectedSessionType && (
            <div className="mt-4">
              {/* Get session details */}
              {(() => {
                const session = sessionOptions.find(option => option.id === selectedSessionType);
                return session ? (
                  <p className="text-gray-600 mb-6">
                    Select a date and time for your {session.duration} {session.type} session
                  </p>
                ) : null;
              })()}
              
              <BookingCalendar
                mentorId={mentor.id}
                mentorName={mentor.name}
                sessionTypes={mockSessionTypes}
                selectedSessionType={selectedSessionType}
                availability={mockAvailability}
                onSlotSelect={handleSlotSelect}
                existingBookings={[]}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}