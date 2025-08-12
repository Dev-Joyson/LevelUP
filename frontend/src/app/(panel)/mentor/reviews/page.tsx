"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader } from "@/components/common/Loader"
import { 
  Search, 
  Filter, 
  User, 
  Star, 
  Calendar,
  MessageSquare,
  ThumbsUp,
  TrendingUp
} from "lucide-react"

interface Review {
  id: string
  studentName: string
  studentEmail: string
  studentAvatar?: string
  rating: number
  comment: string
  sessionTopic: string
  sessionDate: string
  helpful: number
  createdAt: string
}

// Mock data - Replace with actual API calls
const mockReviews: Review[] = [
  {
    id: "1",
    studentName: "Ethan Harper",
    studentEmail: "ethan.harper@email.com",
    rating: 5,
    comment: "Dr. Wilson provided excellent guidance on React architecture. Her explanations were clear and she provided practical examples that helped me understand complex concepts. Highly recommend!",
    sessionTopic: "React Component Architecture",
    sessionDate: "2024-08-10",
    helpful: 12,
    createdAt: "2024-08-10",
  },
  {
    id: "2",
    studentName: "Olivia Bennett",
    studentEmail: "olivia.bennett@email.com",
    rating: 5,
    comment: "Amazing mentor! Dr. Wilson helped me create a comprehensive career development plan. She shared valuable insights about transitioning to product management and provided actionable steps.",
    sessionTopic: "Career Development Planning",
    sessionDate: "2024-08-08",
    helpful: 8,
    createdAt: "2024-08-08",
  },
  {
    id: "3",
    studentName: "Noah Carter",
    studentEmail: "noah.carter@email.com",
    rating: 4,
    comment: "Great technical interview preparation session. Dr. Wilson covered data structures and algorithms thoroughly. Would have liked more time for coding practice.",
    sessionTopic: "Technical Interview Preparation",
    sessionDate: "2024-08-05",
    helpful: 15,
    createdAt: "2024-08-05",
  },
  {
    id: "4",
    studentName: "Emma Wilson",
    studentEmail: "emma.wilson@email.com",
    rating: 5,
    comment: "Perfect introduction to JavaScript fundamentals. Dr. Wilson made complex concepts easy to understand and provided great resources for further learning.",
    sessionTopic: "JavaScript Fundamentals",
    sessionDate: "2024-08-03",
    helpful: 6,
    createdAt: "2024-08-03",
  },
  {
    id: "5",
    studentName: "James Rodriguez",
    studentEmail: "james.rodriguez@email.com",
    rating: 4,
    comment: "Helpful resume review session. Got good feedback on technical skills presentation and project descriptions. Some suggestions were very actionable.",
    sessionTopic: "Resume Review",
    sessionDate: "2024-07-30",
    helpful: 4,
    createdAt: "2024-07-30",
  },
  {
    id: "6",
    studentName: "Sarah Johnson",
    studentEmail: "sarah.johnson@email.com",
    rating: 5,
    comment: "Outstanding mentor! Dr. Wilson helped me understand system design principles and provided real-world examples from her experience at Google. Invaluable session!",
    sessionTopic: "System Design Fundamentals",
    sessionDate: "2024-07-28",
    helpful: 20,
    createdAt: "2024-07-28",
  },
]

const renderStars = (rating: number) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? "text-yellow-500 fill-current" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<Review[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [ratingFilter, setRatingFilter] = useState("all")

  useEffect(() => {
    // Simulate loading and data fetching
    const timer = setTimeout(() => {
      setReviews(mockReviews)
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.sessionTopic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRating = ratingFilter === "all" || review.rating.toString() === ratingFilter
    return matchesSearch && matchesRating
  })

  // Calculate stats
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0"
  
  const totalHelpfulVotes = reviews.reduce((acc, review) => acc + review.helpful, 0)
  const fiveStarReviews = reviews.filter(r => r.rating === 5).length
  const fiveStarPercentage = reviews.length > 0 
    ? Math.round((fiveStarReviews / reviews.length) * 100)
    : 0

  if (loading) return <Loader />

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews & Feedback</h1>
          <p className="text-gray-600 text-sm mt-1">See what your mentees are saying about your sessions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-yellow-50">
                    <Star className="h-4 w-4 text-yellow-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Average Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-gray-900">{averageRating}</div>
                  <div className="flex items-center gap-1">
                    {renderStars(Math.round(parseFloat(averageRating)))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Total Reviews</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{reviews.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-50">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">5-Star Reviews</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{fiveStarPercentage}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-50">
                    <ThumbsUp className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Helpful Votes</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{totalHelpfulVotes}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Reviews ({filteredReviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {filteredReviews.map((review, index) => (
              <div 
                key={review.id} 
                className={`${index !== filteredReviews.length - 1 ? 'border-b border-gray-100 pb-6' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={review.studentAvatar} alt={review.studentName} />
                    <AvatarFallback>
                      <User className="h-6 w-6 text-gray-600" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{review.studentName}</h3>
                        <p className="text-xs text-gray-500">{review.studentEmail}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-600">{review.rating}/5</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {review.sessionDate}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 mb-2">
                        {review.sessionTopic}
                      </Badge>
                      <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{review.helpful} people found this helpful</span>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1">
                        <MessageSquare className="h-3 w-3" />
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
