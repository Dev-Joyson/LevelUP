"use client"

import { Building2, Users, UserCheck, Briefcase, MessageSquare, LayoutDashboard } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

const navigationItems = [
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
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">L</span>
          </div>
          <span className="font-semibold text-lg">LevelUP</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
