"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader } from "@/components/common/Loader"
import { SessionTypesManager } from "@/components/MentorComponents/SessionTypesManager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save, 
  X,
  Star,
  Calendar,
  Award,
  Briefcase
} from "lucide-react"

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
}

// Mock data - Replace with actual API calls
const mockProfile: MentorProfile = {
  id: "1",
  name: "Dr. Sarah Wilson",
  email: "sarah.wilson@levelup.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  bio: "Experienced software engineer and technical mentor with over 10 years in the industry. Passionate about helping students and junior developers grow their careers in technology.",
  expertise: ["JavaScript", "React", "Node.js", "Python", "System Design", "Career Development"],
  experience: "Senior Software Engineer at Google",
  education: "Ph.D. Computer Science, Stanford University",
  rating: 4.8,
  totalSessions: 142,
  totalMentees: 15,
  joinedDate: "January 2024",
  availability: ["Monday 9:00-17:00", "Tuesday 9:00-17:00", "Wednesday 9:00-17:00", "Thursday 9:00-17:00", "Friday 9:00-15:00"],
  certifications: ["AWS Solutions Architect", "Google Cloud Professional", "Scrum Master"]
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<MentorProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // Simulate loading and data fetching
    const timer = setTimeout(() => {
      setProfile(mockProfile)
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return <Loader />
  if (!profile) return <div>Profile not found</div>

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your mentor profile information</p>
        </div>
        <Button className="bg-[#535c91] hover:bg-[#464f7a] gap-2">
          <Edit className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="sessions">Session Types</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info Card */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback className="text-2xl">
                    <User className="h-12 w-12 text-gray-600" />
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                  <p className="text-gray-600">{profile.experience}</p>
                </div>

                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-medium text-gray-900">{profile.rating}</span>
                  <span className="text-gray-500">({profile.totalSessions} sessions)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Total Sessions</span>
                </div>
                <span className="font-medium text-gray-900">{profile.totalSessions}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Total Mentees</span>
                </div>
                <span className="font-medium text-gray-900">{profile.totalMentees}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-600">Joined</span>
                </div>
                <span className="font-medium text-gray-900">{profile.joinedDate}</span>
              </div>
            </CardContent>
          </Card>

          {/* Expertise Card */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Expertise</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2">
                {profile.expertise.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Profile Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{profile.name}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{profile.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{profile.phone}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{profile.location}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <p className="text-gray-900">{profile.bio}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{profile.experience}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{profile.education}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Certifications</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2">
                {profile.certifications.map((cert, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                    {cert}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Availability</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                {profile.availability.map((slot, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{slot}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
        </TabsContent>

        <TabsContent value="sessions">
          <SessionTypesManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
