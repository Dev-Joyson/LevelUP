"use client"

import { Search, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ExploreInternships() {
  return (
    <section className="container py-6 sm:py-8 ">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Explore Internships</h1>
      <p className="text-muted-foreground mt-2 mb-4 sm:mb-6 text-sm sm:text-base">
        Find the perfect internship to kickstart your career. Use the search and filter options below to narrow down
        your choices.
      </p>

      <div className="relative mb-4 sm:mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by keywords (e.g., 'Software Engineering', 'Data Analysis')"
          className="pl-10 h-12"
        />
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3">
        <FilterDropdown label="Domain" options={["Technology", "Finance", "Healthcare", "Marketing", "Design"]} />
        <FilterDropdown label="Skills" options={["JavaScript", "Python", "React", "Data Analysis", "UI/UX"]} />
        <FilterDropdown label="Salary" options={["$0-$20/hr", "$20-$40/hr", "$40-$60/hr", "$60+/hr"]} />
        <FilterDropdown label="Location" options={["Remote", "New York", "San Francisco", "London", "Toronto"]} />
        <FilterDropdown label="Sort By" options={["Most Recent", "Highest Paid", "Best Match", "Company Rating"]} />
      </div>
    </section>
  )
}

interface FilterDropdownProps {
  label: string
  options: string[]
}

function FilterDropdown({ label, options }: FilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm gap-1">
          {label} <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {options.map((option) => (
          <DropdownMenuItem key={option} className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-sm border flex items-center justify-center">
              {/* Uncomment to show selected: <Check className="h-3 w-3" /> */}
            </div>
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
