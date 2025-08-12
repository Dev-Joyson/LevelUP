"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Star, CheckCircle2, MapPin, Languages, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Mentor } from "@/components/MentorComponents/MentorCard"
import { BookingCalendar } from "@/components/MentorComponents/BookingCalendar"

// Mock data for a single mentor (this would come from an API in production)
const mentorData: Mentor = {
  id: "1",
  name: "Telmo Sampaio",
  title: "Lead Software Engineer",
  company: "Generated Health",
  image: "/placeholder.svg?height=120&width=120",
  description: "Accelerate your web development career with personalized mentoring from a Senior Software Engineer",
  skills: ["JavaScript", "React", "Node.js", "MongoDB", "MySQL", "Frontend", "Backend", "Docker", "git", "HTML", "TypeScript", "unit testing", "digital ocean"],
  experience: "5.0 (32 reviews)",
  rating: 5.0,
  reviewCount: 32,
  pricePerMonth: 5000,
  category: ["Web Development", "Software Engineering"],
  isQuickResponder: true,
  location: "United Kingdom",
  languages: ["Speaks English and Portuguese"],
  about: "Are you a junior developer looking to fast track your career in web development? Do you need guidance on learning the right skills and up to date content, building real-world projects, and preparing for job interviews? Look no further!\n\nI am a Senior Developer with 10+ years of experience in web development and a passion for mentoring junior developers. I offer personalized and comprehensive mentoring services to help you achieve your goals and take your skills to the next level."
}

// Mock reviews
const reviews = [
  {
    id: "1",
    name: "Lin Pou",
    role: "Junior",
    date: "August 15, 2023",
    rating: 5,
    comment: "Telmo is great, very responsive and organized, you can tell that he is passionate about mentoring. He takes the time to understand your goals, and comes up with detailed planning to help you get there. Rather than simply providing answers, he offers suggestions that guide you to discover solutions on your own, which in my opinion, is a better way to learn. I highly recommend him. Thank you so much."
  },
  {
    id: "2",
    name: "Daniel",
    role: "Standard Plan • 2 months",
    date: "February 19, 2024",
    rating: 5,
    comment: "Since working with Telmo to pursue my goal of working in the tech industry, I have gained a wealth of information and a boost in my confidence which has resulted in me receiving and accepting a job offer. Telmo is very knowledgeable and has a great way of explaining complex concepts in a clear and concise direction, resulting in multiple interviews. As a former teacher myself, I can honestly say that Telmo possesses all the characteristics of a great teacher/mentor. Telmo has a genuine care for his students and a great ability to understand their needs. He is extremely patient, supportive, friendly and approachable and I felt very comfortable going to him with any question or concern, no matter how big or small. If anyone is looking for a mentor to help them journey into the tech industry, I would have no hesitation recommending Telmo. Thanks again for all the support."
  },
  {
    id: "3",
    name: "Chelsea",
    role: "Pro Plan • 7 months",
    date: "November 24, 2023",
    rating: 5,
    comment: "**Life changer!!** I have been working with Telmo for a few months now to reach my goal of working in the Tech Industry. He's been an amazing asset and paramount to my success in receiving a job offer. You can tell he truly cares about the success of his students. Always friendly, great guidance and feedback in coding as well as interview prep. 10/10\n\nChelsea wrote 1 more review for this mentorship."
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
    name: "Domincan Lawleson",
    title: "Lead Software Engineer",
    company: "Roca Allen Hamilton",
    skills: ["JavaScript", "React", "Node.js", "TypeScript", "Web Development"],
    price: 9700,
    rating: 5.0,
    reviewCount: 52
  },
  {
    id: "3",
    name: "Sumanyan Ethiraj",
    title: "Lead Software Engineer",
    company: "Syntel",
    skills: ["Node.js", "Software Development", "Web Development", "React", "TypeScript", "Kubernetes"],
    price: 5100,
    rating: 5.0,
    reviewCount: 32
  }
]

export default function MentorDetailPage({ params }: { params: { id: string } }) {
  const [selectedTab, setSelectedTab] = useState("about")
  const [showBookingCalendar, setShowBookingCalendar] = useState(false)
  const [selectedSessionOption, setSelectedSessionOption] = useState<string | null>(null)
  const [selectedSessionType, setSelectedSessionType] = useState<{
    type: string;
    duration: string;
    price: number;
  } | null>(null)
  
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
    
    setSelectedSessionType({
      type: session.type,
      duration: session.duration,
      price: session.price
    })
    setShowBookingCalendar(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Breadcrumb navigation */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-sm">
        <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <Link href="/mentorship" className="text-gray-500 hover:text-gray-700">Find a Mentor</Link>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <span className="text-gray-900">{mentor.name}</span>
      </div>

      {/* Mentor Profile Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="relative">
            {/* Top Mentor Badge */}
            <div className="absolute right-0 top-0 bg-primary text-white px-3 py-1 rounded-md text-sm font-medium flex items-center">
              <Star className="h-4 w-4 mr-1 fill-white" />
              Top Mentor
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Mentor Image */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                  <Image
                    src={mentor.image || "/placeholder.svg"}
                    alt={mentor.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Mentor Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{mentor.name}</h1>
                <p className="text-gray-600 mt-1">
                  {mentor.title} @ {mentor.company}
                </p>

                <p className="text-gray-600 mt-4">{mentor.description}</p>
                
                {/* Location and Languages */}
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
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
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {mentor.skills.slice(0, 5).map((skill, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                        {skill}
                      </Badge>
                    ))}
                    {mentor.skills.length > 5 && (
                      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                        +{mentor.skills.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about" onValueChange={setSelectedTab} className="w-full">
              <TabsList className="bg-gray-100 mb-6">
                <TabsTrigger value="about" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600">About</TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600">Reviews</TabsTrigger>
                <TabsTrigger value="skills" className="data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600">Skills</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="mt-0">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-medium mb-4 text-gray-900">About</h3>
                  <div className="space-y-4 text-gray-600">
                    {mentor.about?.split('\n\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    )) || <p>No information available</p>}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-0">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">What mentees say</h3>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Sort by:</span>
                      <div className="flex items-center text-gray-900">
                        <span>Recommended</span>
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-8">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-8 last:border-0">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-gray-900">{review.name}</h4>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">{review.role}</p>
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
                            <div className="text-gray-600 whitespace-pre-line">
                              {review.comment.split('\n\n').map((paragraph, idx) => (
                                <p key={idx} className="mb-2">{paragraph}</p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-6 border-gray-200 text-gray-700 hover:bg-gray-50">
                    Load more reviews
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="skills" className="mt-0">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-medium mb-6 text-gray-900">Skills</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4">
                    {mentor.skills.map((skill, index) => (
                      <div key={index} className="flex items-center">
                        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                          {skill}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

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
                            <span className="text-xs text-gray-500 ml-1">({similarMentor.reviewCount} reviews)</span>
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
                          <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
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
                  You can message Telmo to ask questions before booking their services
                </p>
                <Button variant="outline" className="w-full mt-4 border-gray-200 text-gray-700 hover:bg-gray-50">
                  Get in touch
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Calendar Dialog */}
      {showBookingCalendar && selectedSessionType && (
        <BookingCalendar
          mentorId={mentor.id}
          mentorName={mentor.name}
          sessionType={selectedSessionType.type}
          sessionDuration={selectedSessionType.duration}
          sessionPrice={selectedSessionType.price}
          onClose={() => setShowBookingCalendar(false)}
        />
      )}
    </div>
  )
}