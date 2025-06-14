"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { GraduationCap, Users, Building2 } from "lucide-react"

type UserRole = "student" | "mentor" | "company"

export default function JoinPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("student")
  const router = useRouter()

  const handleContinue = () => {
    // Navigate to registration page with selected role
    router.push(`/register?role=${selectedRole}`)
  }

  const getRoleButtonText = () => {
    switch (selectedRole) {
      case "student":
        return "Join as a Student"
      case "mentor":
        return "Join as a Mentor"
      case "company":
        return "Join as a Company"
      default:
        return "Continue"
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Join LevelUP</h1>
          <p className="text-gray-600">Choose your role to get started with the right experience for you</p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Student Card */}
          <div
            onClick={() => setSelectedRole("student")}
            className={`relative p-6 border-1 rounded-lg cursor-pointer transition-all hover:shadow-md ${
              selectedRole === "student"
                ? "border-2 border-primary bg-primary/2"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">
                <GraduationCap className="h-12 w-12 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">I'm a student</h3>
              <p className="text-gray-600 text-sm">Looking for internships, mentorship, and career opportunities</p>
            </div>
            <div className="absolute top-4 right-4">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedRole === "student" ? "border-primary bg-primary" : "border-gray-300 bg-white"
                }`}
              >
                {selectedRole === "student" && <div className="w-2 h-2 rounded-full bg-white"></div>}
              </div>
            </div>
          </div>

          {/* Mentor Card */}
          <div
            onClick={() => setSelectedRole("mentor")}
            className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
              selectedRole === "mentor"
                ? "border-2 border-primary bg-primary/2"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">
                <Users className="h-12 w-12 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">I'm a mentor</h3>
              <p className="text-gray-600 text-sm">Ready to guide students and share my professional experience</p>
            </div>
            <div className="absolute top-4 right-4">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedRole === "mentor" ? "border-primary bg-primary" : "border-gray-300 bg-white"
                }`}
              >
                {selectedRole === "mentor" && <div className="w-2 h-2 rounded-full bg-white"></div>}
              </div>
            </div>
          </div>

          {/* Company Card */}
          <div
            onClick={() => setSelectedRole("company")}
            className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
              selectedRole === "company"
                ? "border-2 border-primary bg-primary/2"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">
                <Building2 className="h-12 w-12 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">I'm a HR</h3>
              <p className="text-gray-600 text-sm">
                Looking to hire talented students and offer internship opportunities
              </p>
            </div>
            <div className="absolute top-4 right-4">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedRole === "company" ? "border-primary bg-primary" : "border-gray-300 bg-white"
                }`}
              >
                {selectedRole === "company" && <div className="w-2 h-2 rounded-full bg-white"></div>}
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleContinue}
            className="bg-primary cursor-pointer text-white px-8 py-3 rounded-lg font-medium text-lg min-w-[200px]"
          >
            {getRoleButtonText()}
          </Button>

          <div className="mt-6">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-500 underline font-normal">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
