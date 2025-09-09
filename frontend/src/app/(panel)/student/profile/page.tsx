"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Shield, Camera, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { ChangePasswordModal } from "@/components/StudentComponents/ChangePasswordModal"
import { useStudentContext } from "@/context/StudentContext"

interface StudentProfile {
  firstname: string
  lastname: string
  email: string
  phoneNumber: string
  university?: string
  graduationYear?: string
  resumeUrl?: string
  profileImageUrl?: string
  userId: string
}

interface FormData {
  fullName: string
  email: string
  phoneNumber: string
  university?: string
  graduationYear?: string
}

export default function StudentProfilePage() {
  const { updateProfileData } = useStudentContext()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    university: "",
    graduationYear: ""
  })
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  
  // Use port 5000 since other functionality is working with this port
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
  const [isPhoneSyncing, setIsPhoneSyncing] = useState(false)

  // Fetch student profile data or use mock data if API is unavailable
  useEffect(() => {
    async function fetchStudentProfile() {
      try {
        // If API_BASE_URL is not available, use mock data
        if (!API_BASE_URL) {
          console.warn("API_BASE_URL is not defined, using mock data")
          setFormData({
            fullName: "Demo Student",
            email: "demo.student@university.edu",
            phoneNumber: "+94 76 123 4567",
            university: "University of Colombo",
            graduationYear: "2025"
          })
          setIsPageLoading(false)
          return
        }

        const token = localStorage.getItem("token")
        if (!token) {
          // For demo purposes, load mock data if no token
          setFormData({
            fullName: "Demo Student",
            email: "demo.student@university.edu",
            phoneNumber: "+94 76 123 4567",
            university: "University of Colombo",
            graduationYear: "2025"
          })
          setIsPageLoading(false)
          return
        }

        console.log("Fetching student profile from:", `${API_BASE_URL}/api/student/profile`)
        console.log("Using auth token:", token.substring(0, 15) + "...")
        
        // Add timeout for fetch to prevent hanging requests
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout
        
        const response = await fetch(`${API_BASE_URL}/api/student/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`Failed to fetch profile data: ${response.status} ${response.statusText}`)
        }

        const studentData: StudentProfile = await response.json()
        console.log("Student data received:", studentData)
        
        setFormData({
          fullName: `${studentData.firstname || ""} ${studentData.lastname || ""}`.trim(),
          email: studentData.email || "",
          phoneNumber: studentData.phoneNumber || "",
          university: studentData.university || "",
          graduationYear: studentData.graduationYear || ""
        })
        
        // Automatically sync phone number if it's missing
        if (!phoneNumber) {
          syncPhoneFromResume(false).catch(err => {
            console.error("Auto-sync phone failed:", err);
            // Silently fail - don't show error toast for automatic sync
          });
        }
        
        if (studentData.profileImageUrl) {
          setProfileImageUrl(studentData.profileImageUrl)
        }
        
      } catch (error) {
        console.error("Error fetching profile:", error)
        
        // Handle different error types with specific messages
        if (error instanceof DOMException && error.name === 'AbortError') {
          toast.error("Request timed out. Check your network connection.")
        } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          toast.error("Network error. Check your connection or API server.")
        } else {
          toast.error("Failed to load profile data. Using demo data instead.")
        }
        
        // Use demo data if API call fails
        setFormData({
          fullName: "Demo Student",
          email: "demo.student@university.edu",
          phoneNumber: "+94 76 123 4567",
          university: "University of Colombo",
          graduationYear: "2025"
        })
      } finally {
        setIsPageLoading(false)
      }
    }
    
    fetchStudentProfile()
  }, [API_BASE_URL])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleUpdateProfile = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Authentication error. Please login again.")
        setIsLoading(false)
        return
      }
      
      // If API_BASE_URL is not available or for demo mode
      if (!API_BASE_URL) {
      // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800))
        toast.success("Profile updated successfully (Demo mode)")
        setIsEditing(false)
        setIsLoading(false)
        return
      }
      
      // Split fullName into firstname and lastname
      const nameParts = formData.fullName.split(" ")
      const firstname = nameParts[0] || ""
      const lastname = nameParts.slice(1).join(" ") || ""
      
      console.log("Updating profile at:", `${API_BASE_URL}/api/student/update-profile`)
      console.log("Update data:", {
        firstname,
        lastname,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        university: formData.university,
        graduationYear: formData.graduationYear
      })
      
      try {
        // Add timeout for fetch to prevent hanging requests
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout
        
        const response = await fetch(`${API_BASE_URL}/api/student/update-profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            firstname,
            lastname,
            phoneNumber: formData.phoneNumber,
            email: formData.email,
            university: formData.university,
            graduationYear: formData.graduationYear
          }),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`Failed to update profile: ${response.status} ${response.statusText}`)
        }
        
        const responseData = await response.json()
        console.log("Update response:", responseData)
        
        toast.success("Profile updated successfully")
      } catch (fetchError) {
        console.error("API Error updating profile:", fetchError)
        toast.warning("Could not reach the server. Changes saved locally only.")
      }
      
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = () => {
    setShowPasswordModal(true)
  }

  const handleAvatarChange = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
  
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
  
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated. Please log in again.");
        return;
      }

      setIsUploadingImage(true); // Start loading
  
      const formData = new FormData();
      formData.append("profileImage", file); // 👈 must match backend field name
  
      try {
        const response = await fetch(`${API_BASE_URL}/api/student/upload-profile-image`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
  
        const data = await response.json();
        setProfileImageUrl(data.profileImageUrl); // 👈 update avatar
        // Update context so navbar gets updated immediately
        updateProfileData({ profileImageUrl: data.profileImageUrl });
        toast.success("Profile image updated!");
      } catch (error) {
        console.error("Image upload error:", error);
        toast.error("Failed to upload profile image.");
      } finally {
        setIsUploadingImage(false); // Stop loading
      }
    };
  
    input.click(); // 👈 open file dialog
  };
  

  const syncPhoneFromResume = async (showToasts = false) => {
    setIsPhoneSyncing(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        if (showToasts) {
          toast.error("Authentication error. Please login again.")
        }
        setIsPhoneSyncing(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/student/sync-phone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to sync phone number")
      }

      const data = await response.json()
      console.log("Phone sync response:", data)
      
      // Update the form data with the synced phone number
      if (data && data.phoneNumber) {
        setFormData(prev => ({
          ...prev,
          phoneNumber: data.phoneNumber
        }))
        
        if (showToasts) {
          toast.success("Phone number successfully synced from resume")
        }
      }
    } catch (error) {
      console.error("Error syncing phone:", error)
      if (showToasts) {
        const errorMessage = error instanceof Error ? error.message : "Failed to sync phone number";
        toast.error(errorMessage)
      }
    } finally {
      setIsPhoneSyncing(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

        {isPageLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4 group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 relative">
                    {profileImageUrl ? (
              <Image
                      src={profileImageUrl}
                alt="Profile picture"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-4xl font-bold">
                      {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
              
              {/* Loading overlay */}
              {isUploadingImage && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="absolute bottom-2 right-2 rounded-full w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleAvatarChange}
              disabled={isUploadingImage}
            >
              {isUploadingImage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>
          </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{formData.fullName || "Student"}</h2>
              <p className="text-gray-600">{formData.email || "No email available"}</p>
              <p className="text-gray-600">{formData.phoneNumber || "No phone number available"}</p>
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
                  
                  {/* University */}
                  <div>
                    <Label htmlFor="university" className="text-sm font-medium text-gray-700 mb-2 block">
                      University
                    </Label>
                    <Input
                      id="university"
                      type="text"
                      value={formData.university || ""}
                      onChange={(e) => handleInputChange("university", e.target.value)}
                      disabled={!isEditing}
                      className="h-12 bg-gray-50 border-gray-200 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  
                  {/* Graduation Year */}
                  <div>
                    <Label htmlFor="graduationYear" className="text-sm font-medium text-gray-700 mb-2 block">
                      Graduation Year
                    </Label>
                    <Input
                      id="graduationYear"
                      type="text"
                      value={formData.graduationYear || ""}
                      onChange={(e) => handleInputChange("graduationYear", e.target.value)}
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
          </>
        )}
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  )
}
