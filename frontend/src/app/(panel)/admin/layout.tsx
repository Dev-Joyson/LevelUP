import type React from "react"
import { SidebarProvider } from "@/app/(panel)/admin/components/ui/sidebar"
import { AdminSidebar } from "@/app/(panel)/admin/components/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <main className="flex-10 ml-20 overflow-auto">{children}</main>
    </SidebarProvider>
  )
}

