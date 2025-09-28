"use client"

import { Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"
import { useBookmarks } from "@/context/BookmarkContext"

interface BookmarkButtonProps {
  internshipId: string
}

export default function BookmarkButton({ internshipId }: BookmarkButtonProps) {
  const { bookmarkedJobs, toggleBookmark, isLoading } = useBookmarks()
  
  const isBookmarked = bookmarkedJobs[internshipId] || false
  const loading = isLoading(internshipId)

  const handleToggleBookmark = async () => {
    try {
      await toggleBookmark(internshipId)
      toast.success(isBookmarked ? 'Bookmark removed successfully' : 'Internship bookmarked successfully')
    } catch (error) {
      toast.error('Please log in to bookmark internships')
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleToggleBookmark}
      disabled={loading}
      className={`transition-colors ${
        isBookmarked ? 'text-blue-600 hover:text-blue-700' : 'text-gray-600 hover:text-gray-700'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
      ) : (
        <Bookmark 
          className={`h-7 w-7 ${isBookmarked ? 'fill-current' : ''}`} 
        />
      )}
    </Button>
  )
}