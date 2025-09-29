"use client"

import { useState, createContext, useContext, useEffect } from "react"
import { Search, ChevronDown, Check, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Filter types
export interface FilterState {
  searchTerm: string
  domain: string[]
  skills: string[]
  salaryRange: string[]
  location: string[]
  workMode: string[]
  sortBy: string
}

// Context for sharing filter state and view mode
const FilterContext = createContext<{
  filters: FilterState
  setFilters: (filters: FilterState) => void
  internships: any[]
  setInternships: (internships: any[]) => void
  viewMode: 'forYou' | 'search'
  setViewMode: (mode: 'forYou' | 'search') => void
  suggestedInternships: any[]
  setSuggestedInternships: (internships: any[]) => void
  loading: boolean
  setLoading: (loading: boolean) => void
} | null>(null)

export const useFilters = () => {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilters must be used within FilterProvider')
  }
  return context
}

export const useInternships = () => {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useInternships must be used within FilterProvider')
  }
  return { 
    internships: context.internships, 
    setInternships: context.setInternships,
    suggestedInternships: context.suggestedInternships,
    setSuggestedInternships: context.setSuggestedInternships,
    viewMode: context.viewMode,
    loading: context.loading
  }
}

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    domain: [],
    skills: [],
    salaryRange: [],
    location: [],
    workMode: [],
    sortBy: 'Most Recent'
  })

  const [internships, setInternships] = useState<any[]>([])
  const [suggestedInternships, setSuggestedInternships] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<'forYou' | 'search'>('search')
  const [loading, setLoading] = useState(false)

  // Fetch regular internships for search mode
  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token') || ''
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
        
        const res = await fetch(`${API_BASE_URL}/api/student/internships`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        })
        
        if (!res.ok) throw new Error('Failed to fetch internships')
        
        const data = await res.json()
        console.log('Fetched internships for filters:', data)
        setInternships(data)
      } catch (error) {
        console.error('Error fetching internships for filters:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInternships()
  }, [])

  // Fetch suggested internships when switching to "For You" mode
  useEffect(() => {
    if (viewMode === 'forYou') {
      const fetchSuggestedInternships = async () => {
        try {
          setLoading(true)
          const token = localStorage.getItem('token') || ''
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
          
          const res = await fetch(`${API_BASE_URL}/api/student/suggested-internships`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          })
          
          if (!res.ok) {
            throw new Error('Failed to fetch suggested internships')
          }
          
          const response = await res.json()
          console.log('Fetched suggested internships:', response)
          setSuggestedInternships(response.data || [])
        } catch (error) {
          console.error('Error fetching suggested internships:', error)
          setSuggestedInternships([])
        } finally {
          setLoading(false)
        }
      }

      fetchSuggestedInternships()
    }
  }, [viewMode])

  return (
    <FilterContext.Provider value={{ 
      filters, 
      setFilters, 
      internships, 
      setInternships,
      viewMode,
      setViewMode,
      suggestedInternships,
      setSuggestedInternships,
      loading,
      setLoading
    }}>
      {children}
    </FilterContext.Provider>
  )
}

