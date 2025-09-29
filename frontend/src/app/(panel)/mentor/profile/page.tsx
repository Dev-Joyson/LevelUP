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
import { MinimalProfileCompletion } from "@/components/MentorComponents/MinimalProfileCompletion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/AuthContext"
import axios from "axios"
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
  Briefcase,
  Shield
} from "lucide-react"
import { ChangePasswordModal } from "@/components/StudentComponents/ChangePasswordModal"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface MentorProfile {
  _id: string
  userId: string
  firstname: string
  lastname: string
  title: string
  company: string
  profileImage: string
  bio: string
  about: string
  expertise: string[]
  skills: string[]
  experience: string
  location: string
  languages: string[]
  rating: number
  reviewCount: number
  totalSessions: number
  totalMentees: number
  pricePerMonth: number
  isQuickResponder: boolean
  certifications: string[]
  availability: string[]
  sessions: any[]
  sessionTypes: any[]
  verified: boolean
  email?: string
}



export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<MentorProfile | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [editForm, setEditForm] = useState<Partial<MentorProfile>>({})
  const [saving, setSaving] = useState(false)
  const [newLanguage, setNewLanguage] = useState('')
  const { token, user, loading: authLoading } = useAuth()
  const [availabilitySchedule, setAvailabilitySchedule] = useState<any[]>([])

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('🔄 Auth still loading, waiting...')
      return
    }
    
    // Once auth is loaded, check if we have a token and fetch profile
    if (token) {
      console.log('✅ Auth loaded, token available, fetching profile...')
      fetchMentorProfile()
    } else {
      console.log('❌ Auth loaded but no token available')
      setLoading(false)
    }
  }, [token, authLoading]) // Watch for both token and auth loading changes



  const fetchMentorProfile = async () => {
    try {
      setLoading(true)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      
      console.log('🔍 Fetching mentor profile...')
      console.log('🎫 Token exists:', !!token)
      console.log('👤 User from auth context:', user)
      
      if (!token) {
        console.log('❌ No token found, waiting for auth to initialize...')
        setLoading(false)
        return
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/mentor/me`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data) {
        const mentor = response.data
        console.log('👤 Raw mentor data:', mentor)
        
        // Transform API data to match our interface
        const transformedProfile: MentorProfile = {
          _id: mentor.id || '',
          userId: mentor.userId || '',
          firstname: mentor.firstname || '',
          lastname: mentor.lastname || '',
          title: mentor.title || '',
          company: mentor.company || '',
          profileImage: mentor.image || mentor.avatar || '/placeholder.svg',
          bio: mentor.bio || '',
          about: mentor.about || '',
          expertise: Array.isArray(mentor.expertise) ? mentor.expertise : Array.isArray(mentor.category) ? mentor.category : [],
          skills: Array.isArray(mentor.skills) ? mentor.skills : [],
          experience: mentor.experience || '',
          location: mentor.location || '',
          languages: Array.isArray(mentor.languages) ? mentor.languages : [],
          rating: typeof mentor.rating === 'number' ? mentor.rating : 0,
          reviewCount: typeof mentor.reviewCount === 'number' ? mentor.reviewCount : 0,
          totalSessions: typeof mentor.totalSessions === 'number' ? mentor.totalSessions : 0,
          totalMentees: typeof mentor.totalMentees === 'number' ? mentor.totalMentees : 0,
          pricePerMonth: typeof mentor.pricePerMonth === 'number' ? mentor.pricePerMonth : 0,
          isQuickResponder: Boolean(mentor.isQuickResponder),
          certifications: Array.isArray(mentor.certifications) ? mentor.certifications : [],
          availability: Array.isArray(mentor.availability) ? mentor.availability : [],
          sessions: Array.isArray(mentor.sessions) ? mentor.sessions : [],
          sessionTypes: Array.isArray(mentor.sessionTypes) ? mentor.sessionTypes : [],
          verified: Boolean(mentor.verified),
          email: mentor.email || ''
        }
        
        console.log('✅ Transformed profile:', transformedProfile)
        setProfile(transformedProfile)
        
        // Parse and set availability schedule from profile data
        if (mentor.availability && Array.isArray(mentor.availability)) {
          try {
            const parsedAvailability = mentor.availability.map((item: string) => {
              try {
                return JSON.parse(item)
              } catch (e) {
                console.warn('Could not parse availability item:', item)
                return null
              }
            }).filter((item: any) => item !== null)
            
            console.log('✅ Parsed availability from profile:', parsedAvailability)
            setAvailabilitySchedule(parsedAvailability)
          } catch (error) {
            console.error('❌ Error parsing availability from profile:', error)
            setAvailabilitySchedule([])
          }
        } else {
          console.log('📅 No availability data in mentor profile')
          setAvailabilitySchedule([])
        }
      } else {
        console.log('❌ No mentor data found in response')
        throw new Error('No mentor data found')
      }
    } catch (error: any) {
      console.error('❌ Error fetching mentor profile:', error)
      console.error('❌ Error response:', error.response?.data)
      
      // Show error message to user
      if (error.response?.status === 404) {
        console.log('📝 Mentor profile not found - may need to create one')
      } else if (error.response?.status === 401) {
        console.log('🔐 Unauthorized - token may be invalid')
      }
      
      // Set empty profile for user to fill out
      const emptyProfile: MentorProfile = {
        _id: '',
        userId: user?.id || '',
        firstname: '',
        lastname: '',
        title: '',
        company: '',
        profileImage: '/placeholder.svg',
        bio: '',
        about: '',
        expertise: [],
        skills: [],
        experience: '',
        location: '',
        languages: [],
        rating: 0,
        reviewCount: 0,
        totalSessions: 0,
        totalMentees: 0,
        pricePerMonth: 0,
        isQuickResponder: false,
        certifications: [],
        availability: [],
        sessions: [],
        sessionTypes: [],
        verified: false,
        email: user?.email || ''
      }
      
      setProfile(emptyProfile)
      
      // Try to load availability from localStorage as fallback
      console.log('🔍 Trying to load availability from localStorage as fallback...')
      const savedSchedule = localStorage.getItem('mentor-schedule')
      if (savedSchedule) {
        try {
          const parsedSchedule = JSON.parse(savedSchedule)
          console.log('✅ Loaded availability schedule from localStorage:', parsedSchedule)
          setAvailabilitySchedule(parsedSchedule)
        } catch (parseError) {
          console.error('❌ Error parsing localStorage schedule:', parseError)
          setAvailabilitySchedule([])
        }
      } else {
        console.log('📅 No availability found in localStorage either')
        setAvailabilitySchedule([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = () => {
    setShowPasswordModal(true)
  }

  const getChanges = () => {
    if (!profile) return []
    
    const changes: Array<{ field: string, from: string, to: string }> = []
    
    // Check each field for changes
    const fieldsToCheck = [
      { key: 'firstname', label: 'First Name' },
      { key: 'lastname', label: 'Last Name' },
      { key: 'title', label: 'Job Title' },
      { key: 'company', label: 'Company' },
      { key: 'bio', label: 'Bio' },
      { key: 'about', label: 'About' },
      { key: 'experience', label: 'Experience' },
      { key: 'location', label: 'Location' },
      { key: 'pricePerMonth', label: 'Monthly Price' }
    ]
    
    fieldsToCheck.forEach(field => {
      const originalValue = String(profile[field.key as keyof MentorProfile] || '')
      const newValue = String(editForm[field.key as keyof MentorProfile] || '')
      
      if (originalValue !== newValue && newValue !== '') {
        changes.push({
          field: field.label,
          from: originalValue || 'Not set',
          to: newValue
        })
      }
    })
    
    // Check array fields
    const arrayFields = [
      { key: 'expertise', label: 'Expertise' },
      { key: 'skills', label: 'Skills' },
      { key: 'languages', label: 'Languages' },
      { key: 'certifications', label: 'Certifications' }
    ]
    
    arrayFields.forEach(field => {
      const originalValue = (profile[field.key as keyof MentorProfile] as string[] || []).join(', ')
      const newValue = (editForm[field.key as keyof MentorProfile] as string[] || []).join(', ')
      
      if (originalValue !== newValue) {
        changes.push({
          field: field.label,
          from: originalValue || 'Not set',
          to: newValue || 'Removed all items'
        })
      }
    })
    
    return changes
  }

  const handleConfirmSave = () => {
    setShowConfirmDialog(true)
  }

  const handleSaveProfile = async () => {
    try {
      setShowConfirmDialog(false)
      setSaving(true)
      console.log('💾 Saving profile:', editForm)
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
      
      if (!token) {
        console.error('❌ No authentication token')
        return
      }

      // Prepare data for API (remove any undefined fields)
      const profileData = {
        firstname: editForm.firstname || '',
        lastname: editForm.lastname || '',
        title: editForm.title || '',
        company: editForm.company || '',
        bio: editForm.bio || '',
        about: editForm.about || '',
        expertise: editForm.expertise || [],
        skills: editForm.skills || [],
        experience: editForm.experience || '',
        location: editForm.location || '',
        languages: editForm.languages || [],
        pricePerMonth: editForm.pricePerMonth || 0,
        certifications: editForm.certifications || []
      }

      console.log('📤 Sending profile data:', profileData)

      // Try PUT first (update existing profile)
      let response
      try {
        response = await axios.put(`${API_BASE_URL}/api/mentor/me`, profileData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      } catch (putError: any) {
        console.log('PUT failed, trying POST (create new profile)')
        // If PUT fails (profile doesn't exist), try POST (create new profile)
        if (putError.response?.status === 404) {
          response = await axios.post(`${API_BASE_URL}/api/mentor/profile`, profileData, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        } else {
          throw putError
        }
      }
      
      if (response.data && response.data.success) {
        console.log('✅ Profile saved successfully:', response.data)
        
        // If response contains updated data, transform and use it
        if (response.data.data) {
          const savedMentor = response.data.data
          const transformedProfile: MentorProfile = {
            _id: savedMentor.id || profile?._id || '',
            userId: savedMentor.userId || profile?.userId || '',
            firstname: savedMentor.firstname || '',
            lastname: savedMentor.lastname || '',
            title: savedMentor.title || '',
            company: savedMentor.company || '',
            profileImage: savedMentor.image || savedMentor.avatar || '/placeholder.svg',
            bio: savedMentor.bio || '',
            about: savedMentor.about || '',
            expertise: Array.isArray(savedMentor.expertise) ? savedMentor.expertise : [],
            skills: Array.isArray(savedMentor.skills) ? savedMentor.skills : [],
            experience: savedMentor.experience || '',
            location: savedMentor.location || '',
            languages: Array.isArray(savedMentor.languages) ? savedMentor.languages : [],
            rating: typeof savedMentor.rating === 'number' ? savedMentor.rating : profile?.rating || 0,
            reviewCount: typeof savedMentor.reviewCount === 'number' ? savedMentor.reviewCount : profile?.reviewCount || 0,
            totalSessions: typeof savedMentor.totalSessions === 'number' ? savedMentor.totalSessions : profile?.totalSessions || 0,
            totalMentees: typeof savedMentor.totalMentees === 'number' ? savedMentor.totalMentees : profile?.totalMentees || 0,
            pricePerMonth: typeof savedMentor.pricePerMonth === 'number' ? savedMentor.pricePerMonth : 0,
            isQuickResponder: Boolean(savedMentor.isQuickResponder),
            certifications: Array.isArray(savedMentor.certifications) ? savedMentor.certifications : [],
            availability: Array.isArray(savedMentor.availability) ? savedMentor.availability : [],
            sessions: Array.isArray(savedMentor.sessions) ? savedMentor.sessions : profile?.sessions || [],
            sessionTypes: Array.isArray(savedMentor.sessionTypes) ? savedMentor.sessionTypes : profile?.sessionTypes || [],
            verified: Boolean(savedMentor.verified),
            email: savedMentor.email || ''
          }
          setProfile(transformedProfile)
        } else {
          // Update local state with form data
          const updatedProfile = { ...profile, ...editForm } as MentorProfile
          setProfile(updatedProfile)
        }
        
        setShowEditModal(false)
        console.log('✅ Profile updated successfully!')
      }
    } catch (error: any) {
      console.error('❌ Error saving profile:', error)
      console.error('❌ Error response:', error.response?.data)
      
      // Show error message to user (you can add error toast here)
      if (error.response?.status === 401) {
        console.error('🔐 Unauthorized - please login again')
      } else if (error.response?.status === 400) {
        console.error('📝 Invalid data - please check your inputs')
      } else {
        console.error('🔥 Server error - please try again later')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof MentorProfile, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayInputChange = (field: keyof MentorProfile, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item)
    setEditForm(prev => ({ ...prev, [field]: items }))
  }

  const handleLanguageAdd = (language: string) => {
    if (language.trim()) {
      const currentLanguages = editForm.languages || []
      if (!currentLanguages.includes(language.trim())) {
        setEditForm(prev => ({ 
          ...prev, 
          languages: [...currentLanguages, language.trim()] 
        }))
      }
    }
  }

  const handleLanguageRemove = (languageToRemove: string) => {
    const currentLanguages = editForm.languages || []
    setEditForm(prev => ({ 
      ...prev, 
      languages: currentLanguages.filter(lang => lang !== languageToRemove) 
    }))
  }



  const handleEditProfile = () => {
    // Initialize edit form with current profile data
    if (profile) {
      setEditForm(profile)
    }
    setShowEditModal(true)
  }

  const handleCancelEdit = () => {
    setEditForm(profile || {})
    setShowEditModal(false)
  }

  // Helper function to format date for display
  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
    })
  }

  // Helper function to format time for display (24h to 12h)
  const formatTimeForDisplay = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  // Format availability schedule for display
  const formatAvailabilitySchedule = () => {
    if (!availabilitySchedule || availabilitySchedule.length === 0) {
      return []
    }

    const formattedSlots: string[] = []

    availabilitySchedule.forEach((daySchedule: any) => {
      if (!daySchedule || !daySchedule.date) {
        console.warn('Invalid day schedule:', daySchedule)
        return
      }
      
      try {
        const dateString = formatDateForDisplay(daySchedule.date)
        
        if (daySchedule.timeSlots && Array.isArray(daySchedule.timeSlots)) {
          daySchedule.timeSlots.forEach((timeSlot: any) => {
            if (timeSlot && timeSlot.startTime && timeSlot.endTime) {
              try {
                const startTime = formatTimeForDisplay(timeSlot.startTime)
                const endTime = formatTimeForDisplay(timeSlot.endTime)
                formattedSlots.push(`${dateString}: ${startTime} - ${endTime}`)
              } catch (timeError) {
                console.warn('Error formatting time slot:', timeSlot, timeError)
              }
            }
          })
        }
      } catch (error) {
        console.warn('Error processing day schedule:', daySchedule, error)
      }
    })

    return formattedSlots
  }

  // Show loading while auth is loading or profile is loading
  if (authLoading || loading) {
    return <Loader />
  }
  
  // Show profile not found only if auth is loaded but no token or profile fetch failed
  if (!token && !authLoading) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
        <p className="text-gray-600 mb-4">Please log in to view your mentor profile.</p>
      </div>
    )
  }
  
  if (!profile && !loading) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile not found</h2>
        <p className="text-gray-600 mb-4">Unable to load your mentor profile.</p>
        <Button onClick={fetchMentorProfile} className="bg-[#535c91] hover:bg-[#464f7a]">
          Try Again
        </Button>
      </div>
    )
  }

  // Final guard - should not happen but just in case
  if (!profile) {
    return <Loader />
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your mentor profile information</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={handleChangePassword}
            className="gap-2"
          >
            <Shield className="h-4 w-4" />
            Change Password
          </Button>
          <Button 
            onClick={handleEditProfile}
            className="bg-[#535c91] hover:bg-[#464f7a] gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile Completion Alert */}
      <MinimalProfileCompletion />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="sessions">Session Types</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <Avatar className="h-28 w-28 border-4 border-gray-200 shadow-md">
                      <AvatarImage src={profile.profileImage} alt={`${profile.firstname} ${profile.lastname}`} />
                      <AvatarFallback className="bg-gray-100 text-gray-600 text-3xl font-semibold">
                        {profile.firstname?.[0]}{profile.lastname?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    {profile.verified && (
                      <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1.5 shadow-md">
                        <Shield className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {profile.firstname && profile.lastname ? `${profile.firstname} ${profile.lastname}` : 'Mentor Profile'}
                    </h1>
                    <p className="text-lg text-gray-600 mt-1">{profile.title || 'Professional Title Not Set'}</p>
                    <p className="text-md text-gray-500">{profile.company || 'Company Not Specified'}</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold text-gray-900">{profile.rating}</span>
                      <span className="text-gray-600 text-sm">({profile.reviewCount} reviews)</span>
                    </div>
                    
                    {profile.isQuickResponder && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg">
                        ⚡ Quick Responder
                      </Badge>
                    )}
                    
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{profile.location}</span>
                    </div>
                  </div>
                  
                  {profile.pricePerMonth > 0 && (
                    <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-5 py-3">
                      <span className="text-gray-600">Monthly Mentoring:</span>
                      <span className="text-xl font-bold text-gray-900">LKR {profile.pricePerMonth.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{profile.totalSessions}</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Mentees</p>
                    <p className="text-2xl font-bold text-gray-900">{profile.totalMentees}</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Experience</p>
                    <p className="text-xl font-bold text-gray-900">{profile.experience}</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Briefcase className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Languages</p>
                    <p className="text-xl font-bold text-gray-900">{profile.languages.length} Languages</p>
                  </div>
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Award className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    Contact Info
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-2 block">First Name</label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{profile.firstname || 'Not set'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-2 block">Last Name</label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{profile.lastname || 'Not set'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-2 block">Email</label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{profile.email || 'Not set'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-2 block">Location</label>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{profile.location}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-2 block">Languages</label>
                      <div className="flex flex-wrap gap-2">
                        {profile.languages.map((lang, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills & Expertise */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Award className="h-5 w-5 text-green-600" />
                    </div>
                    Skills & Expertise
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-3 block">Expertise Areas</label>
                      <div className="flex flex-wrap gap-2">
                        {profile.expertise.map((skill, index) => (
                          <span key={index} className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200 hover:bg-blue-100 transition-colors duration-200">
                            {skill}
                          </span>
                        ))}
                        {profile.expertise.length === 0 && (
                          <span className="text-gray-500 text-sm italic">No expertise areas specified</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-3 block">Technical Skills</label>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, index) => (
                          <span key={index} className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200 hover:bg-green-100 transition-colors duration-200">
                            {skill}
                          </span>
                        ))}
                        {profile.skills.length === 0 && (
                          <span className="text-gray-500 text-sm italic">No technical skills specified</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column */}
              <div className="space-y-6">
                {/* Bio & About */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Briefcase className="h-5 w-5 text-purple-600" />
                    </div>
                    Professional Profile
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-2 block">Bio</label>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-gray-900 leading-relaxed">
                          {profile.bio || 'No bio provided yet. Click "Edit Profile" to add your bio.'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-2 block">About</label>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-gray-900 leading-relaxed">
                          {profile.about || 'No detailed about section provided yet. Click "Edit Profile" to add information about yourself.'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 block">Current Position</label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <Briefcase className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">{profile.title}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 block">Company</label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <Award className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">{profile.company}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 block">Experience</label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <Briefcase className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">{profile.experience}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 block">Monthly Mentoring Price (LKR)</label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <Award className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">LKR {profile.pricePerMonth.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Certifications */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Award className="h-5 w-5 text-orange-600" />
                    </div>
                    Certifications
                  </h3>
                  <div className="space-y-3">
                    {profile.certifications.map((cert, index) => (
                      <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors duration-200">
                        <span className="font-semibold text-orange-800">{cert}</span>
                      </div>
                    ))}
                    {profile.certifications.length === 0 && (
                      <div className="text-center py-6">
                        <Award className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <span className="text-gray-500 text-sm italic">No certifications added yet</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Availability */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <div className="p-2 bg-teal-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-teal-600" />
                    </div>
                    Availability Schedule
                  </h3>
                  <div className="space-y-3">
                    {formatAvailabilitySchedule().map((slot, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors duration-200">
                        <Calendar className="h-4 w-4 text-teal-600" />
                        <span className="font-medium text-teal-800 text-sm">{slot}</span>
                      </div>
                    ))}
                    {formatAvailabilitySchedule().length === 0 && (
                      <div className="text-center py-6">
                        <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <div className="space-y-1">
                          <p className="text-gray-500 text-sm italic">No availability schedule set</p>
                          <p className="text-xs text-gray-400">Go to Schedule Sessions to set your availability</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <SessionTypesManager />
        </TabsContent>
      </Tabs>

      {/* Edit Profile Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-2xl rounded-2xl overflow-hidden">
          <DialogHeader className="pb-8 border-b border-gray-200 px-8 pt-8">
            <div className="flex items-start justify-between w-full">
              <div className="flex-1">
                <DialogTitle className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white">
                    <Edit className="h-6 w-6" />
                  </div>
                  Edit Profile
                </DialogTitle>
                <p className="text-gray-600 mt-2">Update your professional information and preferences</p>
              </div>
              
              {/* Header Action Buttons */}
              <div className="flex gap-3 ml-6">
                <Button 
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="h-10 px-4 border-gray-300 hover:bg-gray-50 rounded-xl font-medium"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmSave}
                  disabled={saving}
                  className="h-10 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg rounded-xl font-medium"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Confirm & Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-8 custom-scrollbar" style={{ maxHeight: 'calc(90vh - 180px)' }}>
            <div className="space-y-8 py-8">
              
              {/* Personal Information Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstname" className="text-sm font-medium text-gray-700">First Name</Label>
                    <Input
                      id="firstname"
                      value={editForm.firstname || ''}
                      onChange={(e) => handleInputChange('firstname', e.target.value)}
                      placeholder="Enter first name"
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastname" className="text-sm font-medium text-gray-700">Last Name</Label>
                    <Input
                      id="lastname"
                      value={editForm.lastname || ''}
                      onChange={(e) => handleInputChange('lastname', e.target.value)}
                      placeholder="Enter last name"
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                    <Input
                      id="location"
                      value={editForm.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Enter your location"
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="languages" className="text-sm font-medium text-gray-700">Languages</Label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={newLanguage}
                          onChange={(e) => setNewLanguage(e.target.value)}
                          placeholder="Add a language (e.g., English)"
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleLanguageAdd(newLanguage)
                              setNewLanguage('')
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            handleLanguageAdd(newLanguage)
                            setNewLanguage('')
                          }}
                          className="h-11 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                          disabled={!newLanguage.trim()}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 min-h-[2rem]">
                        {(editForm.languages || []).map((lang, index) => (
                          <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm border border-blue-200">
                            <span>{lang}</span>
                            <button
                              type="button"
                              onClick={() => handleLanguageRemove(lang)}
                              className="ml-1 hover:bg-blue-200 rounded-full p-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {(editForm.languages || []).length === 0 && (
                          <p className="text-xs text-gray-400 italic">No languages added yet</p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Type a language and press Enter or click Add</p>
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Professional Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700">Current Position</Label>
                    <Input
                      id="title"
                      value={editForm.title || ''}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Senior Software Engineer"
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-medium text-gray-700">Company</Label>
                    <Input
                      id="company"
                      value={editForm.company || ''}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="Enter your company name"
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-sm font-medium text-gray-700">Experience</Label>
                    <Input
                      id="experience"
                      value={editForm.experience || ''}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      placeholder="e.g., 5+ years"
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pricePerMonth" className="text-sm font-medium text-gray-700">Monthly Mentoring Price (LKR)</Label>
                    <Input
                      id="pricePerMonth"
                      type="number"
                      value={editForm.pricePerMonth || ''}
                      onChange={(e) => handleInputChange('pricePerMonth', Number(e.target.value))}
                      placeholder="Enter monthly price"
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                    />
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">About You</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio</Label>
                    <Textarea
                      id="bio"
                      value={editForm.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Write a brief professional bio..."
                      className="min-h-[120px] border-gray-200 focus:border-blue-500 focus:ring-blue-200 resize-none"
                    />
                    <p className="text-xs text-gray-500">A short summary of your professional background</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="about" className="text-sm font-medium text-gray-700">About</Label>
                    <Textarea
                      id="about"
                      value={editForm.about || ''}
                      onChange={(e) => handleInputChange('about', e.target.value)}
                      placeholder="Tell more about yourself and your mentoring approach..."
                      className="min-h-[120px] border-gray-200 focus:border-blue-500 focus:ring-blue-200 resize-none"
                    />
                    <p className="text-xs text-gray-500">Describe your mentoring philosophy and approach</p>
                  </div>
                </div>
              </div>

              {/* Skills & Expertise Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-100 rounded-xl">
                    <Award className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Skills & Expertise</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="expertise" className="text-sm font-medium text-gray-700">Expertise Areas</Label>
                    <Input
                      id="expertise"
                      value={editForm.expertise?.join(', ') || ''}
                      onChange={(e) => handleArrayInputChange('expertise', e.target.value)}
                      placeholder="e.g., JavaScript, React, Node.js"
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                    />
                    <p className="text-xs text-gray-500">Your main areas of expertise (comma separated)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills" className="text-sm font-medium text-gray-700">Technical Skills</Label>
                    <Input
                      id="skills"
                      value={editForm.skills?.join(', ') || ''}
                      onChange={(e) => handleArrayInputChange('skills', e.target.value)}
                      placeholder="e.g., Python, AWS, Docker"
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                    />
                    <p className="text-xs text-gray-500">Additional technical skills (comma separated)</p>
                  </div>
                </div>
              </div>

              {/* Certifications Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-teal-100 rounded-xl">
                    <Award className="h-5 w-5 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Certifications</h3>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="certifications" className="text-sm font-medium text-gray-700">Certifications</Label>
                  <Input
                    id="certifications"
                    value={editForm.certifications?.join(', ') || ''}
                    onChange={(e) => handleArrayInputChange('certifications', e.target.value)}
                    placeholder="e.g., AWS Solutions Architect, Google Cloud Professional"
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                  />
                  <p className="text-xs text-gray-500">Your professional certifications (comma separated)</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-8 border-t border-gray-200 bg-white px-8 pb-8 rounded-b-2xl">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              {/* Action Buttons */}
              <div className="flex gap-3 w-full sm:w-auto sm:ml-auto">
                <Button 
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="flex-1 sm:flex-none h-12 border-gray-300 hover:bg-gray-50 rounded-xl font-medium"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmSave}
                  disabled={saving}
                  className="flex-1 sm:flex-none h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg rounded-xl font-medium"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
              
              {/* Confirmation Message */}
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 rounded-lg px-4 py-2 border border-blue-200">
                <div className="p-1 bg-blue-100 rounded-full">
                  <Save className="h-3 w-3 text-blue-600" />
                </div>
                <span>Click "Save Changes" to review and confirm your updates</span>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-2xl rounded-2xl overflow-hidden flex flex-col">
          <DialogHeader className="pb-6 text-center">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white">
                <Save className="h-6 w-6" />
              </div>
              Confirm Changes
            </DialogTitle>
            <p className="text-gray-600 mt-2">Are you sure you want to save these changes to your profile?</p>
          </DialogHeader>
          
          <div className="flex flex-col flex-1 min-h-0 px-6 py-4">
            {/* Changes Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Save className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-800">Ready to Update</p>
                  <p className="text-sm text-blue-700">Review the changes below before saving:</p>
                </div>
              </div>
            </div>

            {/* Changes List - Scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="space-y-3 pr-2">
                {getChanges().length > 0 ? (
                  getChanges().map((change, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="p-1 bg-blue-100 rounded-full mt-1 flex-shrink-0">
                          <Edit className="h-3 w-3 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm mb-2">{change.field}</p>
                          <div className="space-y-2">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-start gap-2">
                                <span className="text-xs text-gray-500 mt-1 flex-shrink-0 w-12">From:</span>
                                <span className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded break-words text-left flex-1">
                                  {change.from}
                                </span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-xs text-gray-500 mt-1 flex-shrink-0 w-12">To:</span>
                                <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded break-words text-left flex-1">
                                  {change.to}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <div className="p-2 bg-gray-100 rounded-full w-fit mx-auto mb-2">
                      <Edit className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">No changes detected</p>
                    <p className="text-xs text-gray-500 mt-1">Make some changes before saving</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-gray-200 px-6 pb-6 flex-shrink-0">
            <div className="flex gap-3 w-full">
              <Button 
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                disabled={saving}
                className="flex-1 h-11 border-gray-300 hover:bg-gray-50 rounded-xl"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg rounded-xl"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Yes, Save Changes
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        userRole="mentor"
      />
    </div>
  )
}
