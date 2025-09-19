"use client"

import { useState, useEffect } from "react"
import { Bell, Search, LogOut, User, Settings, MessageSquare, Home } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useStudentContextSafe } from "@/context/StudentContext"
import axios from "axios"
import { NotificationDropdown } from "@/components/AdminComponents/notification-dropdown"
import { CompanyNotificationDropdown } from "@/components/CompanyComponents/notification-dropdown"
import { MentorNotificationDropdown } from "@/components/MentorComponents/notification-dropdown"
import { StudentNotificationDropdown } from "@/components/StudentComponents/notification-dropdown"

    
interface PanelNavbarProps {
  title?: string
  userRole?: "student" | "mentor" | "company" | "admin"
  userName?: string
  userEmail?: string
}

export function PanelNavbar({
  title = "Dashboard",
  userRole = "student",
  userName: defaultUserName = "User",
  userEmail: defaultUserEmail = "user@example.com",
}: PanelNavbarProps) {
  const { logout, user, token } = useAuth()
  const { profileData, profileLoading } = useStudentContextSafe()
  const router = useRouter()
  const [userData, setUserData] = useState({
    name: defaultUserName,
    email: defaultUserEmail,
    firstname: "User",
    lastname: ""
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'mentor' && token) {
      fetchMentorData()
    } else if (user?.role === 'student' && profileData && !profileLoading) {
      // Use student data from context
      setUserData({
        name: `${profileData.firstname} ${profileData.lastname}`.trim() || 'Student User',
        email: profileData.email || user?.email || defaultUserEmail,
        firstname: profileData.firstname || 'Student',
        lastname: profileData.lastname || 'User'
      })
      setLoading(false)
    } else if (user?.role === 'student' && !profileLoading) {
      setLoading(false)
    } else if (!user?.role) {
      setLoading(false)
    }
  }, [user, token, profileData, profileLoading])

  const fetchMentorData = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      
      console.log('🔍 Fetching current mentor profile...')
      console.log('🎫 User Context:', user)
      console.log('🔑 Token exists:', !!token)
      console.log('👤 User role:', user?.role)
      
      // Use the new dedicated endpoint for current mentor's complete profile
      const response = await axios.get(`${API_BASE_URL}/api/mentor/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data) {
        const mentor = response.data
        console.log('👤 Mentor Profile Data:', mentor)
        
        setUserData({
          name: mentor.name || 'Mentor User',
          email: mentor.email || user?.email || defaultUserEmail,
          firstname: mentor.firstname || 'Mentor',
          lastname: mentor.lastname || 'User'
        })
        
        console.log('✅ Navbar updated with real mentor data')
      } else {
        throw new Error('No mentor data received')
      }
      
    } catch (error) {
      console.error('❌ Error fetching mentor profile:', error)
      // Fallback to user data from auth context
      const emailName = user?.email?.split('@')[0] || 'User'
      setUserData({
        name: emailName,
        email: user?.email || defaultUserEmail,
        firstname: emailName,
        lastname: ''
      })
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = () => {
    switch (userRole) {
      case "student":
        return "bg-blue-500"
      case "mentor":
        return "bg-green-500"
      case "company":
        return "bg-purple-500"
      case "admin":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRoleDisplayName = () => {
    return userRole.charAt(0).toUpperCase() + userRole.slice(1)
  }

  const getUserInitials = () => {
    return userData.name
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-2 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Search Here" className="pl-10 bg-gray-50 border-0" />
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* User greeting */}
        

        <Button variant="ghost" size="icon">
          <MessageSquare className="h-5 w-5" />
        </Button>

        {userRole === 'admin' ? (
          <NotificationDropdown />
        ) : userRole === 'company' ? (
          <CompanyNotificationDropdown />
        ) : userRole === 'mentor' ? (
          <MentorNotificationDropdown />
        ) : userRole === 'student' ? (
          <StudentNotificationDropdown />
        ) : (
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-4 py-2 h-auto">
            <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            Hi {loading ? "..." : userData.firstname}
          </div>
          <div className="text-xs text-gray-500 font-light">{getRoleDisplayName()}</div>
        </div>
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={user?.role === "student" && profileData?.profileImageUrl ? profileData.profileImageUrl : "/placeholder.svg?height=32&width=32"} 
                />
                <AvatarFallback className={getRoleColor()}>{getUserInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-2 p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={user?.role === "student" && profileData?.profileImageUrl ? profileData.profileImageUrl : "/placeholder.svg"} 
                  alt="User avatar" 
                />
                <AvatarFallback className={getRoleColor()}>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{loading ? "Loading..." : userData.name}</span>
                <span className="text-xs text-gray-500">{userData.email}</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={()=>router.push("/")}>
              <Home className="mr-2 h-4 w-4" />
              Home
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              if (user?.role === 'mentor') {
                router.push('/mentor/profile')
              } else {
                router.push('/profile')
              }
            }}>
              <User className="mr-2 h-4 w-4" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}












// "use client"

// import { Bell, Search, Settings, LogOut, User, ChevronDown } from "lucide-react"
// import { Input } from "@/components/ui/input"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Button } from "@/components/ui/button"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { Badge } from "@/components/ui/badge"
// import Link from "next/link"

// interface PanelNavbarProps {
//   title?: string
//   userRole?: "student" | "mentor" | "company" | "admin"
//   userName?: string
//   userEmail?: string
// }

// export function PanelNavbar({
//   title = "Dashboard",
//   userRole = "student",
//   userName = "Olivia Harper",
//   userEmail = "olivia.harper@email.com",
// }: PanelNavbarProps) {
//   const getRoleColor = () => {
//     switch (userRole) {
//       case "student":
//         return "bg-blue-500"
//       case "mentor":
//         return "bg-green-500"
//       case "company":
//         return "bg-purple-500"
//       case "admin":
//         return "bg-red-500"
//       default:
//         return "bg-gray-500"
//     }
//   }

//   const getRoleDisplayName = () => {
//     return userRole.charAt(0).toUpperCase() + userRole.slice(1)
//   }

//   const getUserInitials = () => {
//     return userName
//       .split(" ")
//       .map((name) => name.charAt(0))
//       .join("")
//       .toUpperCase()
//   }

//   const handleLogout = () => {
//     // Handle logout logic
//     console.log("Logging out...")
//   }

//   return (
//     <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
//       <div className="px-6 py-4">
//         <div className="flex items-center justify-between">
//           {/* Left side - Logo and Title */}
//           <div className="flex items-center">
//             <Link href="/" className="flex items-center justify-center gap-3 hover:opacity-80 transition-opacity">
//               <div className="text-2xl font-bold">
//                 <span className="text-[#535c91]">Level</span>
//                 <span className="text-primary">UP</span>
//               </div>
//               {/* <div className="h-6 w-px bg-gray-300"></div>
//               <h1 className="text-xl font-semibold text-gray-900">{title}</h1> */}
//             </Link>
//           </div>

//           {/* Right side - Search, Notifications, Profile */}
//           <div className="flex items-center gap-4">
//             {/* Home Link */}
//             <Link href="/">
//               <Button variant="ghost" className="text-sm font-medium text-gray-600 hover:text-gray-900">
//                 Home
//               </Button>
//             </Link>

//             {/* Search */}
//             {/* <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <Input
//                 type="search"
//                 placeholder="Search..."
//                 className="w-80 pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white"
//               />
//             </div> */}

//             {/* Notifications */}
//             <div className="relative">
//               <Button variant="ghost" size="icon" className="relative">
//                 <Bell className="h-5 w-5 text-gray-600" />
//                 <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
//                   3
//                 </Badge>
//               </Button>
//             </div>

//             {/* Settings */}
//             {/* <Button variant="ghost" size="icon">
//               <Settings className="h-5 w-5 text-gray-600" />
//             </Button> */}

//             {/* User Profile Dropdown */}
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 h-auto">
//                   <Avatar className="h-8 w-8">
//                     <AvatarImage src="/placeholder.svg" alt="User avatar" />
//                     <AvatarFallback className={getRoleColor()}>{getUserInitials()}</AvatarFallback>
//                   </Avatar>
//                   <div className="flex flex-col items-start">
//                     <span className="text-sm font-medium text-gray-900">{userName}</span>
//                     <span className="text-xs text-gray-500">{getRoleDisplayName()}</span>
//                   </div>
//                   <ChevronDown className="h-4 w-4 text-gray-500" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end" className="w-56">
//                 <div className="flex items-center gap-2 p-2">
//                   <Avatar className="h-8 w-8">
//                     <AvatarImage src="/placeholder.svg" alt="User avatar" />
//                     <AvatarFallback className={getRoleColor()}>{getUserInitials()}</AvatarFallback>
//                   </Avatar>
//                   <div className="flex flex-col">
//                     <span className="text-sm font-medium">{userName}</span>
//                     <span className="text-xs text-gray-500">{userEmail}</span>
//                   </div>
//                 </div>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem>
//                   <User className="mr-2 h-4 w-4" />
//                   Profile Settings
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>
//                   <Settings className="mr-2 h-4 w-4" />
//                   Account Settings
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>
//                   <Bell className="mr-2 h-4 w-4" />
//                   Notifications
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem onClick={handleLogout} className="text-red-600">
//                   <LogOut className="mr-2 h-4 w-4" />
//                   Sign Out
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>
//       </div>
//     </header>
//   )
// }
