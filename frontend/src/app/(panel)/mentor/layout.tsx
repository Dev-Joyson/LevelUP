import type React from "react"
import { MentorSidebar } from "@/components/MentorComponents/mentor-sidebar"
import { PanelNavbar } from "@/components/common/PanelNavbar"

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <MentorSidebar />
      <div className="flex-1 flex flex-col">
        {/* Fixed PanelNavbar will show across all mentor routes */}
        <PanelNavbar 
          title="Mentor Dashboard" 
          userRole="mentor" 
          userName="Dr. Sarah Wilson" 
          userEmail="mentor@levelup.com" 
        />
        {/* Content area with proper spacing to account for fixed navbar */}
        <div className="flex-1 bg-[#fdfdfd] overflow-auto">{children}</div>
      </div>
    </div>
  )
}
