"use client"

import { useState } from "react"
import { MentorCard, type Mentor } from "@/components/MentorComponents/MentorCard"
import { FilterSidebar } from "@/components/MentorComponents/FilterSidebar"
import { MentorshipHeader } from "@/components/MentorComponents/MentorshipHeader"
import { EmptyState } from "@/components/MentorComponents/EmptyState"

const mentors: Mentor[] = [
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
  },
  {
    id: "3",
    name: "Srinidhi Ranganathan",
    title: "Digital Marketing Expert Consultant",
    company: "Freelancer",
    image: "/placeholder.svg?height=120&width=120",
    description:
      "10+ years of experience in AI Digital Marketing. Senior Marketing Lead turned Consultant who has been the Chief Executive Officer and Founder of multiple tech companies.",
    skills: ["Digital Marketing", "Artificial Intelligence", "AI", "Marketing", "Strategy"],
    experience: "10+ years",
    rating: 4.7,
    reviewCount: 156,
    pricePerMonth: 3500,
    category: ["Marketing", "Artificial Intelligence", "Leadership"],
    isQuickResponder: true,
  },
  {
    id: "4",
    name: "Sarah Chen",
    title: "Product Manager",
    company: "Microsoft",
    image: "/placeholder.svg?height=120&width=120",
    description:
      "Senior Product Manager with 7+ years building consumer and enterprise products. I've launched 15+ products and mentored 100+ aspiring PMs.",
    skills: ["Product Management", "Strategy", "Leadership", "Analytics", "User Research"],
    experience: "7+ years",
    rating: 4.9,
    reviewCount: 203,
    pricePerMonth: 6000,
    category: ["Product Management", "Leadership", "Career Growth"],
  },
  {
    id: "5",
    name: "Alex Rodriguez",
    title: "Software Engineering Manager",
    company: "Amazon",
    image: "/placeholder.svg?height=120&width=120",
    description:
      "Engineering Manager with 12+ years in software development. I lead teams of 20+ engineers and have helped 200+ developers advance their careers.",
    skills: ["Software Engineering", "Leadership", "System Design", "Team Management", "Career Growth"],
    experience: "12+ years",
    rating: 4.8,
    reviewCount: 174,
    pricePerMonth: 5500,
    category: ["Leadership", "Career Growth", "Software Engineering"],
  },
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

  return (
    <div className="min-h-screen bg-gray-50">
      <MentorshipHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <div className="max-w-7xl mx-auto  py-8">
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
            <div className="space-y-6">
              {filteredMentors.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} onViewProfile={handleViewProfile} />
              ))}
            </div>

            {filteredMentors.length === 0 && <EmptyState />}
          </div>
        </div>
      </div>
    </div>
  )
}
