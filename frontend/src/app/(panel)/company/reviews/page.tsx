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
  MessageSquare,
  Briefcase,
  Users
} from 'lucide-react'
import { toast } from 'sonner'
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
  internshipId: {
    _id: string
    title: string
    domain: string
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

export default function CompanyReviewsPage() {
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterRating, setFilterRating] = useState<number | 'all'>('all')

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError(null)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      console.log('Fetching company reviews from:', `${API_BASE_URL}/api/company/reviews`)
      
      const response = await axios.get(`${API_BASE_URL}/api/company/reviews`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })

      if (response.data) {
        setReviewsData(response.data)
        console.log('Company reviews loaded:', response.data)
        
        // Debug profile images
        if (response.data.reviews?.length > 0) {
          response.data.reviews.forEach((review: Review, index: number) => {
            console.log(`Review ${index} - Student:`, {
              name: `${review.studentId.firstname} ${review.studentId.lastname}`,
              profileImage: review.studentId.profileImage,
              hasProfileImage: !!review.studentId.profileImage
            })
          })
        }
      }
    } catch (error: any) {
      console.error('Error fetching company reviews:', error)
      
      if (error.response?.status === 403) {
        setError('Access forbidden. Please ensure you are logged in as a company.')
      } else if (error.response?.status === 404) {
        setError('Company not found.')
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to load reviews')
      }
      toast.error('Failed to load company reviews')
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating 
                ? 'text-yellow-500 fill-yellow-500' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const filteredReviews = reviewsData?.reviews.filter(review => {
    if (filterRating === 'all') return true
    return review.rating === filterRating
  }) || []

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-50'
    if (rating >= 3.5) return 'text-blue-600 bg-blue-50'
    if (rating >= 2.5) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getStudentInitials = (firstname: string, lastname: string) => {
    return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Company Reviews</h1>
                <p className="text-gray-600">Student feedback and ratings for your internship programs</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-3 text-lg text-gray-600">Loading reviews...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Company Reviews</h1>
                <p className="text-gray-600">Student feedback and ratings for your internship programs</p>
              </div>
            </div>
          </div>
          
          <Card className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <MessageSquare className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Error Loading Reviews</h3>
              <p className="text-gray-600 mt-2">{error}</p>
              <Button 
                onClick={fetchReviews} 
                className="mt-4"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Company Reviews</h1>
                <p className="text-gray-600">Student feedback and ratings for your internship programs</p>
              </div>
            </div>
            
            <Button 
              onClick={fetchReviews} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {reviewsData?.analytics.totalReviews || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-gray-900">
                      {reviewsData?.analytics.averageRating || 0}
                    </p>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating Trend</p>
                  <p className="text-3xl font-bold text-green-600">
                    <TrendingUp className="h-6 w-6 inline" />
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Student Feedback</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {reviewsData?.reviews.filter(r => r.review && r.review.trim()).length || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rating Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Rating Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviewsData?.analytics.ratingDistribution[rating as keyof typeof reviewsData.analytics.ratingDistribution] || 0
                const total = reviewsData?.analytics.totalReviews || 1
                const percentage = (count / total) * 100
                
                return (
                  <div key={rating} className="flex items-center gap-4">
                    <div className="flex items-center gap-1 w-20">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12">{count}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Filter Controls */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by rating:</span>
            <div className="flex gap-2">
              <Button
                variant={filterRating === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterRating('all')}
              >
                All
              </Button>
              {[5, 4, 3, 2, 1].map((rating) => (
                <Button
                  key={rating}
                  variant={filterRating === rating ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterRating(rating)}
                  className="flex items-center gap-1"
                >
                  {rating} <Star className="h-3 w-3" />
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {reviewsData?.analytics.totalReviews === 0 
                ? 'No Reviews Yet' 
                : 'No Reviews Match Filter'}
            </h3>
            <p className="text-gray-600">
              {reviewsData?.analytics.totalReviews === 0
                ? 'Students will be able to rate your company after completing internships.'
                : 'Try adjusting your filter criteria to see more reviews.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <Card key={review._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage 
                          src={review.studentId.profileImage || undefined} 
                          alt={`${review.studentId.firstname} ${review.studentId.lastname}`} 
                          onError={(e) => {
                            console.log('Avatar image failed to load:', review.studentId.profileImage)
                            console.log('Falling back to initials for:', review.studentId.firstname, review.studentId.lastname)
                          }}
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                          {getStudentInitials(review.studentId.firstname, review.studentId.lastname)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {review.studentId.firstname} {review.studentId.lastname}
                          </h4>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {review.internshipId.title}
                          </Badge>
                          <Badge variant="outline">
                            {review.internshipId.domain}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      {renderStars(review.rating, 'md')}
                      <Badge 
                        className={`${getRatingColor(review.rating)} border-0`}
                      >
                        {review.rating}/5
                      </Badge>
                    </div>
                  </div>
                  
                  {review.review && review.review.trim() && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                      <p className="text-gray-700 leading-relaxed">
                        {review.review}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More Button (if needed in the future) */}
        {filteredReviews.length > 0 && filteredReviews.length >= 10 && (
          <div className="text-center mt-8">
            <Button variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Load More Reviews
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}