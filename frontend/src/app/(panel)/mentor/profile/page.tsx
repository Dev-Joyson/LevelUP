"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Home, Users, CalendarIcon, User, HelpCircle, MessageSquare, ChevronDown, Eye } from "lucide-react"
import { format } from "date-fns"
import type { JSX } from "react/jsx-runtime"

// TypeScript interfaces
interface SidebarItem {
  icon: JSX.Element
  label: string
  href: string
  active?: boolean
}

interface ProfileData {
  fullName: string
  email: string
  phoneNumber: string
  bio: string
  currentRole: string
  company: string
  yearsOfExperience: string
  primaryExpertise: string
  secondaryExpertise: string
  skills: string
  sessionTime: string
  sessionPrice: string
  monthlyPrice: string
  notifications: {
    mentorshipRequests: boolean
    mockInterviews: boolean
    platformUpdates: boolean
  }
}

const sidebarItems: SidebarItem[] = [
  {
    icon: <Home className="h-5 w-5" />,
    label: "Dashboard",
    href: "/mentor/dashboard",
  },
  {
    icon: <Users className="h-5 w-5" />,
    label: "Mentorship",
    href: "/mentor/mentorship",
  },
  {
    icon: <CalendarIcon className="h-5 w-5" />,
    label: "Sessions",
    href: "/mentor/sessions",
  },
  {
    icon: <User className="h-5 w-5" />,
    label: "Profile",
    href: "/mentor/profile",
    active: true,
  },
]

const bottomSidebarItems: SidebarItem[] = [
  {
    icon: <HelpCircle className="h-5 w-5" />,
    label: "Help",
    href: "/help",
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    label: "Feedback",
    href: "/feedback",
  },
]

