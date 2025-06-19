"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, User, Calendar, Star, Reply } from "lucide-react"

interface Feedback {
  id: number
  user: string
  email: string
  type: string
  subject: string
  message: string
  rating: number
  status: string
  date: string
  category: string
}

interface FeedbackDetailsModalProps {
  feedback: Feedback | null
  isOpen: boolean
  onClose: () => void
}

export function FeedbackDetailsModal({ feedback, isOpen, onClose }: FeedbackDetailsModalProps) {
  if (!feedback) return null

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "in progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "bug report":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Bug Report</Badge>
      case "feature request":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Feature Request</Badge>
      case "general":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">General</Badge>
      case "complaint":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Complaint</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-bold">Feedback Details</DialogTitle>
          <div className="flex items-center gap-2">
            {getStatusBadge(feedback.status)}
            {getTypeBadge(feedback.type)}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Feedback Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Feedback Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{feedback.user}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{feedback.date}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Subject</h4>
                <p className="text-gray-700">{feedback.subject}</p>
              </div>

              {feedback.rating > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Rating</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(feedback.rating)}</div>
                    <span className="text-sm text-gray-600">({feedback.rating}/5)</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback Message */}
          <Card>
            <CardHeader>
              <CardTitle>Message</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{feedback.message}</p>
              </div>
            </CardContent>
          </Card>

          {/* Response Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Reply className="h-5 w-5" />
                Admin Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              {feedback.status.toLowerCase() === "resolved" ? (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-800">
                    Thank you for your feedback. We have reviewed your concern and taken appropriate action. If you have
                    any further questions, please don't hesitate to contact us.
                  </p>
                  <p className="text-sm text-green-600 mt-2">Responded by Admin • 2 days ago</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">No response yet. This feedback is currently being reviewed.</p>
                  <Button className="flex items-center gap-2">
                    <Reply className="h-4 w-4" />
                    Send Response
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {feedback.status.toLowerCase() !== "resolved" && <Button>Mark as Resolved</Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
