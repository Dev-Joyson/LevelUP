"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  User, 
  MessageSquare, 
  BookOpen,
  LogOut,
  Star,
  ClipboardList,
  Bell
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useAuth } from "@/context/AuthContext"
import axios from "axios"

const navigationItems = [
  {
    title: "Dashboard",
    url: "/mentor/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Profile",
    url: "/mentor/profile",
    icon: User,
    showStatusDot: true,
  },
  {
    title: "My Mentees",
    url: "/mentor/mentees",
    icon: Users,
  },
  {
    title: "Schedule Sessions",
    url: "/mentor/schedule",
    icon: Calendar,
  },
  {
    title: "Sessions",
    url: "/mentor/sessions",
    icon: Users,
  },
  {
    title: "Reviews",
    url: "/mentor/reviews",
    icon: Star,
  },
  {
    title: "Feedback",
    url: "/mentor/feedback",
    icon: MessageSquare,
  },
  {
    title: "Notification",
    url: "/mentor/notifications",
    icon: Bell,
  },
]

export function MentorSidebar() {
  const pathname = usePathname()
  const { token, user } = useAuth()
  const [profileCompletion, setProfileCompletion] = useState(0)

  useEffect(() => {
    fetchProfileCompletion()
  }, [])

  const fetchProfileCompletion = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      
      console.log('🎯 Sidebar: Fetching profile completion...')
      console.log('🔑 Token exists:', !!token)
      console.log('👤 User role:', user?.role)
      
      // Only fetch if user is actually a mentor
      if (!user || user.role !== 'mentor') {
        console.log('❌ User is not a mentor, setting default completion')
        setProfileCompletion(50) // Default completion for non-mentors
        return
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/mentor/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data) {
        const mentor = response.data
        
        // Calculate completion based on filled fields
        let score = 0
        const totalFields = 10
        
        if (mentor.name && mentor.name !== 'Mentor User') score++
        if (mentor.title && mentor.title !== 'Mentor') score++
        if (mentor.company && mentor.company !== 'LevelUP') score++
        if (mentor.bio && mentor.bio.length > 50) score++
        if (mentor.location && mentor.location !== 'Remote') score++
        if (mentor.skills && mentor.skills.length > 0) score++
        if (mentor.experience && mentor.experience !== '3+ years') score++
        if (mentor.sessionTypes && mentor.sessionTypes.length > 0) score++
        if (mentor.availability && mentor.availability.length > 0) score++
        if (mentor.certifications && mentor.certifications.length > 0) score++
        
        const completion = Math.round((score / totalFields) * 100)
        setProfileCompletion(completion)
      } else {
        setProfileCompletion(30)
      }
    } catch (error) {
      console.error('Error fetching profile completion:', error)
      setProfileCompletion(30) // Default low completion
    }
  }

  const getStatusColor = () => {
    if (profileCompletion >= 80) return 'bg-green-500'
    if (profileCompletion >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

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
                <div className="relative">
                  <item.icon className="h-5 w-5" />
                  {item.showStatusDot && profileCompletion < 80 && (
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor()}`}></div>
                  )}
                </div>
                <span className="text-sm">{item.title}</span>
                {item.showStatusDot && profileCompletion < 80 && (
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full ml-auto">
                    {profileCompletion}%
                  </span>
                )}
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
