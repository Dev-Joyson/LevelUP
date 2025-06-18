import { Search } from "lucide-react"

export function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="text-gray-500 mb-4">
        <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No mentors found</h3>
        <p>Try adjusting your search criteria or filters</p>
      </div>
    </div>
  )
}
