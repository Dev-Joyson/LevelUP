"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface BookmarkContextType {
  bookmarkedJobs: Record<string, boolean>
  toggleBookmark: (jobId: string) => Promise<void>
  loadBookmarks: () => Promise<void>
  isLoading: (jobId: string) => boolean
}

const BookmarkContext = createContext<BookmarkContextType | null>(null)

export const useBookmarks = () => {
  const context = useContext(BookmarkContext)
  if (!context) {
    throw new Error('useBookmarks must be used within BookmarkProvider')
  }
  return context
}

interface BookmarkProviderProps {
  children: ReactNode
}

export function BookmarkProvider({ children }: BookmarkProviderProps) {
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Record<string, boolean>>({})
  const [loadingJobs, setLoadingJobs] = useState<Record<string, boolean>>({})
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  // Load bookmarks from API
  const loadBookmarks = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const res = await fetch(`${API_BASE_URL}/api/student/saved-internships`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (res.ok) {
        const savedInternships = await res.json()
        const bookmarksMap = savedInternships.reduce((acc: Record<string, boolean>, internship: any) => {
          acc[internship._id] = true
          return acc
        }, {})
        setBookmarkedJobs(bookmarksMap)
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error)
    }
  }

  // Toggle bookmark status
  const toggleBookmark = async (jobId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No token found')
      }

      // Set loading state
      setLoadingJobs(prev => ({ ...prev, [jobId]: true }))

      const isCurrentlyBookmarked = bookmarkedJobs[jobId]
      const method = isCurrentlyBookmarked ? 'DELETE' : 'POST'
      const endpoint = `${API_BASE_URL}/api/student/bookmark/${jobId}`

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (res.ok) {
        // Update local state immediately for real-time feedback
        setBookmarkedJobs(prev => ({
          ...prev,
          [jobId]: !prev[jobId]
        }))
      } else {
        const errorData = await res.json()
        if (errorData.message === 'Internship already bookmarked') {
          setBookmarkedJobs(prev => ({ ...prev, [jobId]: true }))
        } else {
          throw new Error(errorData.message || 'Failed to toggle bookmark')
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      throw error
    } finally {
      // Clear loading state
      setLoadingJobs(prev => ({ ...prev, [jobId]: false }))
    }
  }

  // Check if a job is currently being processed
  const isLoading = (jobId: string) => {
    return loadingJobs[jobId] || false
  }

  // Load bookmarks on mount
  useEffect(() => {
    loadBookmarks()
  }, [])

  return (
    <BookmarkContext.Provider 
      value={{ 
        bookmarkedJobs, 
        toggleBookmark, 
        loadBookmarks, 
        isLoading 
      }}
    >
      {children}
    </BookmarkContext.Provider>
  )
}