"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { User, FileText, Briefcase, Users, Bell, Home } from "lucide-react"

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
}

export function StudentSidebar() {
  const pathname = usePathname()

  const sidebarItems: SidebarItem[] = [
    {
      icon: Home,
      label: "Home",
      href: "/",
    },
    {
      icon: User,
      label: "Basic Information & Security",
      href: "/student/profile",
    },
    {
      icon: FileText,
      label: "Resume & Skills",
      href: "/student/resume",
    },
    {
      icon: Briefcase,
      label: "Applied Internships",
      href: "/student/applications",
    },
    {
      icon: Users,
      label: "Mentor Sessions",
      href: "/student/mentorship",
    },
    {
      icon: Bell,
      label: "Notifications",
      href: "/student/notifications",
    },
  ]

  return (
    <div className="w-70 bg-white border-r border-gray-200 h-[calc(100vh-73px)] sticky top-[73px] overflow-y-auto">
      <div className="p-3">
        <nav className="space-y-2">
          {sidebarItems.map((item, index) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                  isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
