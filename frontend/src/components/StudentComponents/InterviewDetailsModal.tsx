"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  FileQuestion, 
  Clock, 
  TrendingUp, 
  Users, 
  Play,
  CheckCircle,
  AlertCircle,
  Star,
  Target,
  Award
} from "lucide-react"

interface InterviewDetailsModalProps {
  interview: {
    id: string
    title: string
    domain: string
    difficulty: string
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
  isOpen: boolean
  onClose: () => void
}

export function InterviewDetailsModal({ interview, isOpen, onClose }: InterviewDetailsModalProps) {
  const [isStarting, setIsStarting] = useState(false)
  const router = useRouter()

  const startInterview = async () => {
    setIsStarting(true)
    try {
      // TODO: Replace with actual API call to start interview
      // This would create a session and redirect to the interview page
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to interview session page
      router.push(`/student/mock-interviews/${interview.id}/session`)
    } catch (error) {
      console.error('Error starting interview:', error)
    } finally {
      setIsStarting(false)
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

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '🟢'
      case 'Medium': return '🟡' 
      case 'Hard': return '🔴'
      default: return '⚪'
    }
  }

  const getSuccessRateColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{interview.title}</DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{interview.domain}</Badge>
            <Badge className={getDifficultyColor(interview.difficulty)}>
              {getDifficultyIcon(interview.difficulty)} {interview.difficulty}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">About This Interview</h3>
            <p className="text-gray-600">{interview.description}</p>
          </div>

          {/* Interview Details */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileQuestion className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Questions</p>
                    <p className="text-xl font-bold">{interview.numberOfQuestions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="text-xl font-bold">{interview.duration} min</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Stats */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Performance Statistics</h3>
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {Math.round(interview.averageScore)}%
                      </p>
                      <p className="text-sm text-gray-600">Average Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{interview.totalAttempts}</p>
                      <p className="text-sm text-gray-600">Total Attempts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Target className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-orange-600">
                        {interview.estimatedScore.min}%-{interview.estimatedScore.max}%
                      </p>
                      <p className="text-sm text-gray-600">Score Range</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Skills & Tags */}
          {interview.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Skills Covered</h3>
              <div className="flex flex-wrap gap-2">
                {interview.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Interview Format */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Interview Format</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-blue-100 rounded-full mt-1">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Real-time AI Interaction</p>
                  <p className="text-sm text-gray-600">
                    Chat with our AI interviewer who will ask questions and provide instant feedback
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 bg-green-100 rounded-full mt-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Immediate Evaluation</p>
                  <p className="text-sm text-gray-600">
                    Get instant feedback on each answer with scores and improvement suggestions
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 bg-purple-100 rounded-full mt-1">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Comprehensive Report</p>
                  <p className="text-sm text-gray-600">
                    Receive a detailed PDF report with your performance analysis and recommendations
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Interview Tips</p>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Find a quiet environment free from distractions</li>
                  <li>• Take your time to think through each answer</li>
                  <li>• Be specific and provide examples where possible</li>
                  <li>• Don't worry about perfect answers - the AI provides helpful feedback</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={startInterview} 
              disabled={isStarting}
              className="flex-1 gap-2"
            >
              <Play className="h-4 w-4" />
              {isStarting ? "Starting..." : "Start Interview"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

