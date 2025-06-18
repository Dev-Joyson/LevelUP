import type React from "react"
import { StudentSidebar } from "@/components/StudentComponents/StudentSidebar"
import { PanelNavbar } from "@/components/common/PanelNavbar"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PanelNavbar title="Student Dashboard" userRole="student" />
      <div className="flex">
        <StudentSidebar />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}