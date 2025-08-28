"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, User, Briefcase, Clock, Star, MapPin } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import axios from "axios"

interface ProfileCompletion {
  percentage: number
  completed: string[]
  missing: string[]
  suggestions: string[]
}

export function ProfileCompletionCard() {
  const { token } = useAuth()
  const [profileData, setProfileData] = useState<any>(null)
  const [completion, setCompletion] = useState<ProfileCompletion>({
    percentage: 0,
    completed: [],
    missing: [],
    suggestions: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      
      // Fetch mentor profile data
      const response = await axios.get(`${API_BASE_URL}/api/mentor/session-types`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // In a real implementation, you'd have a dedicated profile endpoint
      // For now, we'll use mock data based on what we know about the mentor model
      calculateProfileCompletion({
        firstname: 'Demo',
        lastname: 'Mentor',
        title: '',
        company: '',
        bio: '',
        about: '',
        skills: [],
        experience: '',
        location: '',
        languages: [],
        profileImage: '',
        sessionTypes: response.data?.sessionTypes || []
      })
    } catch (error) {
      console.error('Error fetching profile data:', error)
      // Use default data for demo
      calculateProfileCompletion({
        firstname: 'Demo',
        lastname: 'Mentor',
        sessionTypes: []
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateProfileCompletion = (data: any) => {
    const fields = [
      { key: 'firstname', label: 'First Name', weight: 5 },
      { key: 'lastname', label: 'Last Name', weight: 5 },
      { key: 'title', label: 'Job Title', weight: 10 },
      { key: 'company', label: 'Company', weight: 10 },
      { key: 'bio', label: 'Bio', weight: 15 },
      { key: 'about', label: 'About Section', weight: 15 },
      { key: 'skills', label: 'Skills', weight: 10, isArray: true },
      { key: 'experience', label: 'Experience', weight: 10 },
      { key: 'location', label: 'Location', weight: 10 },
      { key: 'languages', label: 'Languages', weight: 5, isArray: true },
      { key: 'profileImage', label: 'Profile Image', weight: 5 },
    ]

    let completedWeight = 0
    const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0)
    const completed: string[] = []
    const missing: string[] = []

    fields.forEach(field => {
      const value = data[field.key]
      const isCompleted = field.isArray 
        ? value && Array.isArray(value) && value.length > 0
        : value && value.toString().trim() !== ''

      if (isCompleted) {
        completed.push(field.label)
        completedWeight += field.weight
      } else {
        missing.push(field.label)
      }
    })

    // Check session types (special case)
    if (data.sessionTypes && data.sessionTypes.length > 0) {
      completed.push('Session Types')
      completedWeight += 10
    } else {
      missing.push('Session Types')
    }

    const percentage = Math.round((completedWeight / (totalWeight + 10)) * 100)

    const suggestions = [
      missing.includes('Job Title') && 'Add your professional title to appear more credible',
      missing.includes('Bio') && 'Write a compelling bio to attract students',
      missing.includes('Skills') && 'List your technical skills to be found in searches',
      missing.includes('Session Types') && 'Create session types so students can book with you',
      missing.includes('Profile Image') && 'Upload a professional photo to build trust'
    ].filter(Boolean) as string[]

    setCompletion({
      percentage,
      completed,
      missing,
      suggestions
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getCompletionColor = () => {
    if (completion.percentage >= 80) return 'text-green-600'
    if (completion.percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCompletionBgColor = () => {
    if (completion.percentage >= 80) return 'bg-green-50 border-green-200'
    if (completion.percentage >= 60) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <Card className={`${getCompletionBgColor()} border-l-4`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Completion
          <Badge variant={completion.percentage >= 80 ? "default" : "secondary"} className={getCompletionColor()}>
            {completion.percentage}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Profile Strength</span>
              <span className={`font-medium ${getCompletionColor()}`}>
                {completion.percentage >= 80 ? 'Excellent' : completion.percentage >= 60 ? 'Good' : 'Needs Work'}
              </span>
            </div>
            <Progress value={completion.percentage} className="h-2" />
          </div>

          {completion.missing.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Missing Information ({completion.missing.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {completion.missing.slice(0, 4).map((item) => (
                  <Badge key={item} variant="outline" className="text-xs">
                    {item}
                  </Badge>
                ))}
                {completion.missing.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{completion.missing.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {completion.suggestions.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Top Suggestions:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                {completion.suggestions.slice(0, 2).map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-blue-500 mt-0.5">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/mentor/profile'}
            >
              <User className="h-3 w-3 mr-1" />
              Edit Profile
            </Button>
            {completion.percentage >= 90 && (
              <div className="flex items-center text-green-600 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Profile Complete!
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}