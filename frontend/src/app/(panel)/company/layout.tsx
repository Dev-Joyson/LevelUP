import type React from "react"
import { CompanySidebar } from "@/components/CompanyComponents/company-sidebar"
import { PanelNavbar } from "@/components/common/PanelNavbar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    
      <div className="flex min-h-screen">
        <CompanySidebar />
        <div className="flex-1 flex flex-col">
          {/* Fixed PanelNavbar will show across all admin routes */}
          <PanelNavbar title="Company Dashboard" userRole="company" />
          {/* Content area with proper spacing to account for fixed navbar */}
          <div className="flex-1 bg-[#fdfdfd] overflow-auto">{children}</div>
        </div>
      </div>
   
  )
}
