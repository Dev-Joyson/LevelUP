"use client"

import Image from "next/image"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export interface Mentor {
  id: string
  name: string
  title: string
  company: string
  image: string
  description: string
  skills: string[]
  experience: string
  rating: number
  reviewCount: number
  pricePerMonth: number
  category: string[]
  isQuickResponder?: boolean
}

interface MentorCardProps {
  mentor: Mentor
  onViewProfile?: (mentorId: string) => void
}

export function MentorCard({ mentor, onViewProfile }: MentorCardProps) {
  const handleViewProfile = () => {
    onViewProfile?.(mentor.id)
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Mentor Image */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200">
              <Image
                src={mentor.image || "/placeholder.svg"}
                alt={mentor.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Mentor Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{mentor.name}</h3>
                  {mentor.isQuickResponder && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      Quick Responder
                    </Badge>
                  )}
                </div>

                <p className="text-gray-600 mb-2">
                  {mentor.title} at {mentor.company}
                </p>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900 ml-1">{mentor.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">({mentor.reviewCount} reviews)</span>
                  <span className="text-sm text-gray-500">• {mentor.experience}</span>
                </div>

                <p className="text-gray-700 text-sm leading-relaxed mb-4">{mentor.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {mentor.skills.slice(0, 4).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {mentor.skills.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{mentor.skills.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Price and Action */}
              <div className="flex flex-col items-end gap-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">LKR {mentor.pricePerMonth}</div>
                  <div className="text-sm text-gray-500">/ month</div>
                </div>
                <Button onClick={handleViewProfile} className="bg-primary hover:bg-primary/90 px-6">
                  View Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
