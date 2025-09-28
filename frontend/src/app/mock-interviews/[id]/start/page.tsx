"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileQuestion, 
  Clock, 
  Users, 
  Play,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Brain,
  Target,
  MessageSquare,
  BarChart3
} from "lucide-react"

interface MockInterview {
  id: string
  title: string
  domain: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  numberOfQuestions: number
  duration: number
  description: string
  tags: string[]
  totalAttempts: number
  averageScore: number
  estimatedScore: {
    min: number
    max: number
  }
}

interface StudentStatus {
  hasCompleted: boolean
  hasActiveSession: boolean
  activeSessionId: string | null
  completedScore: number | null
  completedAt: string | null
}

const categoryIcons = {
  'Technical': Brain,
  'Behavioral': MessageSquare,
  'Case Study': Target,
  'System Design': BarChart3,
  'Coding': FileQuestion
}

export default function InterviewStartPage() {
  const params = useParams()
  const router = useRouter()
  const [interview, setInterview] = useState<MockInterview | null>(null)
  const [studentStatus, setStudentStatus] = useState<StudentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
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

  // Load interview details
  useEffect(() => {
    const loadInterviewDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${API_BASE_URL}/student/mock-interviews/${params.id}`, {
          method: 'GET',
          headers: getAuthHeaders()
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch interview details')
        }
        
        const result = await response.json()

        if (result.interview && result.studentStatus) {
          setInterview(result.interview)
          setStudentStatus(result.studentStatus)
        }
      } catch (err) {
        console.error('Failed to load interview details:', err)
        setError(err instanceof Error ? err.message : 'Failed to load interview details')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadInterviewDetails()
    }
  }, [params.id])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryFromDomain = (domain: string): keyof typeof categoryIcons => {
    if (domain.includes('Behavioral') || domain.includes('behavioral')) return 'Behavioral'
    if (domain.includes('System Design') || domain.includes('system')) return 'System Design'
    if (domain.includes('Case Study') || domain.includes('case')) return 'Case Study'
    if (domain.includes('Coding') || domain.includes('Algorithm') || domain.includes('Data Structures')) return 'Coding'
    return 'Technical'
  }

  const startInterview = async () => {
    if (!interview) return
    
    setStarting(true)
    try {
      // Redirect to the actual interview session page
      router.push(`/student/mock-interviews/${interview.id}/session`)
    } catch (err) {
      console.error('Error starting interview:', err)
      setError('Failed to start interview. Please try again.')
    } finally {
      setStarting(false)
    }
  }

  const resumeInterview = async () => {
    if (!studentStatus?.activeSessionId) return
    
    setStarting(true)
    try {
      // Redirect to the existing session
      router.push(`/student/mock-interviews/${params.id}/session`)
    } catch (err) {
      console.error('Error resuming interview:', err)
      setError('Failed to resume interview. Please try again.')
    } finally {
      setStarting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Interview Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested interview could not be found.'}</p>
          <Button onClick={() => router.push('/mock-interviews')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Interviews
          </Button>
        </div>
      </div>
    )
  }

  const CategoryIcon = categoryIcons[getCategoryFromDomain(interview.domain)]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            onClick={() => router.push('/mock-interviews')} 
            variant="ghost" 
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Mock Interviews
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Interview Card */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <CategoryIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{interview.title}</CardTitle>
                      <div className="flex items-center gap-3 mb-4">
                        <Badge variant="outline">{interview.domain}</Badge>
                        <Badge className={getDifficultyColor(interview.difficulty)}>
                          {interview.difficulty}
                        </Badge>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{interview.description}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-6">
                    {/* Interview Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <FileQuestion className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <div className="text-lg font-semibold text-gray-900">{interview.numberOfQuestions}</div>
                        <div className="text-sm text-gray-600">Questions</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <div className="text-lg font-semibold text-gray-900">{interview.duration}</div>
                        <div className="text-sm text-gray-600">Minutes</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <div className="text-lg font-semibold text-gray-900">{interview.totalAttempts}</div>
                        <div className="text-sm text-gray-600">Attempts</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                        <div className="text-lg font-semibold text-gray-900">{Math.round(interview.averageScore)}%</div>
                        <div className="text-sm text-gray-600">Avg Score</div>
                      </div>
                    </div>

                    {/* Tags */}
                    {interview.tags.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Topics Covered:</h3>
                        <div className="flex flex-wrap gap-2">
                          {interview.tags.map(tag => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Student Status Card */}
                {studentStatus?.hasCompleted && (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-900">Completed</span>
                      </div>
                      <p className="text-sm text-green-800 mb-2">
                        You scored {studentStatus.completedScore}%
                      </p>
                      <p className="text-xs text-green-600">
                        Completed on {new Date(studentStatus.completedAt!).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {studentStatus?.hasActiveSession && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-blue-900">In Progress</span>
                      </div>
                      <p className="text-sm text-blue-800 mb-4">
                        You have an active interview session.
                      </p>
                      <Button 
                        onClick={resumeInterview}
                        disabled={starting}
                        className="w-full"
                      >
                        {starting ? 'Resuming...' : 'Resume Interview'}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Start Interview Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Ready to start?</h3>
                        <p className="text-sm text-gray-600">
                          This interview will take approximately {interview.duration} minutes to complete.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-gray-500">Expected score range:</p>
                        <div className="text-lg font-semibold text-gray-900">
                          {interview.estimatedScore.min}% - {interview.estimatedScore.max}%
                        </div>
                      </div>

                      <Button 
                        onClick={startInterview}
                        disabled={starting}
                        size="lg"
                        className="w-full gap-2"
                      >
                        <Play className="h-4 w-4" />
                        {starting ? 'Starting...' : 'Start Interview'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Tips Card */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">💡 Interview Tips</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Find a quiet space without distractions</li>
                      <li>• Speak clearly and think out loud</li>
                      <li>• Take your time to understand each question</li>
                      <li>• Ask for clarification if needed</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
