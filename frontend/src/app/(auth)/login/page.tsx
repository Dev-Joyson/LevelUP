"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"

export default function Login() {

  const { login, loading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    try {
      await login(email, password)
      // toast.success('Login successful!')
    } catch (error) {
      console.error('Error during login:', error)
      toast.error(error instanceof Error ? error.message : "Server error. Please try again later.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-2 sm:px-0">
      <div className="w-full max-w-md bg-white rounded-lg border-1 border-gray-200 p-4 sm:p-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <p className="text-[#535c91] text-xl sm:text-2xl text-center font-bold">Level<span className="text-primary">UP</span></p>
          <p className="text-xs sm:text-sm text-gray-500 text-center">Login</p>
        </div>

        {/* Form content */}
        <div>
          <h2 className="text-base sm:text-xl font-semibold mb-4 sm:mb-6">Sign in to your account</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
              <div className="flex justify-end mt-1">
                <Link href="/forgot-password" className="text-xs sm:text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleLogin} 
            className="w-full mt-6 bg-primary hover:bg-white hover:text-primary hover:border-1 hover:border-primary text-white py-2 rounded text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-500">
              Don't have an account?{" "}
              <Link href="/join" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center text-[10px] sm:text-xs text-gray-500">
            <p>
              This site is protected by reCAPTCHA and the Google{" "}
              <Link href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{" "}
              apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}