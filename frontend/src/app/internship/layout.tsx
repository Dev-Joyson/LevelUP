import type React from "react"
import{ InternshipSidebar} from "@/components/InterviewComponents/InternshipSidebar"
import { ExploreInternships, FilterProvider } from "@/components/InterviewComponents/ExploreInternships"

export default function InternshipLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <FilterProvider>
      <div className="container mx-auto">
        <ExploreInternships />
        <div className="flex h-screen overflow-hidden">
          <div className="w-full max-w-md border-r">
            <InternshipSidebar />
          </div>
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </div>
    </FilterProvider>
  )
}
