"use client"

import { useState } from "react"
import Image from "next/image"
import { Shield, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface FormData {
  fullName: string
  email: string
  phoneNumber: string
}

export default function StudentProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    fullName: "Olivia Harper",
    email: "olivia.harper@email.com",
    phoneNumber: "+1 (555) 123-4567",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleUpdateProfile = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Updating profile:", formData)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = () => {
    console.log("Opening password change modal")
  }

  const handleAvatarChange = () => {
    console.log("Opening avatar upload")
  }

  return (
    <div className="p-8">
      <div className=" mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4 group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
              <Image
                src="/placeholder.svg?height=128&width=128"
                alt="Profile picture"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="absolute bottom-2 right-2 rounded-full w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleAvatarChange}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{formData.fullName}</h2>
          <p className="text-gray-600">{formData.email}</p>
        </div>

        {/* Personal Information Form */}
        <Card>
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>

            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 mb-2 block">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  disabled={!isEditing}
                  className="h-12 bg-gray-50 border-gray-200 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!isEditing}
                  className="h-12 bg-gray-50 border-gray-200 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              {/* Phone Number */}
              <div>
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 mb-2 block">
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  disabled={!isEditing}
                  className="h-12 bg-gray-50 border-gray-200 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              {/* Password Section */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Password</Label>
                <Button
                  variant="outline"
                  className="h-12 bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  onClick={handleChangePassword}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8">
              {!isEditing ? (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                    className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isLoading ? "Updating..." : "Update Profile"}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