export function ExploreInternships() {
  const { filters, setFilters, internships, viewMode, setViewMode } = useFilters()

  // Get unique domains from internships
  const getUniqueDomains = () => {
    const domains = internships
      .map((job: any) => job.domain)
      .filter((domain: string) => domain && domain.trim() !== '')
      .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index)
      .sort()
    return domains
  }

  // Get unique skills from internships
  const getUniqueSkills = () => {
    const allSkills = internships
      .flatMap((job: any) => job.preferredSkills || [])
      .filter((skill: string) => skill && skill.trim() !== '')
      .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index)
      .sort()
    return allSkills
  }

  // Get unique locations from internships
  const getUniqueLocations = () => {
    const locations = internships
      .map((job: any) => job.location)
      .filter((location: string) => location && location.trim() !== '')
      .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index)
      .sort()
    
    // Add "Remote" option if any job has remote work mode
    const hasRemoteJobs = internships.some((job: any) => 
      job.workMode === 'remote' || 
      job.location?.toLowerCase().includes('remote')
    )
    
    if (hasRemoteJobs && !locations.includes('Remote')) {
      locations.unshift('Remote')
    }
    
    return locations
  }

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, searchTerm: value })
  }

  const handleFilterChange = (filterType: keyof Omit<FilterState, 'searchTerm' | 'sortBy'>, value: string) => {
    const currentValues = filters[filterType] as string[]
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    
    setFilters({ ...filters, [filterType]: newValues })
  }

  const handleSortChange = (value: string) => {
    setFilters({ ...filters, sortBy: value })
  }

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      domain: [],
      skills: [],
      salaryRange: [],
      location: [],
      workMode: [],
      sortBy: 'Most Recent'
    })
  }

  const hasActiveFilters = filters.searchTerm || 
    filters.domain.length > 0 || 
    filters.skills.length > 0 || 
    filters.salaryRange.length > 0 || 
    filters.location.length > 0 || 
    filters.workMode.length > 0

  return (
    <section className="container py-6 sm:py-8 ">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Explore Internships</h1>
      <p className="text-muted-foreground mt-2 mb-4 sm:mb-6 text-sm sm:text-base">
        {viewMode === 'forYou' 
          ? "Discover internships tailored to your skills and experience based on your resume."
          : "Find the perfect internship to kickstart your career. Use the search and filter options below to narrow down your choices."
        }
      </p>

      {/* Toggle Buttons */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={viewMode === 'forYou' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('forYou')}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
              viewMode === 'forYou' 
                ? 'bg-white text-black shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <Star className="h-4 w-4" />
            For You
          </Button>
          <Button
            variant={viewMode === 'search' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('search')}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
              viewMode === 'search' 
                ? 'bg-white text-black shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
      </div>

      {/* Search and Filters - Only show in Search mode */}
      {viewMode === 'search' && (
        <>
          <div className="relative mb-4 sm:mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by keywords (e.g., 'Software Engineering', 'Data Analysis')"
              className="pl-10 h-12"
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
            <FilterDropdown 
              label="Domain" 
              options={getUniqueDomains()} 
              selectedValues={filters.domain}
              onSelectionChange={(value) => handleFilterChange('domain', value)}
            />
            <FilterDropdown 
              label="Skills" 
              options={getUniqueSkills()} 
              selectedValues={filters.skills}
              onSelectionChange={(value) => handleFilterChange('skills', value)}
            />
            <FilterDropdown 
              label="Salary Range" 
              options={["LKR 0-25,000", "LKR 25,000-50,000", "LKR 50,000-75,000", "LKR 75,000-100,000", "LKR 100,000+"]} 
              selectedValues={filters.salaryRange}
              onSelectionChange={(value) => handleFilterChange('salaryRange', value)}
            />
            <FilterDropdown 
              label="Location" 
              options={getUniqueLocations()} 
              selectedValues={filters.location}
              onSelectionChange={(value) => handleFilterChange('location', value)}
            />
            <FilterDropdown 
              label="Work Mode" 
              options={["Remote", "Onsite", "Hybrid"]} 
              selectedValues={filters.workMode}
              onSelectionChange={(value) => handleFilterChange('workMode', value)}
            />
            <SortDropdown 
              selectedValue={filters.sortBy}
              onSelectionChange={handleSortChange}
            />
            
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
                className="h-9 sm:h-10 text-xs sm:text-sm text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                Clear All
              </Button>
            )}
          </div>
        </>
      )}
    </section>
  )
}

interface FilterDropdownProps {
  label: string
  options: string[]
  selectedValues: string[]
  onSelectionChange: (value: string) => void
}

function FilterDropdown({ label, options, selectedValues, onSelectionChange }: FilterDropdownProps) {
  const hasSelections = selectedValues.length > 0
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "h-9 sm:h-10 text-xs sm:text-sm gap-1",
            hasSelections && "border-primary bg-primary/5 text-primary"
          )}
        >
          {label}
          {hasSelections && (
            <span className="ml-1 rounded-full bg-primary text-primary-foreground px-1.5 py-0.5 text-xs">
              {selectedValues.length}
            </span>
          )}
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 max-h-64 overflow-y-auto">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option)
          return (
            <DropdownMenuItem 
              key={option} 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => onSelectionChange(option)}
            >
              <div className={cn(
                "h-4 w-4 rounded-sm border flex items-center justify-center",
                isSelected && "bg-primary border-primary"
              )}>
                {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
              </div>
              {option}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface SortDropdownProps {
  selectedValue: string
  onSelectionChange: (value: string) => void
}

function SortDropdown({ selectedValue, onSelectionChange }: SortDropdownProps) {
  const sortOptions = ["Most Recent", "Highest Paid", "Lowest Paid", "Best Match", "Title A-Z", "Title Z-A"]
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm gap-1">
          Sort: {selectedValue} <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {sortOptions.map((option) => (
          <DropdownMenuItem 
            key={option} 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onSelectionChange(option)}
          >
            <div className={cn(
              "h-4 w-4 rounded-full border flex items-center justify-center",
              selectedValue === option && "bg-primary border-primary"
            )}>
              {selectedValue === option && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
            </div>
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
