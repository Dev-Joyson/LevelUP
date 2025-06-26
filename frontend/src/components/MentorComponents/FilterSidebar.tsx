"use client"

import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface FilterOption {
  name: string
  count: number
}

interface FilterSidebarProps {
  mentorCount: number
  categories: FilterOption[]
  companies: FilterOption[]
  selectedCategories: string[]
  selectedCompanies: string[]
  priceRange: number[]
  showFilters: boolean
  onToggleFilters: () => void
  onCategoryChange: (category: string) => void
  onCompanyChange: (company: string) => void
  onPriceRangeChange: (range: number[]) => void
}

export function FilterSidebar({
  mentorCount,
  categories,
  companies,
  selectedCategories,
  selectedCompanies,
  priceRange,
  showFilters,
  onToggleFilters,
  onCategoryChange,
  onCompanyChange,
  onPriceRangeChange,
}: FilterSidebarProps) {
  return (
    <div className="lg:w-80 lg:sticky lg:top-24 lg:self-start">
      <div className="lg:hidden mb-4">
        <Button variant="outline" onClick={onToggleFilters} className="w-full">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      <div
        className={`space-y-6 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto ${showFilters ? "block" : "hidden lg:block"}`}
      >
        {/* Results Count */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{mentorCount}</span> mentors found
          </p>
        </div>

        {/* Categories */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category.name} className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.name)}
                    onChange={() => onCategoryChange(category.name)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                </div>
                <span className="text-xs text-gray-500">{category.count}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
          <div className="space-y-4">
            <Slider value={priceRange} onValueChange={onPriceRangeChange} max={500} step={10} className="w-full" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>LKR {priceRange[0]}</span>
              <span>LKR {priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Companies */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Companies</h3>
          <div className="space-y-2">
            {companies.map((company) => (
              <label key={company.name} className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCompanies.includes(company.name)}
                    onChange={() => onCompanyChange(company.name)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">{company.name}</span>
                </div>
                <span className="text-xs text-gray-500">{company.count}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
