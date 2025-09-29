"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Calendar, 
  Clock, 
  User, 
  Star,
  CheckCircle, 
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { RatingModal } from '@/components/StudentComponents/RatingModal'
import axios from 'axios'

interface Session {
  _id: string
  mentorId: string
  sessionType: string
  mentorName: string
  mentorTitle: string
  mentorImage: string
  date: string
  startTime: string
  duration: number
  status: 'confirmed' | 'completed' | 'cancelled'
  notes: string
  backgroundColor: string
}

interface SessionsData {
  sessions: Session[]
  summary: {
    total: number
    upcoming: number
    past: number
  }
}

export default function StudentSessionsPage() {
  const [sessionsData, setSessionsData] = useState<SessionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed'>('all')
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean
    sessionId: string
    mentorId: string
    mentorName: string
    sessionType: string
  }>({
    isOpen: false,
    sessionId: '',
    mentorId: '',
    mentorName: '',
    sessionType: ''
  })
  
  const { token } = useAuth()

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      setError(null)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      
      const response = await axios.get(`${API_BASE_URL}/api/student/sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data) {
        setSessionsData({
          sessions: response.data.sessions || [],
          summary: response.data.summary || { total: 0, upcoming: 0, past: 0 }
        })
      }
    } catch (error: any) {
      console.error('Error fetching sessions:', error)
      setError(error.response?.data?.message || error.message || 'Failed to load sessions')
      toast.error('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <AlertCircle className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour12 = parseInt(hours) % 12 || 12
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM'
    return `${hour12}:${minutes} ${ampm}`
  }

  const handleRateSession = (session: Session) => {
    setRatingModal({
      isOpen: true,
      sessionId: session._id,
      mentorId: session.mentorId,
      mentorName: session.mentorName,
      sessionType: session.sessionType
    })
  }

  const handleRatingSubmitted = () => {
    // Refresh sessions data after rating is submitted
    fetchSessions()
  }

  const filteredSessions = sessionsData?.sessions.filter(session => {
    if (activeTab === 'upcoming') return session.status === 'confirmed'
    if (activeTab === 'completed') return session.status === 'completed'
    return true
  }) || []

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading sessions...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !sessionsData) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {error || 'Unable to load sessions'}
            </p>
            <Button 
              onClick={fetchSessions}
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
          <h1 className="text-2xl font-bold text-gray-900">My Sessions</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your mentorship sessions</p>
        </div>
        <Button 
          onClick={fetchSessions}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{sessionsData.summary.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{sessionsData.summary.upcoming}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{sessionsData.summary.past}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'all', label: 'All Sessions' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'completed', label: 'Completed' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'upcoming' ? 'No upcoming sessions' :
                 activeTab === 'completed' ? 'No completed sessions' :
                 'No sessions found'}
              </h3>
              <p className="text-gray-500">
                {activeTab === 'upcoming' ? 'Book a session with a mentor to get started' :
                 activeTab === 'completed' ? 'Complete some sessions to see them here' :
                 'Start your mentorship journey by booking your first session'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSessions.map((session) => (
            <Card key={session._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={session.mentorImage} alt={session.mentorName} />
                      <AvatarFallback>
                        {session.mentorName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <h3 className="font-semibold text-gray-900">{session.mentorName}</h3>
                      {session.mentorTitle && (
                        <p className="text-sm text-gray-600">{session.mentorTitle}</p>
                      )}
                      <p className="text-sm font-medium text-gray-800">{session.sessionType}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(session.date)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(session.startTime)} ({session.duration} min)</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(session.status)}>
                      {getStatusIcon(session.status)}
                      <span className="ml-1 capitalize">{session.status}</span>
                    </Badge>
                    
                    {session.status === 'completed' && (
                      <Button
                        onClick={() => handleRateSession(session)}
                        size="sm"
                        variant="outline"
                        className="gap-1"
                      >
                        <Star className="h-4 w-4" />
                        Rate
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal(prev => ({ ...prev, isOpen: false }))}
        mentorId={ratingModal.mentorId}
        mentorName={ratingModal.mentorName}
        sessionId={ratingModal.sessionId}
        sessionType={ratingModal.sessionType}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </div>
  )
}
