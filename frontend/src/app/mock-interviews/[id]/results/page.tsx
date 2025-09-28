"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Download,
  Clock,
  FileQuestion,
  CheckCircle,
  TrendingUp,
  ArrowLeft,
  Share2,
  RotateCcw
} from "lucide-react"
import Link from "next/link"

interface InterviewResult {
  sessionId: string
  mockInterview: {
    id: string
    title: string
    domain: string
    difficulty: string
    numberOfQuestions: number
    duration: number
  }
  completedAt: string
  totalTimeSpent: number
  questionsAnswered: number
  finalScore?: number
  reportGenerated: boolean
  status: 'completed' | 'terminated'
}

export default function InterviewResultsPage() {
  const params = useParams()
  const router = useRouter()
  const [result, setResult] = useState<InterviewResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloadingReport, setDownloadingReport] = useState(false)
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

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get the latest session for this mock interview
        const response = await fetch(`${API_BASE_URL}/student/mock-interviews/${params.id}/latest-session`, {
          method: 'GET',
          headers: getAuthHeaders()
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch interview results')
        }
        
        const data = await response.json()

        if (data.session) {
          const session = data.session
          setResult({
            sessionId: session.sessionId,
            mockInterview: session.mockInterview,
            completedAt: session.endedAt || session.startedAt,
            totalTimeSpent: session.totalTimeSpent,
            questionsAnswered: session.questionsAttempted,
            finalScore: session.finalReport?.overallScore,
            reportGenerated: !!session.finalReport,
            status: session.status
          })
        }
      } catch (err) {
        console.error('Error loading results:', err)
        setError(err instanceof Error ? err.message : 'Failed to load results')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadResults()
    }
  }, [params.id])

  const downloadReport = async () => {
    if (!result) return

    setDownloadingReport(true)
    try {
      const response = await fetch(`${API_BASE_URL}/student/interview-report/${result.sessionId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to download report')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `interview-report-${result.sessionId}.pdf`
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
    } catch (err) {
      console.error('Error downloading report:', err)
      setError('Failed to download report. Please try again.')
    } finally {
      setDownloadingReport(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-600'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load results</h2>
          <p className="text-gray-600 mb-6">{error || 'Interview results not found'}</p>
          <Link href="/mock-interviews">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Mock Interviews
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/mock-interviews">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Mock Interviews
            </Button>
          </Link>
          
          <div className="text-center">
            <div className="mb-4">
              {result.status === 'completed' ? (
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              ) : (
                <Clock className="h-16 w-16 text-yellow-600 mx-auto" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {result.status === 'completed' ? 'Interview Completed!' : 'Interview Ended'}
            </h1>
            <p className="text-gray-600">
              {result.status === 'completed' 
                ? 'Great job! You have successfully completed your mock interview.'
                : 'Your interview session has ended. You can review your progress below.'}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Interview Summary Card */}
          <Card className="shadow-lg border-0 mb-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-2">{result.mockInterview.title}</CardTitle>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{result.mockInterview.domain}</Badge>
                    <Badge className={getDifficultyColor(result.mockInterview.difficulty)}>
                      {result.mockInterview.difficulty}
                    </Badge>
                  </div>
                </div>
                {result.finalScore && (
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getScoreColor(result.finalScore)}`}>
                      {result.finalScore}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <FileQuestion className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-900">
                    {result.questionsAnswered}/{result.mockInterview.numberOfQuestions}
                  </div>
                  <div className="text-sm text-gray-600">Questions Answered</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDuration(result.totalTimeSpent)}
                  </div>
                  <div className="text-sm text-gray-600">Time Spent</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-900">
                    {Math.round((result.questionsAnswered / result.mockInterview.numberOfQuestions) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-gray-900">
                    {new Date(result.completedAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600">Date Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Next?</h3>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {result.reportGenerated && (
                    <Button 
                      onClick={downloadReport}
                      disabled={downloadingReport}
                      className="gap-2"
                      size="lg"
                    >
                      <Download className="h-4 w-4" />
                      {downloadingReport ? 'Downloading...' : 'Download Detailed Report'}
                    </Button>
                  )}

                  <Button 
                    variant="outline"
                    onClick={() => router.push('/mock-interviews')}
                    className="gap-2"
                    size="lg"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Try Another Interview
                  </Button>

                  <Button 
                    variant="outline"
                    onClick={() => router.push('/mock-interviews/history')}
                    className="gap-2"
                    size="lg"
                  >
                    <TrendingUp className="h-4 w-4" />
                    View History
                  </Button>
                </div>

                {!result.reportGenerated && (
                  <p className="text-sm text-gray-500 mt-4">
                    Your detailed report is being generated and will be available shortly.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

