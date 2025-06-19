"use client"

import type React from "react"
import { StudentSidebar } from "@/components/StudentComponents/StudentSidebar"
import { PanelNavbar } from "@/components/common/PanelNavbar"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useState } from "react"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // State to control sidebar drawer
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40">
        <div className="flex items-center justify-between md:hidden bg-white border-b px-4 h-[56px]">
          <button onClick={() => setOpen(true)} className="p-2 rounded-md hover:bg-gray-100">
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
          <span className="font-bold text-lg text-primary">Student Dashboard</span>
          <div />
        </div>
        <div className="hidden md:block">
          <PanelNavbar title="Student Dashboard" userRole="student" />
        </div>
      </div>
      <div className="flex">
        {/* Sidebar: Drawer on mobile, static on desktop */}
        <div className="md:block hidden">
          <StudentSidebar />
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="p-0 w-64 block md:hidden">
            <StudentSidebar />
          </SheetContent>
        </Sheet>
        <div className="flex-1 p-2 sm:p-6">{children}</div>
      </div>
    </div>
  )
}