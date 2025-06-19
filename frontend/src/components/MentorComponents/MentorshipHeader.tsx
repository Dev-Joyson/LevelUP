"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface MentorshipHeaderProps {
  searchTerm: string
  onSearchChange: (value: string) => void
}

export function MentorshipHeader({ searchTerm, onSearchChange }: MentorshipHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto  py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Find Your Mentor</h1>
            <p className="text-gray-600 mt-1">Connect with experienced professionals to accelerate your career</p>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search for any skill, title or company"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-12 bg-gray-50 border-gray-200"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
