"use client"

import Link from "next/link"
import { Bell, Search, LogOut, User, Settings, Loader2, Menu } from "lucide-react"
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
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet"
import Image from "next/image"

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

  if (loading) {
    return (
      <header className="border-b sticky top-0 z-50 bg-background">
        <div className="container mx-auto">
          <div className="flex h-16 items-center px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Image src="/LogoLevelUP.png" height={60} width={130} alt="" className="h-auto w-[130px]"/>
              
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
    <header className="border-b sticky top-0 z-50 bg-background px-4">
      <div className="container mx-auto">
        <div className="flex h-16 items-center relative justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <p className="text-primary text-2xl">
              Level<span className="text-[#535c91]">UP</span>
            </p>
          </Link>

          {/* Hamburger menu for mobile: right-aligned */}
          <div className="flex md:hidden ml-2 absolute right-0 top-1/2 -translate-y-1/2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="p-0"><Menu className="h-6 w-6" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                {/* Profile section at the top of the menu */}
                {isAuthenticated && user && (
                  <div className="flex flex-col items-center gap-2 py-6 border-b">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg" alt="User avatar" />
                      <AvatarFallback className={getRoleColor()}>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-base">{user.email}</span>
                    <span className="text-xs text-gray-500">{getRoleDisplayName()}</span>
                  </div>
                )}
                <nav className="flex flex-col gap-2 p-6">
                  <Link href="/" className="text-base font-medium transition-colors text-gray-600 hover:text-primary">
                    Home
                  </Link>
                  {(!user || user.role === "student" || user.role === "mentor") && (
                    <Link href="/internship" className="text-base font-medium transition-colors hover:text-primary">
                      Internships
                    </Link>
                  )}
                  {(!user || user.role === "student") && (
                    <Link href="/mentorship" className="text-base font-medium transition-colors hover:text-primary">
                      Mentorship
                    </Link>
                  )}
                  {(!user || user.role === "student") && (
                    <Link href="/student/mentorship" className="text-base font-medium transition-colors hover:text-primary">
                      Sessions
                    </Link>
                  )}
                  {/* {(!user || user.role === "student") && (
                    <Link href="/mock-interviews" className="text-base font-medium transition-colors hover:text-primary">
                      Mock Interviews
                    </Link>
                  )} */}
                  {user && user.role === "company" && (
                    <>
                      <Link href="/company/jobs" className="text-base font-medium transition-colors hover:text-primary">
                        Post Jobs
                      </Link>
                      <Link href="/company/candidates" className="text-base font-medium transition-colors hover:text-primary">
                        Candidates
                      </Link>
                    </>
                  )}
                  {user && user.role === "admin" && (
                    <Link href="/admin" className="text-base font-medium transition-colors hover:text-primary">
                      Dashboard
                    </Link>
                  )}
                  <div className="mt-4 border-t pt-4 flex flex-col gap-2">
                    {isAuthenticated && user ? (
                      <>
                        <Link href={getDashboardLink()} className="text-base font-medium flex items-center gap-2 hover:text-primary">
                          <User className="h-4 w-4" />
                          {user.role === "admin" ? "Admin Panel" : "Dashboard"}
                        </Link>
                        <Link href="/student/profile" className="text-base font-medium flex items-center gap-2 hover:text-primary">
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                        <Link href="/settings" className="text-base font-medium flex items-center gap-2 hover:text-primary">
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                        <Button onClick={logout} variant="ghost" className="justify-start text-base font-medium flex items-center gap-2">
                          <LogOut className="h-4 w-4" /> Log out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" asChild className="text-base font-medium border border-primary text-primary cursor-pointer bg-white">
                          <Link href="/login">Login</Link>
                        </Button>
                        <Button asChild className="text-base font-medium bg-primary hover:bg-primary/90">
                          <Link href="/join">Join</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop navigation and profile */}
          <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex gap-6">
            <Link href="/" className=" transition-colors text-gray-600 hover:text-primary">
              Home
            </Link>
            {/* Show internships link for students and mentors */}
            {(!user || user.role === "student" || user.role === "mentor") && (
              <Link href="/internship" className="  text-gray-600 transition-colors hover:text-primary">
                Internships
              </Link>
            )}
            {/* Show mentorship link for students */}
            {(!user || user.role === "student") && (
              <Link href="/mentorship" className="text-gray-600 transition-colors hover:text-primary">
                Mentorship
              </Link>
            )}
            {/* Show sessions link for students */}
            {(!user || user.role === "student") && (
              <Link href="/student/mentorship" className="text-gray-600 transition-colors hover:text-primary">
                Sessions
              </Link>
            )}
            {/* Show mock interviews for students */}
            {/* {(!user || user.role === "student") && (
              <Link href="/mock-interviews" className="text-gray-600 transition-colors hover:text-primary">
                Mock Interviews
              </Link>
            )} */}
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
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                {/* Only show search for non-admin users */}
                {/* {user.role !== "admin" && (
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search"
                      className="w-64 rounded-full bg-muted/30 border-0 pl-10 pr-4 h-10 md:w-80"
                    />
                  </div>
                )} */}

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
              </>
            ) : (
              /* Guest user - show Login and Sign Up buttons */
              <>
                <Button variant="outline" asChild className="text-sm font-medium px-8 border border-primary text-primary cursor-pointer bg-white">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="text-sm font-medium bg-primary hover:bg-primary/90 px-9">
                  <Link href="/join">Join</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}