export default function ProfilePage(): JSX.Element {
  const [availabilityDate, setAvailabilityDate] = useState<Date | null>(null)
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    bio: "",
    currentRole: "",
    company: "",
    yearsOfExperience: "",
    primaryExpertise: "",
    secondaryExpertise: "",
    skills: "",
    sessionTime: "",
    sessionPrice: "",
    monthlyPrice: "",
    notifications: {
      mentorshipRequests: false,
      mockInterviews: false,
      platformUpdates: false,
    },
  })

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNotificationChange = (field: keyof ProfileData["notifications"], checked: boolean) => {
    setProfileData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: checked,
      },
    }))
  }

  const handleUpdate = () => {
    console.log("Profile updated:", profileData)
    // Handle profile update logic here
  }

  const handleAddSkill = () => {
    console.log("Add skill clicked")
    // Handle add skill logic here
  }

  const handleAddSession = () => {
    console.log("Add session clicked")
    // Handle add session logic here
  }

  const handleConnectLinkedIn = () => {
    console.log("Connect LinkedIn clicked")
    // Handle LinkedIn connection logic here
  }

  const handleManagePrivacy = () => {
    console.log("Manage privacy clicked")
    // Handle privacy management logic here
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-100">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-xl text-gray-900">LevelUP</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-1">
          {sidebarItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                item.active ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-100">
          <div className="space-y-1">
            {bottomSidebarItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                {item.icon}
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Profile</h1>

            <div className="space-y-8">
              {/* Personal Details */}
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Details</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        value={profileData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                        Phone Number
                      </Label>
                      <Input
                        id="phoneNumber"
                        value={profileData.phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                        Bio/Introduction
                      </Label>
                      <div className="mt-1">
                        <Label htmlFor="aboutMe" className="text-xs text-gray-500">
                          About Me
                        </Label>
                        <Textarea
                          id="aboutMe"
                          value={profileData.bio}
                          onChange={(e) => handleInputChange("bio", e.target.value)}
                          className="mt-1 min-h-[100px]"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Experience */}
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Professional Experience</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentRole" className="text-sm font-medium text-gray-700">
                        Current Role
                      </Label>
                      <Input
                        id="currentRole"
                        value={profileData.currentRole}
                        onChange={(e) => handleInputChange("currentRole", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company" className="text-sm font-medium text-gray-700">
                        Company
                      </Label>
                      <Input
                        id="company"
                        value={profileData.company}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="yearsOfExperience" className="text-sm font-medium text-gray-700">
                        Years of Experience
                      </Label>
                      <Input
                        id="yearsOfExperience"
                        value={profileData.yearsOfExperience}
                        onChange={(e) => handleInputChange("yearsOfExperience", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Industry/Field of Expertise</Label>
                      <div className="mt-1 space-y-2">
                        <Input
                          placeholder="Primary Expertise"
                          value={profileData.primaryExpertise}
                          onChange={(e) => handleInputChange("primaryExpertise", e.target.value)}
                        />
                        <Input
                          placeholder="Secondary Expertise"
                          value={profileData.secondaryExpertise}
                          onChange={(e) => handleInputChange("secondaryExpertise", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Update Availability */}
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Update Availability</h2>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {availabilityDate ? format(availabilityDate, "PPP") : "Select Date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={availabilityDate || undefined}
                            onSelect={(date) => setAvailabilityDate(date || null)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Time</Label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Date" />
                          <ChevronDown className="h-4 w-4" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning (9:00 AM - 12:00 PM)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (1:00 PM - 5:00 PM)</SelectItem>
                          <SelectItem value="evening">Evening (6:00 PM - 9:00 PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Skills</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="skills" className="text-sm font-medium text-gray-700">
                        Skills
                      </Label>
                      <Textarea
                        id="skills"
                        value={profileData.skills}
                        onChange={(e) => handleInputChange("skills", e.target.value)}
                        className="mt-1 min-h-[100px]"
                      />
                    </div>
                    <Button variant="outline" onClick={handleAddSkill} className="w-full">
                      Add Skill
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Mentorship Session Pricing */}
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Mentorship Session Pricing</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="sessionTime" className="text-sm font-medium text-gray-700">
                        Time (minutes)
                      </Label>
                      <Input
                        id="sessionTime"
                        value={profileData.sessionTime}
                        onChange={(e) => handleInputChange("sessionTime", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sessionPrice" className="text-sm font-medium text-gray-700">
                        Price (LKR)
                      </Label>
                      <Input
                        id="sessionPrice"
                        value={profileData.sessionPrice}
                        onChange={(e) => handleInputChange("sessionPrice", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button variant="outline" onClick={handleAddSession} className="w-full">
                      Add Session
                    </Button>
                    <div className="pt-4">
                      <h3 className="text-md font-medium text-gray-900 mb-4">Monthly Session Price (Optional)</h3>
                      <div>
                        <Label htmlFor="monthlyPrice" className="text-sm font-medium text-gray-700">
                          Monthly Price (LKR)
                        </Label>
                        <Input
                          id="monthlyPrice"
                          value={profileData.monthlyPrice}
                          onChange={(e) => handleInputChange("monthlyPrice", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Preferences */}
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mentorshipRequests"
                        checked={profileData.notifications.mentorshipRequests}
                        onCheckedChange={(checked) =>
                          handleNotificationChange("mentorshipRequests", checked as boolean)
                        }
                      />
                      <Label htmlFor="mentorshipRequests" className="text-sm text-gray-700">
                        Receive email notifications for new mentorship requests
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mockInterviews"
                        checked={profileData.notifications.mockInterviews}
                        onCheckedChange={(checked) => handleNotificationChange("mockInterviews", checked as boolean)}
                      />
                      <Label htmlFor="mockInterviews" className="text-sm text-gray-700">
                        Receive in-app notifications for upcoming mock interviews
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="platformUpdates"
                        checked={profileData.notifications.platformUpdates}
                        onCheckedChange={(checked) => handleNotificationChange("platformUpdates", checked as boolean)}
                      />
                      <Label htmlFor="platformUpdates" className="text-sm text-gray-700">
                        Receive email notifications for platform updates
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Linked Accounts */}
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Linked Accounts</h2>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">in</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">LinkedIn</p>
                        <p className="text-sm text-gray-500">
                          Connect your LinkedIn profile to showcase your professional experience.
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={handleConnectLinkedIn}>
                      Connect
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Privacy Settings</h2>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Eye className="h-6 w-6 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Profile Visibility</p>
                        <p className="text-sm text-gray-500">
                          Control who can view your profile and activity on the platform.
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={handleManagePrivacy}>
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Update Button */}
              <div className="flex justify-center pt-4">
                <Button onClick={handleUpdate} className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white">
                  Update
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
