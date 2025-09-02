"use client"

import { useState } from "react"
import { X, Eye, EyeOff, Shield, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  userRole?: 'student' | 'mentor' | 'company'
}

export function ChangePasswordModal({ isOpen, onClose, userRole = 'student' }: ChangePasswordModalProps) {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"

  if (!isOpen) return null

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const validateForm = () => {
    const newErrors = {
      oldPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
    let isValid = true

    // Check if old password is provided
    if (!formData.oldPassword) {
      newErrors.oldPassword = "Current password is required"
      isValid = false
    }

    // Check new password requirements
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required"
      isValid = false
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters"
      isValid = false
    }

    // Check confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password"
      isValid = false
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      isValid = false
    }

    // Check if new password is different from old password
    if (formData.oldPassword && formData.newPassword && formData.oldPassword === formData.newPassword) {
      newErrors.newPassword = "New password must be different from current password"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Please login to change password")
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/${userRole}/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Password changed successfully!")
        // Reset form
        setFormData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
        onClose()
      } else {
        toast.error(data.message || "Failed to change password")
      }
    } catch (error) {
      console.error("Password change error:", error)
      toast.error("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      // Reset form when closing
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
      setErrors({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Password */}
          <div>
            <Label htmlFor="oldPassword" className="text-sm font-medium text-gray-700">
              Current Password
            </Label>
            <div className="relative mt-1">
              <Input
                id="oldPassword"
                type={showPasswords.old ? "text" : "password"}
                value={formData.oldPassword}
                onChange={(e) => handleInputChange("oldPassword", e.target.value)}
                disabled={loading}
                className={`pr-10 ${errors.oldPassword ? 'border-red-500' : ''}`}
                placeholder="Enter your current password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('old')}
                disabled={loading}
              >
                {showPasswords.old ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {errors.oldPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.oldPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
              New Password
            </Label>
            <div className="relative mt-1">
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => handleInputChange("newPassword", e.target.value)}
                disabled={loading}
                className={`pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
                placeholder="Enter your new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('new')}
                disabled={loading}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirm New Password
            </Label>
            <div className="relative mt-1">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                disabled={loading}
                className={`pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="Confirm your new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('confirm')}
                disabled={loading}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${formData.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`} />
                At least 6 characters long
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${formData.newPassword !== formData.oldPassword && formData.newPassword ? 'bg-green-500' : 'bg-gray-300'}`} />
                Different from current password
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${formData.newPassword === formData.confirmPassword && formData.confirmPassword ? 'bg-green-500' : 'bg-gray-300'}`} />
                Passwords match
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
