"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Bot, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Edit, 
  Save, 
  X, 
  Sparkles,
  FileQuestion,
  Eye,
  EyeOff
} from "lucide-react"

interface InterviewQuestionsModalProps {
  interview: {
    id: string
    title: string
    domain: string
    difficulty: string
    numberOfQuestions: number
    questionsGenerated: number
    questionsApproved: number
    readyToPublish: boolean
    isPublished: boolean
  }
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
}

interface Question {
  id: string
  questionNumber: number
  questionText: string
  expectedAnswer: string
  keyPoints: string[]
  category: string
  estimatedTime: number
  difficulty: string
  isApproved: boolean
  approvedBy: string | null
  approvedAt: string | null
}

export function InterviewQuestionsModal({ interview, isOpen, onClose, onUpdate }: InterviewQuestionsModalProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [showExpectedAnswers, setShowExpectedAnswers] = useState(false)
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

  // Load questions from API
  useEffect(() => {
    if (isOpen) {
      const loadQuestions = async () => {
        try {
          setLoading(true)
          setError(null)
          const response = await fetch(`${API_BASE_URL}/admin/interviews/${interview.id}/questions`, {
            method: 'GET',
            headers: getAuthHeaders()
          })
          
          if (!response.ok) {
            throw new Error('Failed to fetch questions')
          }
          
          const result = await response.json()
          
          if (result.questions) {
            // Transform backend data to match frontend interface
            const transformedQuestions = result.questions.map((question: any) => ({
              id: question._id,
              questionNumber: question.questionNumber,
              questionText: question.questionText,
              expectedAnswer: question.expectedAnswer,
              keyPoints: question.keyPoints,
              category: question.category,
              estimatedTime: question.estimatedTime,
              difficulty: question.difficulty,
              isApproved: question.isApproved,
              approvedBy: question.approvedBy?.name || question.approvedBy,
              approvedAt: question.approvedAt
            }))
            setQuestions(transformedQuestions)
          }
        } catch (err) {
          console.error('Failed to load questions:', err)
          setError(err instanceof Error ? err.message : 'Failed to load questions')
        } finally {
          setLoading(false)
        }
      }

      loadQuestions()
    }
  }, [isOpen, interview.id])

  const generateQuestions = async () => {
    setGenerating(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/interviews/${interview.id}/generate-questions`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to generate questions')
      }
      
      const result = await response.json()

      if (result.questions) {
        console.log('Questions generated successfully')
        // Reload questions
        const questionsResponse = await fetch(`${API_BASE_URL}/admin/interviews/${interview.id}/questions`, {
          method: 'GET',
          headers: getAuthHeaders()
        })
        
        if (!questionsResponse.ok) {
          throw new Error('Failed to fetch questions')
        }
        
        const questionsResult = await questionsResponse.json()
        if (questionsResult.questions) {
          const transformedQuestions = questionsResult.questions.map((question: any) => ({
            id: question._id,
            questionNumber: question.questionNumber,
            questionText: question.questionText,
            expectedAnswer: question.expectedAnswer,
            keyPoints: question.keyPoints,
            category: question.category,
            estimatedTime: question.estimatedTime,
            difficulty: question.difficulty,
            isApproved: question.isApproved,
            approvedBy: question.approvedBy?.name || question.approvedBy,
            approvedAt: question.approvedAt
          }))
          setQuestions(transformedQuestions)
        }
        onUpdate?.()
      }
    } catch (err) {
      console.error('Error generating questions:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate questions')
    } finally {
      setGenerating(false)
    }
  }

  const approveQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/questions/${questionId}/approve`, {
        method: 'PUT',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Failed to approve question')
      }
      
      const result = await response.json()

      if (result.question) {
        setQuestions(prev => prev.map(q => 
          q.id === questionId 
            ? { ...q, isApproved: true, approvedBy: 'Admin', approvedAt: new Date().toISOString() }
            : q
        ))
        onUpdate?.()
      }
    } catch (err) {
      console.error('Error approving question:', err)
      setError(err instanceof Error ? err.message : 'Failed to approve question')
    }
  }

  const bulkApproveQuestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/interviews/${interview.id}/bulk-approve`, {
        method: 'PUT',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Failed to approve questions')
      }
      
      const result = await response.json()

      if (result.approvedCount !== undefined) {
        setQuestions(prev => prev.map(q => ({
          ...q,
          isApproved: true,
          approvedBy: 'Admin',
          approvedAt: new Date().toISOString()
        })))
        onUpdate?.()
      }
    } catch (err) {
      console.error('Error bulk approving questions:', err)
      setError(err instanceof Error ? err.message : 'Failed to approve questions')
    }
  }

  const editQuestion = (questionId: string) => {
    const question = questions.find(q => q.id === questionId)
    if (question) {
      setEditingQuestion(questionId)
      setEditText(question.questionText)
    }
  }

  const saveEdit = async () => {
    if (!editingQuestion) return

    try {
      const response = await fetch(`${API_BASE_URL}/admin/questions/${editingQuestion}/edit`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ questionText: editText })
      })
      
      if (!response.ok) {
        throw new Error('Failed to edit question')
      }
      
      const result = await response.json()
      
      if (result.question) {
        setQuestions(prev => prev.map(q => 
          q.id === editingQuestion
            ? { ...q, questionText: editText, isApproved: false }
            : q
        ))
        setEditingQuestion(null)
        setEditText("")
        onUpdate?.()
      }
    } catch (err) {
      console.error('Error updating question:', err)
      setError(err instanceof Error ? err.message : 'Failed to update question')
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Technical': return 'bg-blue-100 text-blue-800'
      case 'Coding': return 'bg-purple-100 text-purple-800'
      case 'Behavioral': return 'bg-green-100 text-green-800'
      case 'System Design': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const publishInterview = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/interviews/${interview.id}/publish`, {
        method: 'PUT',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Failed to publish interview')
      }
      
      const result = await response.json()

      if (result.mockInterview) {
        console.log('Interview published successfully')
        onUpdate?.()
        onClose()
      }
    } catch (err) {
      console.error('Error publishing interview:', err)
      setError(err instanceof Error ? err.message : 'Failed to publish interview')
    }
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {interview.title} - Questions
            </DialogTitle>
          </DialogHeader>
          <div className="animate-pulse space-y-4 p-6">
            <div className="h-6 bg-gray-200 rounded w-64"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-xl">
                {interview.title} - Questions
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                {interview.domain} • {interview.difficulty} • {interview.numberOfQuestions} questions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExpectedAnswers(!showExpectedAnswers)}
                className="gap-1"
              >
                {showExpectedAnswers ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                {showExpectedAnswers ? 'Hide' : 'Show'} Answers
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Status Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileQuestion className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Generated</p>
                    <p className="text-xl font-bold">{questions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Approved</p>
                    <p className="text-xl font-bold">
                      {questions.filter(q => q.isApproved).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Est. Time</p>
                    <p className="text-xl font-bold">
                      {questions.reduce((sum, q) => sum + q.estimatedTime, 0)} min
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {questions.length === 0 && (
                <Button onClick={generateQuestions} disabled={generating} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  {generating ? "Generating..." : "Generate Questions"}
                </Button>
              )}
              
              {questions.length > 0 && questions.some(q => !q.isApproved) && (
                <Button onClick={bulkApproveQuestions} variant="outline" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Approve All
                </Button>
              )}
            </div>

            {interview.readyToPublish && !interview.isPublished && (
              <Button onClick={publishInterview} className="gap-2">
                <Bot className="h-4 w-4" />
                Publish Interview
              </Button>
            )}
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {questions.map((question) => (
              <Card key={question.id} className={`${question.isApproved ? 'border-green-200' : 'border-yellow-200'}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Q{question.questionNumber}</Badge>
                      <Badge className={getCategoryColor(question.category)}>
                        {question.category}
                      </Badge>
                      <Badge variant="outline">{question.estimatedTime} min</Badge>
                      {question.isApproved ? (
                        <Badge className="bg-green-100 text-green-800 gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800 gap-1">
                          <Clock className="h-3 w-3" />
                          Pending Review
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {!question.isApproved && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => approveQuestion(question.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Approve
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => editQuestion(question.id)}
                        className="gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {editingQuestion === question.id ? (
                    <div className="space-y-3">
                      <Label>Question Text</Label>
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit} className="gap-1">
                          <Save className="h-3 w-3" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingQuestion(null)
                            setEditText("")
                          }}
                          className="gap-1"
                        >
                          <X className="h-3 w-3" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-gray-900 font-medium">{question.questionText}</p>
                      
                      {question.keyPoints.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Key Points:</p>
                          <div className="flex flex-wrap gap-1">
                            {question.keyPoints.map((point, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {point}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {showExpectedAnswers && question.expectedAnswer && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-1">Expected Answer:</p>
                          <p className="text-sm text-gray-600">{question.expectedAnswer}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {questions.length === 0 && (
            <div className="text-center py-8">
              <Bot className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No questions generated yet</h3>
              <p className="mt-1 text-sm text-gray-500">Use AI to generate interview questions automatically.</p>
              <div className="mt-4">
                <Button onClick={generateQuestions} disabled={generating} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  {generating ? "Generating..." : "Generate Questions with AI"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
