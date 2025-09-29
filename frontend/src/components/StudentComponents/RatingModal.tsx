"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"
import { useAuth } from "@/context/AuthContext"

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  mentorId: string
  mentorName: string
  sessionId: string
  sessionType?: string
  onRatingSubmitted?: () => void
}

export function RatingModal({
  isOpen,
  onClose,
  mentorId,
  mentorName,
  sessionId,
  sessionType,
  onRatingSubmitted
}: RatingModalProps) {
  const [rating, setRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [review, setReview] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { token } = useAuth()

  const handleStarClick = (starRating: number) => {
    setRating(starRating)
  }

  const handleStarHover = (starRating: number) => {
    setHoveredRating(starRating)
  }

  const handleStarLeave = () => {
    setHoveredRating(0)
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    try {
      setIsSubmitting(true)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

      const response = await axios.post(
        `${API_BASE_URL}/api/mentor/rate`,
        {
          mentorId,
          sessionId,
          rating,
          review: review.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        toast.success('Rating submitted successfully!')
        onRatingSubmitted?.()
        onClose()
        
        // Reset form
        setRating(0)
        setReview('')
      } else {
        throw new Error(response.data.message || 'Failed to submit rating')
      }
    } catch (error: any) {
      console.error('Error submitting rating:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to submit rating')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      // Reset form after a short delay to avoid visual flicker
      setTimeout(() => {
        setRating(0)
        setReview('')
        setHoveredRating(0)
      }, 300)
    }
  }

  const getRatingText = (rating: number) => {
    const texts = {
      1: 'Poor',
      2: 'Fair', 
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    }
    return texts[rating as keyof typeof texts] || ''
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Rate Your Session
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Mentor Info */}
          <div className="text-center">
            <p className="text-gray-600">
              How was your session with <span className="font-medium">{mentorName}</span>?
            </p>
            {sessionType && (
              <p className="text-sm text-gray-500 mt-1">{sessionType}</p>
            )}
          </div>

          {/* Star Rating */}
          <div className="flex flex-col items-center space-y-3">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = (hoveredRating || rating) >= star
                return (
                  <button
                    key={star}
                    type="button"
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                    onMouseLeave={handleStarLeave}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        isActive 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300 hover:text-yellow-300'
                      }`}
                    />
                  </button>
                )
              })}
            </div>
            
            {/* Rating Text */}
            <div className="h-5">
              {(hoveredRating || rating) > 0 && (
                <p className="text-sm font-medium text-gray-700">
                  {getRatingText(hoveredRating || rating)}
                </p>
              )}
            </div>
          </div>

          {/* Review Text Area */}
          <div className="space-y-2">
            <label htmlFor="review" className="text-sm font-medium text-gray-700">
              Share your experience (optional)
            </label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Tell us about your session experience..."
              rows={3}
              className="resize-none"
              maxLength={500}
            />
            <div className="text-right">
              <span className="text-xs text-gray-500">{review.length}/500</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1 bg-[#535c91] hover:bg-[#464f7a]"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

