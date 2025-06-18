"use client"

import Link from "next/link"
import { Bell, Search, LogOut, User, Settings, Loader2 } from "lucide-react"
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
import { useAuth } from "@/context/AuthContext"

export function Navbar() {
  const { user, isAuthenticated, logout, loading } = useAuth()

  const getUserInitials = () => {
    if (!user || !user.email) return "U"
    const email = user.email
    const nameParts = email.split("@")[0].split(".")
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
    }
    return email.charAt(0).toUpperCase()
  }

  const getRoleColor = () => {
    if (!user) return "bg-gray-500"
    switch (user.role) {
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
    if (!user) return ""
    return user.role.charAt(0).toUpperCase() + user.role.slice(1)
  }

  const getDashboardLink = () => {
    if (!user) return "/"
    switch (user.role) {
      case "admin":
        return "/admin"
      case "mentor":
        return "/mentor"
      case "company":
        return "/company"
      case "student":
        return "/student"
      default:
        return "/"
    }
  }

  // Show loading state
  if (loading) {
    return (
      <header className="border-b sticky top-0 z-50 bg-background">
        <div className="container mx-auto">
          <div className="flex h-16 items-center px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <p className="text-[#535c91] text-2xl">
                Level<span className="text-primary">UP</span>
              </p>
            </Link>
            <div className="flex-1"></div>
            <div className="flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b sticky top-0 z-50 bg-background">
      <div className="container mx-auto">
        <div className="flex h-16 items-center">
          {/* Logo and navigation links */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <p className="text-primary text-2xl">
              Level<span className="text-[#535c91]">UP</span>
            </p>
          </Link>

          {/* Navigation links - show different links based on user role */}
          <nav className="ml-9 md:flex gap-6 flex">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            {/* Show internships link for students and mentors */}
            {(!user || user.role === "student" || user.role === "mentor") && (
              <Link href="/internship" className="text-sm font-medium transition-colors hover:text-primary">
                Internships
              </Link>
            )}
            {/* Show mentorship link for students */}
            {(!user || user.role === "student") && (
              <Link href="/mentorship" className="text-sm font-medium transition-colors hover:text-primary">
                Mentorship
              </Link>
            )}
            {/* Show mock interviews for students */}
            {(!user || user.role === "student") && (
              <Link href="/mock-interviews" className="text-sm font-medium transition-colors hover:text-primary">
                Mock Interviews
              </Link>
            )}
            {/* Show company-specific links */}
            {user && user.role === "company" && (
              <>
                <Link href="/company/jobs" className="text-sm font-medium transition-colors hover:text-primary">
                  Post Jobs
                </Link>
                <Link href="/company/candidates" className="text-sm font-medium transition-colors hover:text-primary">
                  Candidates
                </Link>
              </>
            )}
            {/* Show admin links */}
            {user && user.role === "admin" && (
              <Link href="/admin" className="text-sm font-medium transition-colors hover:text-primary">
                Dashboard
              </Link>
            )}
          </nav>

          {/* Spacer to push the search and profile to the right */}
          <div className="flex-1"></div>

          {/* Conditional rendering based on authentication status */}
          {isAuthenticated && user ? (
            /* Authenticated user - show search, notifications, and profile */
            <div className="flex items-center gap-4">
              {/* Only show search for non-admin users */}
              {user.role !== "admin" && (
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search"
                    className="w-64 rounded-full bg-muted/30 border-0 pl-10 pr-4 h-10 md:w-80"
                  />
                </div>
              )}

              <div className="relative cursor-pointer">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary"></span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src="/placeholder.svg" alt="User avatar" />
                    <AvatarFallback className={getRoleColor()}>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.email ? user.email.split("@")[0] : "User"}</p>
                      {user.email && <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>}
                      <p className="text-xs text-muted-foreground">{getRoleDisplayName()}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      {user.role === "admin" ? "Admin Panel" : "Dashboard"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/student/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            /* Guest user - show Login and Sign Up buttons */
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild className="text-sm font-medium px-8 border border-primary text-primary cursor-pointer bg-white">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="text-sm font-medium bg-primary hover:bg-primary/90 px-9">
                <Link href="/join">Join</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}