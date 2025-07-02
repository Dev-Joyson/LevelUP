"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { User, FileText, Briefcase, Users, Bell, Home, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
}

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

export function StudentSidebar() {
  const pathname = usePathname()

  const handleLogout = () => {
    // Handle logout logic
    console.log("Logging out...")
  }

  return (
    <div className="w-64 bg-[#ffffff] border-r border-gray-200 h-screen sticky top-0 overflow-y-auto flex-shrink-0 flex flex-col">
      <div className="px-6 flex-1">
        {/* <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-8 rounded bg-gray-900 flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-semibold text-lg text-gray-900">LevelUP</span>
        </div> */}
        <div className="flex pl-3 items-center pt-7 pb-9">

        <Image src="/LogoLevelUP.png" height={60} width={130} alt="" className="h-auto w-[130px]"/>
        </div>
        <nav className="space-y-1">
          {sidebarItems.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${
                  isActive
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm">{item.label}</span>
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
















// "use client"

// import type React from "react"

// import { usePathname } from "next/navigation"
// import Link from "next/link"
// import { User, FileText, Briefcase, Users, Bell, Home } from "lucide-react"

// interface SidebarItem {
//   icon: React.ComponentType<{ className?: string }>
//   label: string
//   href: string
// }

// export function StudentSidebar() {
//   const pathname = usePathname()

//   const sidebarItems: SidebarItem[] = [
//     {
//       icon: Home,
//       label: "Home",
//       href: "/",
//     },
//     {
//       icon: User,
//       label: "Basic Information & Security",
//       href: "/student/profile",
//     },
//     {
//       icon: FileText,
//       label: "Resume & Skills",
//       href: "/student/resume",
//     },
//     {
//       icon: Briefcase,
//       label: "Applied Internships",
//       href: "/student/applications",
//     },
//     {
//       icon: Users,
//       label: "Mentor Sessions",
//       href: "/student/mentorship",
//     },
//     {
//       icon: Bell,
//       label: "Notifications",
//       href: "/student/notifications",
//     },
//   ]

//   return (
//     <div className="w-70 bg-white border-r border-gray-200 h-[calc(100vh-73px)] sticky top-[73px] overflow-y-auto">
//       <div className="p-3">
//         <nav className="space-y-2">
//           {sidebarItems.map((item, index) => {
//             const isActive = pathname === item.href

//             return (
//               <Link
//                 key={index}
//                 href={item.href}
//                 className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
//                   isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//                 }`}
//               >
//                 <item.icon className="h-5 w-5" />
//                 <span className="text-sm font-medium">{item.label}</span>
//               </Link>
//             )
//           })}
//         </nav>
//       </div>
//     </div>
//   )
// }
