"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  User, 
  MessageSquare, 
  BookOpen,
  LogOut,
  Star,
  ClipboardList
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const navigationItems = [
  {
    title: "Dashboard",
    url: "/mentor/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Mentees",
    url: "/mentor/mentees",
    icon: Users,
  },
  {
    title: "Sessions",
    url: "/mentor/sessions",
    icon: Calendar,
  },
  {
    title: "Reviews",
    url: "/mentor/reviews",
    icon: Star,
  },
  {
    title: "Resources",
    url: "/mentor/resources",
    icon: BookOpen,
  },
  {
    title: "Feedback",
    url: "/mentor/feedback",
    icon: MessageSquare,
  },
  {
    title: "Reports",
    url: "/mentor/reports",
    icon: ClipboardList,
  },
]

export function MentorSidebar() {
  const pathname = usePathname()

  const handleLogout = () => {
    // Handle logout logic
    console.log("Logging out...")
  }

  return (
    <div className="w-64 bg-[#ffffff] border-r border-gray-200 h-screen sticky top-0 overflow-y-auto flex-shrink-0 flex flex-col">
      <div className="px-6 flex-1">
        <div className="flex pl-3 items-center pt-7 pb-9">
          <Image src="/LogoLevelUP.png" height={60} width={130} alt="" className="h-auto w-[130px]"/>
        </div>
        
        <nav className="space-y-1">
          {navigationItems.map((item, index) => {
            const isActive = pathname === item.url
            return (
              <Link
                key={index}
                href={item.url}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${
                  isActive
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm">{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Logout button at bottom */}
      <div className="p-6 border-t border-gray-200">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="cursor-pointer w-full justify-start gap-3 text-gray-600 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm">Logout</span>
        </Button>
      </div>
    </div>
  )
}
