"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  FileQuestion, 
  Clock, 
  TrendingUp, 
  Users, 
  Search, 
  Play,
  CheckCircle,
  BarChart3,
  Star,

  Target,
  MessageSquare,
  XCircle
} from "lucide-react"

interface MockInterview {
  id: string
  title: string
  domain: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  numberOfQuestions: number
  duration: number
  description: string
  tags: string[]
  totalAttempts: number
  averageScore: number
  estimatedScore: {
    min: number
    max: number
  }
  category: 'Technical' | 'Behavioral' | 'Case Study' | 'System Design' | 'Coding'
  icon?: string
  color?: string
}

// const categoryIcons = {
//   'Technical': Brain,
//   'Behavioral': MessageSquare,
//   'Case Study': Target,
//   'System Design': BarChart3,
//   'Coding': FileQuestion
// }

// Note: categoryColors removed since we now use actual images instead of gradients

// Available images for mock interview cards
const cardImages = [
  '/pic1.jpg',
  '/pic2.jpg', 
  '/pic3.jpg',
  '/pic4.jpg',
  '/pic5.jpg'
]

// Function to get shuffled image for each interview card
const getCardImage = (interviewId: string, index: number) => {
  // Option 1: Simple cycling for guaranteed different images (RECOMMENDED)
  return cardImages[index % cardImages.length]
  
  // Option 2: Better hash function for more random distribution
  // let hash = 0
  // for (let i = 0; i < interviewId.length; i++) {
  //   const char = interviewId.charCodeAt(i)
  //   hash = ((hash << 5) - hash) + char + index * 31 // Include index for more variation
  //   hash = hash & hash // Convert to 32bit integer
  // }
  // return cardImages[Math.abs(hash) % cardImages.length]
}

export default function MockInterviewsPage() {
  const [interviews, setInterviews] = useState<MockInterview[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDomain, setSelectedDomain] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [selectedDate, setSelectedDate] = useState<string>("all")
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

  // Load data from API
  useEffect(() => {
    const loadInterviews = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${API_BASE_URL}/student/mock-interviews`, {
          method: 'GET',
          headers: getAuthHeaders()
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch available interviews')
        }
        
        const result = await response.json()

        if (result.interviews) {
          // Transform backend data to match frontend interface
          const transformedInterviews = result.interviews.map((interview: any) => ({
            id: interview.id || interview._id,
            title: interview.title,
            domain: interview.domain,
            difficulty: interview.difficulty,
            numberOfQuestions: interview.numberOfQuestions,
            duration: interview.duration,
            description: interview.description,
            tags: interview.tags || [],
            totalAttempts: interview.totalAttempts || 0,
            averageScore: interview.averageScore || 0,
            estimatedScore: interview.estimatedScore || { min: 0, max: 100 },
            category: getCategoryFromDomain(interview.domain),
          }))
          setInterviews(transformedInterviews)
        }
      } catch (err) {
        console.error('Failed to load data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load interviews')
      } finally {
        setLoading(false)
      }
    }

    loadInterviews()
  }, [])

  const getCategoryFromDomain = (domain: string): string => {
    if (domain.includes('Behavioral') || domain.includes('behavioral')) return 'Behavioral'
    if (domain.includes('System Design') || domain.includes('system')) return 'System Design'
    if (domain.includes('Case Study') || domain.includes('case')) return 'Case Study'
    if (domain.includes('Coding') || domain.includes('Algorithm') || domain.includes('Data Structures')) return 'Coding'
    return 'Technical'
  }

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = interview.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesDomain = !selectedDomain || selectedDomain === 'all' || interview.domain === selectedDomain
    const matchesDifficulty = !selectedDifficulty || selectedDifficulty === 'all' || interview.difficulty === selectedDifficulty
    
    return matchesSearch && matchesDomain && matchesDifficulty
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // const getDifficultyIcon = (difficulty: string) => {
  //   switch (difficulty) {
  //     case 'Easy': return '🟢'
  //     case 'Medium': return '🟡' 
  //     case 'Hard': return '🔴'
  //     default: return '⚪'
  //   }
  // }

  const startInterview = (interview: MockInterview) => {
    // Navigate to interview session
    window.location.href = `/mock-interviews/${interview.id}/interview`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mock Interviews</h1>
              <p className="text-gray-600 mt-1">Practice with AI-generated mock interviews tailored to your career goals.</p>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for any skill, title or company"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 bg-gray-50 border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8">
        {/* Quick Actions */}
        <div className="px-4 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-3">
                <div className="bg-white">
              <Select value={selectedDomain} onValueChange={setSelectedDomain} >
                <SelectTrigger className="w-[160px] h-10">
                  <SelectValue placeholder="All Topics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  <SelectItem value="Web Development">Web Development</SelectItem>
                  <SelectItem value="Data Structures & Algorithms">DSA</SelectItem>
                  <SelectItem value="System Design">System Design</SelectItem>
                  <SelectItem value="Machine Learning">ML</SelectItem>
                </SelectContent>
              </Select>
              </div>

            <div className="bg-white">
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-[140px] h-10">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              </div>

              <div className="bg-white">
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-[120px] h-10">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex">
              <Link 
                href="/mock-interviews/history" 
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
              >
                <Clock className="h-4 w-4" />
                View Interview History
              </Link>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Interview Cards Grid */}
        <div className="px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredInterviews.map((interview, index) => {
              // const CategoryIcon = categoryIcons[interview.category as keyof typeof categoryIcons] || Brain
              const cardImage = getCardImage(interview.id, index)
              
              return (
                <Card key={interview.id} className="border-0 shadow-lg overflow-hidden">
                  {/* Card Header with Image Background */}
                  <div className="h-48 relative overflow-hidden">
                    <Image
                      src={cardImage}
                      alt={`Mock interview for ${interview.title}`}
                      fill
                      className="object-cover"
                      priority={false}
                    />
                    {/* Dark overlay for better text readability */}
                    <div className="absolute inset-0 bg-black/40"></div>
                    {/* Category Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {/* <CategoryIcon className="h-16 w-16 text-white/90 drop-shadow-lg" /> */}
                    </div>
                    {/* Decorative Elements */}
                    {/* <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full backdrop-blur-sm"></div>
                    <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 rounded-full backdrop-blur-sm"></div>
                    <div className="absolute top-1/2 left-8 w-6 h-6 bg-white/15 rounded-full backdrop-blur-sm"></div> */}
                  </div>

                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 line-clamp-2">
                          {interview.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {interview.domain}
                          </Badge>
                          <Badge className={getDifficultyColor(interview.difficulty)}>
                             {interview.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-3">{interview.description}</p>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Interview Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FileQuestion className="h-4 w-4" />
                          <span>{interview.numberOfQuestions} questions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{interview.duration} min</span>
                        </div>
                      </div>


                      {/* Action Button */}
                      <Button
                        onClick={() => startInterview(interview)}
                        className="w-full gap-2 bg-primary hover:bg-primary/90 text-white transition-colors duration-200"
                        size="lg"
                      >
                        <Play className="h-4 w-4" />
                        Start Interview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Empty State */}
          {filteredInterviews.length === 0 && (
            <div className="text-center py-16">
              {/* <Brain className="mx-auto h-16 w-16 text-gray-400 mb-4" /> */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No interviews found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {interviews.length === 0 
                  ? "No mock interviews are available at the moment. Please check back later."
                  : "Try adjusting your search or filter criteria to find more interviews."
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
