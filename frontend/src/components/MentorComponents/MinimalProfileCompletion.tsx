"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import axios from "axios"

export function MinimalProfileCompletion() {
  const router = useRouter()
  const { token } = useAuth()
  const [percentage, setPercentage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [missingCount, setMissingCount] = useState(0)

  useEffect(() => {
    fetchProfileCompletion()
  }, [])

  const fetchProfileCompletion = async () => {
    try {
      setLoading(true)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      
      // In a production environment, you'd fetch actual profile data
      // This is a simplified implementation for demo purposes
      const response = await axios.get(`${API_BASE_URL}/api/mentor/session-types`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Calculate a simple completion percentage based on session types
      const hasSessionTypes = response.data?.sessionTypes?.length > 0
      
      // For demo purposes, assuming 40% profile completion
      setPercentage(hasSessionTypes ? 60 : 40)
      setMissingCount(hasSessionTypes ? 3 : 4)
    } catch (error) {
      console.error('Error fetching profile data:', error)
      setPercentage(20)
      setMissingCount(5)
    } finally {
      setLoading(false)
    }
  }

  const getCompletionColor = () => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <Card className="border-l-4 border-gray-300">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-2 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-l-4 border-yellow-400">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium flex items-center">
              <AlertCircle className="h-3.5 w-3.5 mr-1 text-yellow-500" />
              Complete your profile
            </span>
            <span>{percentage}%</span>
          </div>
          
          <Progress value={percentage} className="h-1.5" />
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{missingCount} items missing</span>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => router.push('/mentor/profile')}
            >
              <User className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
