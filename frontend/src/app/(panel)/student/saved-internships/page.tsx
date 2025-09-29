"use client"

import { useState, useEffect } from "react"
import { Search, Loader2, Bookmark, ExternalLink, MapPin, Calendar, DollarSign } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"
import Image from "next/image"
import Link from "next/link"

interface SavedInternship {
  _id: string
  title: string
  company?: {
    name: string
    logo?: string
  }
  companyId?: {
    companyName: string
    logoUrl?: string
  }
  domain: string
  description: string
  location: string
  workMode: string
  salary: {
    min: number
    max: number
    display?: string
  }
  preferredSkills: string[]
  createdAt: string
  applicationDeadline: string
}

export default function SavedInternshipsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [savedInternships, setSavedInternships] = useState<SavedInternship[]>([])
  const [filteredInternships, setFilteredInternships] = useState<SavedInternship[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
  
  // Fetch saved internships
  useEffect(() => {
    const fetchSavedInternships = async () => {
      setIsLoading(true)
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          toast.error('Please log in to view saved internships')
          return
        }

        const res = await fetch(`${API_BASE_URL}/api/student/saved-internships`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })

        if (res.ok) {
          const data = await res.json()
          console.log('Saved internships:', data)
          setSavedInternships(data)
          setFilteredInternships(data)
        } else {
          throw new Error('Failed to fetch saved internships')
        }
      } catch (error) {
        console.error('Error fetching saved internships:', error)
        toast.error('Failed to load saved internships')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSavedInternships()
  }, [API_BASE_URL])

  // Filter internships based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredInternships(savedInternships)
    } else {
      const filtered = savedInternships.filter((internship) =>
        internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (internship.company?.name || internship.companyId?.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredInternships(filtered)
    }
  }, [searchTerm, savedInternships])

  // Remove bookmark
  const removeBookmark = async (internshipId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const res = await fetch(`${API_BASE_URL}/api/student/bookmark/${internshipId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (res.ok) {
        setSavedInternships(prev => prev.filter(internship => internship._id !== internshipId))
        setFilteredInternships(prev => prev.filter(internship => internship._id !== internshipId))
        toast.success('Bookmark removed successfully')
      } else {
        throw new Error('Failed to remove bookmark')
      }
    } catch (error) {
      console.error('Error removing bookmark:', error)
      toast.error('Failed to remove bookmark')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading saved internships...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Saved Internships</h1>
        <p className="text-gray-600">
          Your bookmarked internships for future applications
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search saved internships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Showing {filteredInternships.length} of {savedInternships.length} saved internships
        </p>
      </div>

      {/* Internships Grid */}
      {filteredInternships.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No matching internships found' : 'No saved internships'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Start exploring internships and save them for later'
            }
          </p>
          <Link href="/internship">
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              Explore Internships
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredInternships.map((internship) => (
            <div
              key={internship._id}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200 p-6"
            >
              {/* Company Info */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {(internship.company?.logo || internship.companyId?.logoUrl) ? (
                    <Image
                      src={internship.company?.logo || internship.companyId?.logoUrl || ''}
                      alt="Company Logo"
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {(internship.company?.name || internship.companyId?.companyName || 'C')[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {internship.company?.name || internship.companyId?.companyName || 'Unknown Company'}
                    </h3>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBookmark(internship._id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Bookmark className="h-4 w-4 fill-current" />
                </Button>
              </div>

              {/* Job Title */}
              <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                {internship.title}
              </h4>

              {/* Domain Badge */}
              <div className="mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  {internship.domain}
                </span>
              </div>

              {/* Location and Work Mode */}
              <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{internship.location}</span>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {internship.workMode}
                </span>
              </div>

              {/* Salary */}
              <div className="flex items-center gap-1 mb-3 text-sm text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span>
                  {internship.salary.display || 
                    `LKR ${internship.salary.min?.toLocaleString()} - LKR ${internship.salary.max?.toLocaleString()}`
                  }
                </span>
              </div>

              {/* Description Preview */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {internship.description}
              </p>

              {/* Skills */}
              {internship.preferredSkills && internship.preferredSkills.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {internship.preferredSkills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {internship.preferredSkills.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{internship.preferredSkills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Link href={`/internship/${internship._id}`} className="flex-1">
                  <Button className="w-full">
                    View Details
                  </Button>
                </Link>
              </div>

              {/* Posted Date */}
              <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>Posted {new Date(internship.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}