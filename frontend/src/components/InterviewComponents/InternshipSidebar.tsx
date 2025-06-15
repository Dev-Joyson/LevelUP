"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Bookmark, BookmarkCheck, BookMarked, BookMarkedIcon, BookmarkIcon, BookmarkX, Briefcase, LucideBookmark, LucideBookMarked } from "lucide-react"
import { cn } from "@/lib/utils"

// Job type definition
export type Job = {
  id: string
  company: {
    name: string
    logo?: string
  }
  title: string
  location: string
  salary: string
  postedDays?: number
  isEasyApply?: boolean
}

// Sample job data updated to match the image
const jobListings: Job[] = [
  {
    id: "virtusa-mlops",
    company: {
      name: "Virtusa",
    },
    title: "MLOps Engineer",
    location: "Colombo, Srilanka",
    salary: "30,000 LKR - 50,0000 LKR",
  },
  {
    id: "softsora-it",
    company: {
      name: "Softsora",
    },
    title: "IT Engineer",
    location: "Colombo, Srilanka",
    salary: "30,000 LKR - 50,0000 LKR",
  },
  {
    id: "coginitix-python",
    company: {
      name: "Coginitix",
    },
    title: "Python Developer",
    location: "Colombo, Srilanka",
    salary: "30,000 LKR - 50,0000 LKR",
  },
  {
    id: "rootcode-ai",
    company: {
      name: "rootCode",
    },
    title: "AI/ML Engineer",
    location: "Colombo, Srilanka",
    salary: "30,000 LKR - 50,0000 LKR",
  },
  {
    id: "virtusa-mlops1",
    company: {
      name: "Virtusa",
    },
    title: "MLOps Engineer",
    location: "Colombo, Srilanka",
    salary: "30,000 LKR - 50,0000 LKR",
  },
  {
    id: "softsora-it1",
    company: {
      name: "Softsora",
    },
    title: "IT Engineer",
    location: "Colombo, Srilanka",
    salary: "30,000 LKR - 50,0000 LKR",
  },
  {
    id: "coginitix-python1",
    company: {
      name: "Coginitix",
    },
    title: "Python Developer",
    location: "Colombo, Srilanka",
    salary: "30,000 LKR - 50,0000 LKR",
  },
  {
    id: "rootcode-ai1",
    company: {
      name: "rootCode",
    },
    title: "AI/ML Engineer",
    location: "Colombo, Srilanka",
    salary: "30,000 LKR - 50,0000 LKR",
  },
]

export function InternshipSidebar() {
  const pathname = usePathname()
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({})

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

  return (
    <div className="w-full h-full overflow-auto sidebar-scrollbar">
      <div className="space-y-4 pr-4">
        {jobListings.map((job) => {
          const isActive = pathname === `/internship/${job.id}`
          const isSaved = savedJobs[job.id]

          return (
            <Link
              href={`/internship/${job.id}`}
              key={job.id}
              className={cn(
                "block rounded-lg bg-gray-50 p-4 transition-colors hover:border-1 hover:border-primary",
                isActive && "bg-[#e6e9f1] border-1 border-primary",
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
                    <p className="text-xs text-gray-500 mt-1">{job.salary}</p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleSaveJob(job.id)
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
