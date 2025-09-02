"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CompanySidebar } from "@/components/CompanyComponents/company-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Building2, Globe, Mail, MapPin, Calendar, Users, CheckCircle, XCircle, Loader2, Shield } from "lucide-react"
import { ChangePasswordModal } from "@/components/StudentComponents/ChangePasswordModal"

interface CompanyProfile {
  _id: string
  companyName: string
  description: string
  website?: string
  industry?: string
  location?: string
  foundedYear?: string
  employees?: string
  verified: boolean
  pdfUrl?: string
  userId: {
    email: string
  }
  createdAt: string
  updatedAt: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "",
    description: "",
    website: "",
    industry: "",
    location: "",
    foundedYear: "",
    employees: ""
  })

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/company/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProfile(data.data)
          setFormData({
            companyName: data.data.companyName || "",
            description: data.data.description || "",
            website: data.data.website || "",
            industry: data.data.industry || "",
            location: data.data.location || "",
            foundedYear: data.data.foundedYear || "",
            employees: data.data.employees || ""
          })
        }
      } else {
        toast.error("Failed to fetch profile")
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Error fetching profile")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleChangePassword = () => {
    setShowPasswordModal(true)
  }

  const handleSave = async () => {
    try {
      // Basic validation
      if (!formData.companyName.trim()) {
        toast.error("Company name is required")
        return
      }
      
      if (!formData.description.trim()) {
        toast.error("Company description is required")
        return
      }

      setSaving(true)
      const token = localStorage.getItem("token")
      
      const response = await fetch(`${API_BASE_URL}/api/company/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProfile(data.data)
          toast.success("Profile updated successfully!", {
            description: "Your company information has been saved.",
            duration: 4000,
          })
        } else {
          toast.error(data.message || "Failed to update profile")
        }
      } else {
        const error = await response.json()
        toast.error("Failed to update profile", {
          description: error.message || "Please try again later.",
          duration: 5000,
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Error updating profile", {
        description: "Please check your connection and try again.",
        duration: 5000,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-lg">Loading profile...</div>
            </div>
          </div>
        </div>
      </SidebarInset>
    )
  }
  return (
    <>
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-8">
            <div className="space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
                  <p className="text-muted-foreground mt-2">Manage your company's information and branding.</p>
                </div>
                {profile && (
                  <div className="flex items-center gap-2">
                    {profile.verified ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <XCircle className="h-4 w-4 mr-1" />
                        Unverified
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Information */}
              {profile && (
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="text-gray-900">{profile.userId.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Member Since</p>
                          <p className="text-gray-900">{new Date(profile.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {profile.pdfUrl && (
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Registration Document</p>
                            <a 
                              href={profile.pdfUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              View Document
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Editable Profile Form */}
              <Card>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name *</Label>
                      <Input 
                        id="company-name" 
                        value={formData.companyName}
                        onChange={(e) => handleInputChange("companyName", e.target.value)}
                        placeholder="Enter company name" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input 
                        id="industry" 
                        value={formData.industry}
                        onChange={(e) => handleInputChange("industry", e.target.value)}
                        placeholder="e.g., Technology, Healthcare, Finance" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-description">Company Description *</Label>
                    <Textarea
                      id="company-description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe your company, mission, and values..."
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input 
                        id="website" 
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        placeholder="https://www.company.com" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="e.g., New York, NY" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="founded-year">Founded Year</Label>
                      <Input 
                        id="founded-year" 
                        value={formData.foundedYear}
                        onChange={(e) => handleInputChange("foundedYear", e.target.value)}
                        placeholder="e.g., 2010" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employees">Number of Employees</Label>
                      <Input 
                        id="employees" 
                        value={formData.employees}
                        onChange={(e) => handleInputChange("employees", e.target.value)}
                        placeholder="e.g., 1-10, 11-50, 51-200, 201+" 
                      />
                    </div>
                  </div>

                  {/* Security Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Security</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Password</p>
                          <p className="text-sm text-gray-500">Change your account password</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleChangePassword}
                      >
                        Change Password
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      size="lg" 
                      className="px-8"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Change Password Modal */}
        <ChangePasswordModal 
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          userRole="company"
        />
      </SidebarInset>
    </>
  )
}
