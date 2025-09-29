import type React from "react"
import{ InternshipSidebar} from "@/components/InterviewComponents/InternshipSidebar"
import { ExploreInternships, FilterProvider } from "@/components/InterviewComponents/ExploreInternships"
import { BookmarkProvider } from "@/context/BookmarkContext"

export default function InternshipLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <FilterProvider>
      <BookmarkProvider>
        <div className="container mx-auto">
          <ExploreInternships />
          <div className="flex h-screen overflow-hidden">
            <div className="w-full max-w-md border-r bg-white">
              <InternshipSidebar />
            </div>
            <div className="flex-1 overflow-auto bg-gray-50">{children}</div>
          </div>
        </div>
      </BookmarkProvider>
    </FilterProvider>
  )
}
