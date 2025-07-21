"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Bookmark, Briefcase, LucideBookMarked } from "lucide-react"
import { cn } from "@/lib/utils"

// Job type definition
export type Job = {
  _id: string
  company: {
    name: string
    logo?: string
  }
  title: string
  location: string
  salary: {
    min: number
    max: number
    currency: string
  }
  createdAt: string
  isEasyApply?: boolean
}

export function InternshipSidebar() {
  const pathname = usePathname()
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({})
  const [internships, setInternships] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL



  // Fetch internships
  useEffect(() => {
    const fetchInternships = async () => {
        const token = localStorage.getItem('token') || ''
        console.log('Fetching internships with token:', token)
      try {
        const res = await fetch(`${API_BASE_URL}/api/student/internships`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        })
        if (!res.ok) throw new Error('Failed to fetch internships')
        const data = await res.json()
        console.log('Fetched internships:', data)
        setInternships(data)
      } catch (error) {
        console.error('Error fetching internships:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInternships()
  }, [API_BASE_URL])

  // Load saved jobs from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("savedJobs")
    if (saved) {
      setSavedJobs(JSON.parse(saved))
    }
  }, [])

  // Save to localStorage when savedJobs changes
  useEffect(() => {
    localStorage.setItem("savedJobs", JSON.stringify(savedJobs))
  }, [savedJobs])

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }))
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
        {internships.map((job) => {
          const isActive = pathname === `/internship/${job._id}`
          const isSaved = savedJobs[job._id]

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
                  <div className="flex-shrink-0 text-gray-600">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-primary">{job.company.name}</div>
                    <h3 className="font-bold text-lg mt-1">{job.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{job.location}</p>
                    
                    <p className="text-xs text-gray-500 mt-1">
                      LKR{job.salary.min.toLocaleString()} - LKR{job.salary.max.toLocaleString()} {job.salary.currency}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleSaveJob(job._id)
                  }}
                  className="text-gray-500 hover:text-black"
                  aria-label={isSaved ? "Unsave job" : "Save job"}
                >
                  {isSaved ? <LucideBookMarked className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
                </button>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
