"use client"

import Link from "next/link"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Job } from "@/types/job"

type JobCardProps = {
  job: Job
  isSaved: boolean
  isActive: boolean
  onToggleSave: (jobId: string) => void
}

export default function JobCard({ job, isSaved, isActive, onToggleSave }: JobCardProps) {
  return (
    <Link
      href={`/internship/${job._id}`}
      className={cn(
        "block rounded-lg border p-4 transition-colors hover:bg-muted/50",
        isActive && "bg-muted border-primary",
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-6 h-6">
            <img
              src={job.company?.logo || job.companyId?.logo || "/placeholder.svg"}
              alt={job.company?.name || job.companyId?.name || "Company"}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{job.company?.name || job.companyId?.name || "Unknown Company"}</span>
              <span className="text-sm text-muted-foreground">★</span>
            </div>
            <h3 className="font-semibold mt-1">{job.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{job.location}</p>
            <p className="text-sm mt-1">{job.salary?.display || `${job.salary?.currency || '$'}${job.salary?.min || 0} - ${job.salary?.currency || '$'}${job.salary?.max || 0}`}</p>

            <div className="flex items-center gap-2 mt-2">
              {job.isEasyApply && (
                <span className="inline-flex items-center text-xs text-green-600 gap-1">
                  <span className="w-4 h-4 flex items-center justify-center bg-green-100 rounded-full">
                    <span className="sr-only">Lightning bolt</span>⚡
                  </span>
                  Easy Apply
                </span>
              )}
              <span className="text-xs text-muted-foreground ml-auto">{job.postedDays}d</span>
            </div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onToggleSave(job._id)
          }}
          className="text-muted-foreground hover:text-primary"
          aria-label={isSaved ? "Unsave job" : "Save job"}
        >
          {isSaved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
        </button>
      </div>
    </Link>
  )
}
