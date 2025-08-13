"use client"

import { useState, useEffect } from "react"
import { MentorCard, type Mentor } from "@/components/MentorComponents/MentorCard"
import { FilterSidebar } from "@/components/MentorComponents/FilterSidebar"
import { MentorshipHeader } from "@/components/MentorComponents/MentorshipHeader"
import { EmptyState } from "@/components/MentorComponents/EmptyState"
import axios from "axios"
import { toast } from "sonner"

// Fallback mentors data in case API fails
const fallbackMentors: Mentor[] = [
  {
    id: "1",
    name: "Tracy Pham",
    title: "AI/ML Engineer",
    company: "Netflix",
    image: "/placeholder.svg?height=120&width=120",
    description:
      "Hi! I'm Tracy, an AI/ML Engineer with 8+ years of experience working with machine learning models and deep learning frameworks. I've helped 50+ mentees transition into tech roles.",
    skills: ["Natural Language Processing", "Deep Learning", "Machine Learning", "NLP"],
    experience: "8+ years",
    rating: 4.9,
    reviewCount: 127,
    pricePerMonth: 5000,
    category: ["Artificial Intelligence", "Machine Learning", "Data Science"],
    isQuickResponder: true,
  },
  {
    id: "2",
    name: "Cornelius Yudha Wijaya",
    title: "Data Scientist",
    company: "Google",
    image: "/placeholder.svg?height=120&width=120",
    description:
      "Oh, Hi.. and Hi Everyone! I am a Data Scientist and AI Engineer with 10+ years of experience working data science and machine learning to transform the client high-level business problems.",
    skills: ["Python", "Machine Learning", "Data Science", "SQL", "Strategy", "Deep Learning"],
    experience: "10+ years",
    rating: 4.8,
    reviewCount: 89,
    pricePerMonth: 3500,
    category: ["Data Science", "Machine Learning", "Leadership"],
  }
]

const categories = [
  { name: "Artificial Intelligence", count: 10 },
  { name: "Machine Learning", count: 8 },
  { name: "Data Science", count: 7 },
  { name: "Leadership", count: 6 },
  { name: "Product Management", count: 5 },
  { name: "Career Growth", count: 4 },
  { name: "Marketing", count: 3 },
  { name: "Software Engineering", count: 2 },
]

const companies = [
  { name: "Google", count: 8 },
  { name: "Amazon", count: 6 },
  { name: "Microsoft", count: 5 },
  { name: "Meta", count: 4 },
  { name: "Netflix", count: 3 },
  { name: "Apple", count: 2 },
]

export default function MentorshipPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [showFilters, setShowFilters] = useState(false)
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  
  // Fetch mentors from the API
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true)
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
        const response = await axios.get(`${API_BASE_URL}/api/mentor/public`)
        
        if (response.data && response.data.mentors && response.data.mentors.length > 0) {
          setMentors(response.data.mentors)
        } else {
          // If no mentors returned, use fallback data
          setMentors(fallbackMentors)
          toast.warning("Using demo mentor data as no mentors were found.")
        }
      } catch (error) {
        console.error("Error fetching mentors:", error)
        setMentors(fallbackMentors)
        setError(true)
        toast.error("Failed to fetch mentors. Using demo data instead.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchMentors()
  }, [])

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.some((cat) => mentor.category.includes(cat))

    const matchesCompany = selectedCompanies.length === 0 || selectedCompanies.includes(mentor.company)

    const matchesPrice = mentor.pricePerMonth >= priceRange[0] && mentor.pricePerMonth <= priceRange[1]

    return matchesSearch && matchesCategory && matchesCompany && matchesPrice
  })

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const toggleCompany = (company: string) => {
    setSelectedCompanies((prev) => (prev.includes(company) ? prev.filter((c) => c !== company) : [...prev, company]))
  }

  const handleViewProfile = (mentorId: string) => {
    console.log("Viewing profile for mentor:", mentorId)
    // Navigation is now handled directly in the MentorCard component
  }

  // Generate categories and companies dynamically from fetched mentors
  useEffect(() => {
    if (mentors.length > 0) {
      // Extract unique categories and count occurrences
      const categoryMap = new Map<string, number>()
      mentors.forEach(mentor => {
        mentor.category.forEach(cat => {
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
        })
      })
      
      // Extract unique companies and count occurrences
      const companyMap = new Map<string, number>()
      mentors.forEach(mentor => {
        companyMap.set(mentor.company, (companyMap.get(mentor.company) || 0) + 1)
      })
    }
  }, [mentors])

  return (
    <div className="min-h-screen bg-gray-50">
      <MentorshipHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <div className="max-w-7xl mx-auto py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <FilterSidebar
              mentorCount={filteredMentors.length}
              categories={categories}
              companies={companies}
              selectedCategories={selectedCategories}
              selectedCompanies={selectedCompanies}
              priceRange={priceRange}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              onCategoryChange={toggleCategory}
              onCompanyChange={toggleCompany}
              onPriceRangeChange={setPriceRange}
            />

            {/* Mentor Cards */}
            <div className="flex-1">
              {error && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <p className="text-yellow-700">
                    We encountered an issue loading mentor data. Showing demo data instead.
                  </p>
                </div>
              )}
              
              <div className="space-y-6">
                {filteredMentors.map((mentor) => (
                  <MentorCard key={mentor.id} mentor={mentor} onViewProfile={handleViewProfile} />
                ))}
              </div>

              {filteredMentors.length === 0 && <EmptyState />}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
