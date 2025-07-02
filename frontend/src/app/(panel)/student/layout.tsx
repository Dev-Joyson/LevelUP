"use client"

import type React from "react"
import { StudentSidebar } from "@/components/StudentComponents/StudentSidebar"
import { PanelNavbar } from "@/components/common/PanelNavbar"
import { StudentProvider } from "@/context/StudentContext"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StudentProvider>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 h-screen">
          <StudentSidebar />
        </div>
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen bg-gray-50">
          {/* Top Navbar */}
          <div className="sticky top-0 z-10 bg-white shadow">
            <PanelNavbar title="Student Dashboard" userRole="student" />
          </div>
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </StudentProvider>
  )
}