"use client"

import { useState } from "react"
import { Card, CardContent } from "@/app/(panel)/admin/components/ui/card"
import { Input } from "@/app/(panel)/admin/components/ui/input"
import { Badge } from "@/app/(panel)/admin/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/(panel)/admin/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/(panel)/admin/components/ui/table"
import { Search, Star } from "lucide-react"
import { FeedbackDetailsModal } from "@/app/(panel)/admin/components/feedback-details-modal"

const feedbacks = [
  {
    id: 1,
    user: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    type: "Bug Report",
    subject: "Login page not loading properly",
    message:
      "I'm having trouble accessing the login page. It keeps showing a blank screen when I try to log in from my mobile device. This has been happening for the past two days.",
    rating: 0,
    status: "In Progress",
    date: "2024-01-15",
    category: "Technical",
  },
  {
    id: 2,
    user: "Mike Chen",
    email: "mike.chen@email.com",
    type: "Feature Request",
    subject: "Add dark mode option",
    message:
      "It would be great if you could add a dark mode option to the platform. Many users prefer dark themes, especially when working late hours.",
    rating: 4,
    status: "Pending",
    date: "2024-01-14",
    category: "UI/UX",
  },
  {
    id: 3,
    user: "Emma Davis",
    email: "emma.davis@email.com",
    type: "General",
    subject: "Great platform!",
    message:
      "I just wanted to say thank you for creating such an amazing platform. It has really helped me in my internship search and career development.",
    rating: 5,
    status: "Resolved",
    date: "2024-01-13",
    category: "Praise",
  },
  {
    id: 4,
    user: "Alex Rodriguez",
    email: "alex.rodriguez@email.com",
    type: "Complaint",
    subject: "Slow response from mentors",
    message:
      "I've been waiting for a response from my assigned mentor for over a week. The communication seems very slow and it's affecting my learning experience.",
    rating: 2,
    status: "Pending",
    date: "2024-01-12",
    category: "Service",
  },
  {
    id: 5,
    user: "Lisa Wang",
    email: "lisa.wang@email.com",
    type: "Bug Report",
    subject: "Profile picture upload fails",
    message:
      "Every time I try to upload a profile picture, I get an error message saying 'Upload failed'. I've tried different image formats but none work.",
    rating: 0,
    status: "Resolved",
    date: "2024-01-11",
    category: "Technical",
  },
]

export default function FeedbackPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedFeedback, setSelectedFeedback] = useState<(typeof feedbacks)[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch =
      feedback.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || feedback.type.toLowerCase() === typeFilter.toLowerCase()
    const matchesStatus = statusFilter === "all" || feedback.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesType && matchesStatus
  })

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
    if (rating === 0) return <span className="text-gray-400 text-sm">No rating</span>

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className={`h-3 w-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    )
  }

  const handleViewFeedback = (feedback: (typeof feedbacks)[0]) => {
    setSelectedFeedback(feedback)
    setIsModalOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
        <p className="text-gray-600 mt-1">Manage user feedback and support requests</p>
      </div>

      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search feedback"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="bug report">Bug Report</SelectItem>
              <SelectItem value="feature request">Feature Request</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="complaint">Complaint</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Feedback Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="font-medium text-gray-600 py-4">User</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Type</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Subject</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Rating</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Status</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedbacks.map((feedback) => (
                <TableRow
                  key={feedback.id}
                  className="border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleViewFeedback(feedback)}
                >
                  <TableCell className="py-4 font-medium">{feedback.user}</TableCell>
                  <TableCell className="py-4">{getTypeBadge(feedback.type)}</TableCell>
                  <TableCell className="py-4 text-gray-600 max-w-xs truncate">{feedback.subject}</TableCell>
                  <TableCell className="py-4">{renderStars(feedback.rating)}</TableCell>
                  <TableCell className="py-4">{getStatusBadge(feedback.status)}</TableCell>
                  <TableCell className="py-4 text-gray-600">{feedback.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <FeedbackDetailsModal feedback={selectedFeedback} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
