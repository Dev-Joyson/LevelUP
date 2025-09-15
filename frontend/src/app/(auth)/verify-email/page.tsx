"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import OTPVerification from "@/components/OTPVerification"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState("")

  // Get email from URL params if provided
  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])


  // OTP Verification Success Handler
  const handleOTPVerificationSuccess = () => {
    router.push("/login")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-2 sm:px-0">
      <div className="w-full max-w-md bg-white rounded-lg border-1 border-gray-200 p-4 sm:p-8">
        <div>
          <p className="text-[#535c91] text-xl sm:text-2xl text-center font-bold">
            Level<span className="text-primary">UP</span>
          </p>
          <p className="text-xs sm:text-sm text-gray-500 text-center mb-4 sm:mb-5">Email Verification</p>
          <h2 className="text-base sm:text-[20px] font-semibold mb-4 sm:mb-5 text-primary">
            Verify Your Email Address
          </h2>

          <div className="space-y-6">
            {/* Email Input */}
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="mt-1"
                disabled={!!searchParams.get("email")} // Disable if email came from URL
              />
            </div>

            {/* OTP Verification Component */}
            {email.trim() && (
              <OTPVerification
                email={email}
                onVerifySuccess={handleOTPVerificationSuccess}
                title="Enter Verification Code"
                subtitle="Enter the 6-digit verification code sent to your email address."
              />
            )}

            {/* Back to Login */}
            <div className="text-center mt-6">
              <p className="text-xs sm:text-sm text-gray-500">
                Already verified?{" "}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Back to Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
