import type React from "react"
import { AdminSidebar } from "@/components/AdminComponents/admin-sidebar"
import { PanelNavbar } from "@/components/common/PanelNavbar"
import { AdminProvider } from "@/context/AdminContext"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          {/* Fixed PanelNavbar will show across all admin routes */}
          <PanelNavbar title="Admin Dashboard" userRole="admin" userName="Keerththan" userEmail="admin@levelup.com" />
          {/* Content area with proper spacing to account for fixed navbar */}
          <div className="flex-1 bg-[#fdfdfd] overflow-auto">{children}</div>
        </div>
      </div>
    </AdminProvider>
  )
}




// import type React from "react"
// import { SidebarProvider } from "@/components/ui/sidebar"
// import { AdminSidebar } from "@/components/AdminComponents/admin-sidebar"
// import { AdminProvider } from "@/context/AdminContext"

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <AdminProvider>
//       <SidebarProvider>
//         <AdminSidebar />
//         <main className="flex-10 overflow-auto">{children}</main>
//       </SidebarProvider>
//     </AdminProvider>
//   )
// }

