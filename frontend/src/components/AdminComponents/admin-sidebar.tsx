"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Building2, Users, UserCheck, Briefcase, MessageSquare, LayoutDashboard, Home } from "lucide-react"

const navigationItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Students",
    url: "/admin/student",
    icon: Users,
  },
  {
    title: "Companies",
    url: "/admin/company",
    icon: Building2,
  },
  {
    title: "Mentors",
    url: "/admin/mentor",
    icon: UserCheck,
  },
  {
    title: "Jobs",
    url: "/admin/jobs",
    icon: Briefcase,
  },
  {
    title: "Feedback",
    url: "/admin/feedback",
    icon: MessageSquare,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-70 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
      <div className="p-3">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">L</span>
          </div>
          <span className="font-semibold text-lg">LevelUP</span>
        </div>
        <nav className="space-y-2">
          {navigationItems.map((item, index) => {
            const isActive = pathname === item.url
            return (
              <Link
                key={index}
                href={item.url}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                  isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
