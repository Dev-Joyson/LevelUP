"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Bookmark, Briefcase, LucideBookMarked } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Job } from "@/types/job"
import { useFilters, useInternships } from "./ExploreInternships"
import { useBookmarks } from "@/context/BookmarkContext"
import { toast } from "react-toastify"

export function InternshipSidebar() {
  const pathname = usePathname()
  const { filters, viewMode } = useFilters()
  const { internships, suggestedInternships, loading } = useInternships()
  const { bookmarkedJobs, toggleBookmark, isLoading } = useBookmarks()

  // Choose the appropriate internships based on view mode
  const getCurrentInternships = () => {
    if (viewMode === 'forYou') {
      return suggestedInternships
    }
    return internships
  }

  // Filter and sort internships based on current filters (only for search mode)
  const getFilteredAndSortedInternships = (jobs: Job[]) => {
    // If we're in "For You" mode, don't apply filters as they're already personalized
    if (viewMode === 'forYou') {
      return jobs
    }

    let filtered = [...jobs]

    // Apply search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm) ||
        job.domain?.toLowerCase().includes(searchTerm) ||
        (job.company?.name || job.companyId?.companyName || '').toLowerCase().includes(searchTerm) ||
        job.preferredSkills?.some(skill => skill.toLowerCase().includes(searchTerm))
      )
    }

    // Apply domain filter
    if (filters.domain.length > 0) {
      filtered = filtered.filter(job => 
        filters.domain.some(domain => 
          job.domain?.toLowerCase().includes(domain.toLowerCase())
        )
      )
    }

    // Apply skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter(job => 
        filters.skills.some(skill => 
          job.preferredSkills?.some(jobSkill => 
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      )
    }

    // Apply salary range filter
    if (filters.salaryRange.length > 0) {
      filtered = filtered.filter(job => {
        const jobMaxSalary = job.salary.max
        return filters.salaryRange.some(range => {
          switch(range) {
            case "LKR 0-25,000":
              return jobMaxSalary <= 25000
            case "LKR 25,000-50,000":
              return jobMaxSalary > 25000 && jobMaxSalary <= 50000
            case "LKR 50,000-75,000":
              return jobMaxSalary > 50000 && jobMaxSalary <= 75000
            case "LKR 75,000-100,000":
              return jobMaxSalary > 75000 && jobMaxSalary <= 100000
            case "LKR 100,000+":
              return jobMaxSalary > 100000
            default:
              return true
          }
        })
      })
    }

    // Apply location filter
    if (filters.location.length > 0) {
      filtered = filtered.filter(job => 
        filters.location.some(location => 
          location === "Remote" 
            ? job.workMode === "remote" || job.location.toLowerCase().includes("remote")
            : job.location.toLowerCase().includes(location.toLowerCase())
        )
      )
    }

    // Apply work mode filter
    if (filters.workMode.length > 0) {
      filtered = filtered.filter(job => 
        filters.workMode.some(mode => 
          job.workMode.toLowerCase() === mode.toLowerCase()
        )
      )
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "Most Recent":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "Highest Paid":
        filtered.sort((a, b) => b.salary.max - a.salary.max)
        break
      case "Lowest Paid":
        filtered.sort((a, b) => a.salary.max - b.salary.max)
        break
      case "Title A-Z":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "Title Z-A":
        filtered.sort((a, b) => b.title.localeCompare(a.title))
        break
      case "Best Match":
        // For best match, we could implement a scoring system based on matching criteria
        // For now, just sort by most recent
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      default:
        break
    }

    return filtered
  }

  const currentInternships = getCurrentInternships()
  const filteredInternships = getFilteredAndSortedInternships(currentInternships)

  const handleToggleBookmark = async (jobId: string) => {
    try {
      const wasBookmarked = bookmarkedJobs[jobId] || false
      await toggleBookmark(jobId)
      
      // Show toast notification
      if (wasBookmarked) {
        toast.success('Bookmark removed successfully')
      } else {
        toast.success('Internship bookmarked successfully')
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      toast.error('Please log in to bookmark internships')
    }
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-auto sidebar-scrollbar">
      <div className="space-y-4 pr-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <h3 className="font-medium text-lg mb-2">
              {viewMode === 'forYou' ? 'Finding personalized recommendations...' : 'Loading internships...'}
            </h3>
            <p className="text-sm text-gray-500">Please wait while we fetch the latest opportunities</p>
          </div>
        ) : filteredInternships.length === 0 && currentInternships.length > 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Briefcase className="h-12 w-12" />
            </div>
            <h3 className="font-medium text-lg mb-2">No internships found</h3>
            <p className="text-sm text-gray-500 mb-4">Try adjusting your search criteria or filters</p>
          </div>
        ) : filteredInternships.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Briefcase className="h-12 w-12" />
            </div>
            <h3 className="font-medium text-lg mb-2">
              {viewMode === 'forYou' ? 'No recommendations available' : 'No internships available'}
            </h3>
            <p className="text-sm text-gray-500">
              {viewMode === 'forYou' 
                ? 'Please upload your resume to get personalized recommendations'
                : 'Check back later for new opportunities'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="px-4 py-2 text-sm text-gray-600 border-b">
              {filteredInternships.length} 
              {viewMode === 'forYou' ? ' recommended internship' : ' internship'}
              {filteredInternships.length !== 1 ? 's' : ''} found
            </div>
            {filteredInternships.map((job) => {
              const isActive = pathname === `/internship/${job._id}`
              const isSaved = bookmarkedJobs[job._id] || false
              const isBookmarkingInProgress = isLoading(job._id)
              const matchScore = viewMode === 'forYou' ? job.matchScore?.total : null

              return (
                <Link
                  href={`/internship/${job._id}`}
                  key={job._id}
                  className={cn(
                    "block rounded-lg p-4 transition-colors hover:border-1 hover:border-primary",
                    isActive && "bg-[#e6e9f1]/50 border-1 border-primary",
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 justify-center">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                        {(job.company?.logo || job.companyId?.logoUrl) ? (
                          <img 
                            src={job.company?.logo || job.companyId?.logoUrl} 
                            alt={`${job.company?.name || job.companyId?.companyName || 'Company'} logo`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-primary">{job.company?.name || job.companyId?.companyName || 'Unknown Company'}</div>
                        <h3 className="font-bold text-lg mt-1">{job.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{job.location}</p>
                        
                        <p className="text-xs text-gray-500 mt-1">
                          {job.salary.display 
                            ? (job.salary.display.startsWith('LKR') ? job.salary.display : `LKR ${job.salary.display}`)
                            : `LKR ${job.salary.min.toLocaleString()} - LKR ${job.salary.max.toLocaleString()}`
                          }
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Posted {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                        
                        {/* Show work mode and domain */}
                        <div className="flex gap-2 mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            {job.workMode}
                          </span>
                          {job.domain && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              {job.domain}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleToggleBookmark(job._id)
                      }}
                      disabled={isBookmarkingInProgress}
                      className={`text-gray-500 hover:text-black transition-colors ${isBookmarkingInProgress ? 'opacity-50 cursor-not-allowed' : ''} flex-shrink-0 ml-2`}
                      aria-label={isSaved ? "Unsave job" : "Save job"}
                    >
                      {isBookmarkingInProgress ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                      ) : isSaved ? (
                        <LucideBookMarked className="h-5 w-5 text-primary" />
                      ) : (
                        <Bookmark className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </Link>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
