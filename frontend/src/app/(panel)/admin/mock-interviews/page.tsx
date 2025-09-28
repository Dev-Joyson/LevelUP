"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, FileQuestion, Users, TrendingUp, Clock, Edit, Trash2, Eye, CheckCircle, XCircle } from "lucide-react"
import { CreateInterviewModal } from "@/components/AdminComponents/CreateInterviewModal"
import { InterviewQuestionsModal } from "@/components/AdminComponents/InterviewQuestionsModal"

interface MockInterview {
  id: string
  title: string
  domain: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  numberOfQuestions: number
  duration: number
  description: string
  tags: string[]
  isActive: boolean
  isPublished: boolean
  totalAttempts: number
  averageScore: number
  questionsGenerated: number
  questionsApproved: number
  readyToPublish: boolean
  createdAt: string
}

export default function AdminMockInterviewsPage() {
  const [interviews, setInterviews] = useState<MockInterview[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<MockInterview | null>(null)
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false)
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

  // Load interviews from API
  useEffect(() => {
    const loadInterviews = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`${API_BASE_URL}/admin/interviews`, {
          method: 'GET',
          headers: getAuthHeaders()
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch interviews')
        }
        
        const result = await response.json()
        // console.log('🔍 API Response:', result)
        
        if (result.mockInterviews) {
          // Transform backend data to match frontend interface
          const transformedInterviews = result.mockInterviews.map((interview: any) => ({
            id: interview._id,
            title: interview.title,
            domain: interview.domain,
            difficulty: interview.difficulty,
            numberOfQuestions: interview.numberOfQuestions,
            duration: interview.duration,
            description: interview.description,
            tags: interview.tags,
            isActive: interview.isActive,
            isPublished: interview.isPublished,
            totalAttempts: interview.totalAttempts,
            averageScore: interview.averageScore,
            questionsGenerated: interview.questionsGenerated || 0,
            questionsApproved: interview.questionsApproved || 0,
            readyToPublish: interview.questionsApproved === interview.numberOfQuestions,
            createdAt: new Date(interview.createdAt).toLocaleDateString()
          }))
          // console.log('🎯 Transformed interviews:', transformedInterviews)
          // console.log('📊 Total interviews:', transformedInterviews.length)
          setInterviews(transformedInterviews)
        }
      } catch (err) {
        console.error('Failed to load interviews:', err)
        setError(err instanceof Error ? err.message : 'Failed to load interviews')
      } finally {
        setLoading(false)
      }
    }

    loadInterviews()
  }, [])

  // Refresh interviews list
  const refreshInterviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/interviews`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch interviews')
      }
      
      const result = await response.json()
      // console.log('🔄 Refresh API Response:', result)
      if (result.mockInterviews) {
        const transformedInterviews = result.mockInterviews.map((interview: any) => ({
          id: interview._id,
          title: interview.title,
          domain: interview.domain,
          difficulty: interview.difficulty,
          numberOfQuestions: interview.numberOfQuestions,
          duration: interview.duration,
          description: interview.description,
          tags: interview.tags,
          isActive: interview.isActive,
          isPublished: interview.isPublished,
          totalAttempts: interview.totalAttempts,
          averageScore: interview.averageScore,
          questionsGenerated: interview.questionsGenerated || 0,
          questionsApproved: interview.questionsApproved || 0,
          readyToPublish: interview.questionsApproved === interview.numberOfQuestions,
          createdAt: new Date(interview.createdAt).toLocaleDateString()
        }))
        setInterviews(transformedInterviews)
      }
    } catch (err) {
      console.error('Failed to refresh interviews:', err)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800' 
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get shuffled image for interview card
  const getShuffledImage = (interviewId: string) => {
    // Use interview ID to create a consistent but "random" image assignment
    const imageCount = 5 // pic1.jpg to pic5.jpg
    const hash = interviewId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const imageIndex = (hash % imageCount) + 1
    return `/pic${imageIndex}.jpg`
  }

  // Delete interview function
  const deleteInterview = async (interview: MockInterview) => {
    // Show confirmation dialog
    const confirmed = confirm(
      `Are you sure you want to delete "${interview.title}"?\n\n` +
      `This will permanently delete:\n` +
      `• The interview\n` +
      `• All ${interview.questionsGenerated} generated questions\n` +
      `• All associated data\n\n` +
      `This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      const response = await fetch(`${API_BASE_URL}/admin/interviews/${interview.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete interview')
      }

      const result = await response.json()
      console.log('Interview deleted:', result)

      // Refresh interviews list
      refreshInterviews()

      // Show success message
      alert('Interview deleted successfully!')

    } catch (err) {
      console.error('Error deleting interview:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete interview'
      setError(errorMessage)
      alert(`Error: ${errorMessage}`)
    }
  }

  const getStatusBadge = (interview: MockInterview) => {
    if (interview.isActive && interview.isPublished) {
      return <Badge className="bg-green-100 text-green-800">Published</Badge>
    }
    if (interview.readyToPublish) {
      return <Badge className="bg-blue-100 text-blue-800">Ready to Publish</Badge>
    }
    if (interview.questionsGenerated > 0) {
      return <Badge className="bg-yellow-100 text-yellow-800">Needs Review</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mock Interviews</h1>
          <p className="text-gray-600 mt-2">Create and manage AI-powered interview assessments</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              // console.log('🔄 Force refresh clicked')
              refreshInterviews()
            }}
          >
            Refresh
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Interview
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileQuestion className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Interviews</p>
                <p className="text-2xl font-bold text-gray-900">{interviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">
                  {interviews.filter(i => i.isPublished).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {interviews.reduce((sum, i) => sum + i.totalAttempts, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(interviews.reduce((sum, i) => sum + i.averageScore, 0) / interviews.length) || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {interviews.map((interview) => (
          <Card key={interview.id} className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* Image Header */}
            <div className="h-48 relative overflow-hidden">
              <Image
                src={getShuffledImage(interview.id)}
                alt={interview.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute top-4 right-4">
                {getStatusBadge(interview)}
              </div>
            </div>

            <CardHeader className="pb-2">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2 line-clamp-2">
                    {interview.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {interview.domain}
                    </Badge>
                    <Badge className={getDifficultyColor(interview.difficulty)}>
                      {interview.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Interview Details */}
                <div className="flex gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FileQuestion className="h-4 w-4" />
                    <span>{interview.numberOfQuestions} questions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{interview.duration} min</span>
                  </div>
                </div>

                {/* Stats (only if has attempts) */}
                

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedInterview(interview)
                      setIsQuestionsModalOpen(true)
                    }}
                    className="flex-1 gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    Questions
                  </Button>
                  {/* <Button
                    variant="outline" 
                    size="sm"
                    className="flex-1 gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button> */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteInterview(interview)}
                    title="Delete Interview"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {interviews.length === 0 && (
        <div className="text-center py-12">
          <FileQuestion className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No interviews yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first mock interview.</p>
          <div className="mt-6">
            <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Interview
            </Button>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="ml-auto"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateInterviewModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          // console.log('✅ Create success - refreshing interviews...')
          setIsCreateModalOpen(false)
          refreshInterviews()
        }}
      />
      
      {selectedInterview && (
        <InterviewQuestionsModal
          interview={selectedInterview}
          isOpen={isQuestionsModalOpen}
          onClose={() => {
            setIsQuestionsModalOpen(false)
            setSelectedInterview(null)
          }}
          onUpdate={refreshInterviews}
        />
      )}
    </div>
  )
}
