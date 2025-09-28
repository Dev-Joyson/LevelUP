"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  FileQuestion, 
  Clock, 
  TrendingUp, 
  Calendar, 
  Download, 
  Eye, 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface InterviewAttempt {
  id: string
  sessionId: string
  mockInterview: {
    id: string
    title: string
    domain: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
  }
  status: 'completed' | 'terminated' | 'in_progress'
  startedAt: string
  endedAt?: string
  totalTimeSpent: number
  questionsAttempted: number
  totalQuestions: number
  finalScore?: number
  completionRate: number
  reportGenerated: boolean
}

export default function InterviewHistoryPage() {
  const router = useRouter()
  const [attempts, setAttempts] = useState<InterviewAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [domainFilter, setDomainFilter] = useState<string>("all")
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

  // Load interview history from API
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`${API_BASE_URL}/student/interview-history`, {
          method: 'GET',
          headers: getAuthHeaders()
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch interview history')
        }
        
        const result = await response.json()
        
        if (result.sessions) {
          // Transform backend data to match frontend interface
          const transformedAttempts = result.sessions.map((session: any) => ({
            id: session._id,
            sessionId: session.sessionId,
            mockInterview: {
              id: session.mockInterviewId._id,
              title: session.mockInterviewId.title,
              domain: session.mockInterviewId.domain,
              difficulty: session.mockInterviewId.difficulty
            },
            status: session.status,
            startedAt: session.startedAt,
            endedAt: session.endedAt,
            totalTimeSpent: session.totalTimeSpent,
            questionsAttempted: session.questionsAttempted,
            totalQuestions: session.totalQuestions,
            finalScore: session.finalReport?.overallScore,
            completionRate: Math.round((session.questionsAttempted / session.totalQuestions) * 100),
            reportGenerated: !!session.finalReport
          }))
          setAttempts(transformedAttempts)
        }
      } catch (err) {
        console.error('Failed to load interview history:', err)
        setError(err instanceof Error ? err.message : 'Failed to load interview history')
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  const filteredAttempts = attempts.filter(attempt => {
    const matchesSearch = attempt.mockInterview.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attempt.mockInterview.domain.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || statusFilter === 'all' || attempt.status === statusFilter
    const matchesDomain = !domainFilter || domainFilter === 'all' || attempt.mockInterview.domain === domainFilter
    
    return matchesSearch && matchesStatus && matchesDomain
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'terminated': return 'bg-red-100 text-red-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'terminated': return <XCircle className="h-4 w-4" />
      case 'in_progress': return <AlertCircle className="h-4 w-4" />
      default: return null
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const downloadReport = async (sessionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/interview-report/${sessionId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to download report')
      }
      
      // Return blob for download
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `interview-report-${sessionId}.pdf`
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
    } catch (err) {
      console.error('Error downloading report:', err)
      setError(err instanceof Error ? err.message : 'Failed to download report')
    }
  }

  const viewDetails = (attempt: InterviewAttempt) => {
    // Navigate to session details page
    router.push(`/mock-interviews/${attempt.mockInterview.id}/session/${attempt.sessionId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/mock-interviews" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Mock Interviews
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Interview History</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track your progress and review past interview attempts
          </p>
        </div>

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
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

        {/* Summary Stats */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileQuestion className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                    <p className="text-2xl font-bold text-gray-900">{attempts.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {attempts.filter(a => a.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(
                        attempts
                          .filter(a => a.finalScore !== undefined)
                          .reduce((sum, a) => sum + (a.finalScore || 0), 0) /
                        attempts.filter(a => a.finalScore !== undefined).length
                      ) || 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Award className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Best Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.max(...attempts.filter(a => a.finalScore !== undefined).map(a => a.finalScore || 0)) || 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search interviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg border-gray-200"
              />
            </div>
            
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-12">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                </SelectContent>
              </Select>

              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger className="w-[180px] h-12">
                  <SelectValue placeholder="All Domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  <SelectItem value="Web Development">Web Development</SelectItem>
                  <SelectItem value="Data Structures & Algorithms">DSA</SelectItem>
                  <SelectItem value="System Design">System Design</SelectItem>
                  <SelectItem value="Machine Learning">ML</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Interview History List */}
        <div className="max-w-6xl mx-auto space-y-4">
          {filteredAttempts.map((attempt) => (
            <Card key={attempt.id} className="hover:shadow-xl transition-all duration-200 shadow-lg border-0">
              <CardContent className="p-8">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-xl font-semibold">{attempt.mockInterview.title}</h3>
                      <Badge variant="outline">{attempt.mockInterview.domain}</Badge>
                      <Badge className={getDifficultyColor(attempt.mockInterview.difficulty)}>
                        {attempt.mockInterview.difficulty}
                      </Badge>
                      <Badge className={getStatusColor(attempt.status)} variant="secondary">
                        {getStatusIcon(attempt.status)}
                        <span className="ml-1 capitalize">{attempt.status}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-gray-600">Started</p>
                          <p className="font-medium">{formatDate(attempt.startedAt)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-gray-600">Duration</p>
                          <p className="font-medium">{formatDuration(attempt.totalTimeSpent)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <FileQuestion className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-gray-600">Progress</p>
                          <p className="font-medium">
                            {attempt.questionsAttempted}/{attempt.totalQuestions} ({attempt.completionRate}%)
                          </p>
                        </div>
                      </div>

                      {attempt.finalScore !== undefined && (
                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-gray-600">Score</p>
                            <p className={`font-bold text-xl ${getScoreColor(attempt.finalScore)}`}>
                              {attempt.finalScore}%
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 ml-6">
                    <Button
                      variant="outline"
                      onClick={() => viewDetails(attempt)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Details
                    </Button>
                    
                    {attempt.reportGenerated && (
                      <Button
                        variant="outline"
                        onClick={() => downloadReport(attempt.sessionId)}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Report
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredAttempts.length === 0 && (
          <div className="text-center py-16">
            <FileQuestion className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No interview history found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              {attempts.length === 0 
                ? "You haven't taken any mock interviews yet. Start your first interview to see your progress here."
                : "Try adjusting your search or filter criteria."
              }
            </p>
            {attempts.length === 0 && (
              <Link href="/mock-interviews">
                <Button className="gap-2">
                  <FileQuestion className="h-4 w-4" />
                  Browse Mock Interviews
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
