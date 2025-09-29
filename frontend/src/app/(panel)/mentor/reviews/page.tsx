"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Star, 
  User,
  Calendar,
  RefreshCw,
  Filter,
  TrendingUp,
  MessageSquare
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'

interface Review {
  _id: string
  studentId: {
    _id: string
    firstname: string
    lastname: string
    profileImage?: string
  }
  sessionId: {
    _id: string
    sessionTypeName: string
    date: string
  }
  rating: number
  review: string
  createdAt: string
}

interface ReviewsData {
  reviews: Review[]
  analytics: {
    totalReviews: number
    averageRating: number
    ratingDistribution: {
      5: number
      4: number
      3: number
      2: number
      1: number
    }
  }
}

export default function MentorReviewsPage() {
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterRating, setFilterRating] = useState<number | 'all'>('all')
  const { token, user } = useAuth()

  useEffect(() => {
    if (token && user?.role === 'mentor') {
      fetchReviews()
    } else if (user && user.role !== 'mentor') {
      setError('Access denied. Mentor role required.')
      setLoading(false)
    }
  }, [token, user])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError(null)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      
      // Check if token exists
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      console.log('Token exists:', !!token)
      console.log('Making request to:', `${API_BASE_URL}/api/mentor/me`)
      
      // First get mentor profile to get reviews
      const mentorResponse = await axios.get(`${API_BASE_URL}/api/mentor/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })

      if (mentorResponse.data) {
        const mentor = mentorResponse.data
        const reviews = mentor.reviews || []
        
        // Calculate rating distribution
        const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        reviews.forEach((review: any) => {
          if (review.rating >= 1 && review.rating <= 5) {
            ratingDistribution[review.rating as keyof typeof ratingDistribution]++
          }
        })

        // Reviews now come with populated student and session data from backend
        const reviewsWithStudentData = reviews.map((review: any, index: number) => ({
          ...review,
          _id: review._id || `review_${index}`,
          studentId: review.studentId || {
            _id: 'unknown',
            firstname: 'Unknown',
            lastname: 'Student',
            profileImage: ''
          },
          sessionId: review.sessionId || {
            _id: 'unknown',
            sessionTypeName: 'Mentorship Session',
            date: review.createdAt
          }
        }))

        setReviewsData({
          reviews: reviewsWithStudentData,
          analytics: {
            totalReviews: reviews.length,
            averageRating: mentor.rating || 0,
            ratingDistribution
          }
        })
      }
    } catch (error: any) {
      console.error('Error fetching reviews:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('User role:', user?.role)
      
      if (error.response?.status === 403) {
        setError('Access forbidden. Please ensure you are logged in as a mentor.')
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to load reviews')
      }
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 bg-green-50'
    if (rating >= 3) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const filteredReviews = reviewsData?.reviews.filter(review => 
    filterRating === 'all' || review.rating === filterRating
  ) || []

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading reviews...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !reviewsData) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {error || 'Unable to load reviews'}
            </p>
            <Button 
              onClick={fetchReviews}
              className="bg-[#535c91] hover:bg-[#464f7a]"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-gray-600 text-sm mt-1">
            Feedback from your mentoring sessions
          </p>
        </div>
        <Button 
          onClick={fetchReviews}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{reviewsData.analytics.totalReviews}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {reviewsData.analytics.averageRating.toFixed(1)}
                  </p>
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">5-Star Reviews</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">{reviewsData.analytics.ratingDistribution[5]}</p>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  {reviewsData.analytics.totalReviews > 0 
                    ? Math.round((reviewsData.analytics.ratingDistribution[5] / reviewsData.analytics.totalReviews) * 100)
                    : 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">4+ Star Reviews</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">
                  {reviewsData.analytics.ratingDistribution[5] + reviewsData.analytics.ratingDistribution[4]}
                </p>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  {reviewsData.analytics.totalReviews > 0 
                    ? Math.round(((reviewsData.analytics.ratingDistribution[5] + reviewsData.analytics.ratingDistribution[4]) / reviewsData.analytics.totalReviews) * 100)
                    : 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviewsData.analytics.ratingDistribution[rating as keyof typeof reviewsData.analytics.ratingDistribution]
              const percentage = reviewsData.analytics.totalReviews > 0 
                ? (count / reviewsData.analytics.totalReviews) * 100 
                : 0
              
              return (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-16">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-16 text-sm text-gray-600 text-right">
                    {count} ({percentage.toFixed(0)}%)
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-600">Filter by rating:</span>
        </div>
        <div className="flex gap-2">
          {(['all', 5, 4, 3, 2, 1] as const).map((rating) => (
            <Button
              key={rating}
              variant={filterRating === rating ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterRating(rating)}
              className={`${
                filterRating === rating 
                  ? "bg-[#535c91] hover:bg-[#464f7a]" 
                  : ""
              }`}
            >
              {rating === 'all' ? 'All' : `${rating}★`}
            </Button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filterRating === 'all' ? 'No reviews yet' : `No ${filterRating}-star reviews`}
              </h3>
              <p className="text-gray-500">
                {filterRating === 'all' 
                  ? 'Complete some sessions to start receiving reviews from students'
                  : `Try selecting a different rating filter to see more reviews`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.studentId.profileImage} alt={`${review.studentId.firstname} ${review.studentId.lastname}`} />
                      <AvatarFallback>
                        {review.studentId.firstname[0]}{review.studentId.lastname[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {review.studentId.firstname} {review.studentId.lastname}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {review.sessionId.sessionTypeName}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {renderStars(review.rating)}
                        <Badge className={`${getRatingColor(review.rating)} border-0`}>
                          {review.rating}/5
                        </Badge>
                      </div>
                      
                      {review.review && (
                        <p className="text-gray-700 mt-3 leading-relaxed">
                          "{review.review}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}