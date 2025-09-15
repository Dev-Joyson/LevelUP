"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

interface OTPVerificationProps {
  email: string
  onVerifySuccess: () => void
  onVerifyError?: (error: string) => void
  title?: string
  subtitle?: string
}

export default function OTPVerification({ 
  email, 
  onVerifySuccess, 
  onVerifyError,
  title = "Verify Your Email Address",
  subtitle = "Enter the 6-digit verification code sent to your email address."
}: OTPVerificationProps) {
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Individual OTP input handling
  const handleOTPChange = (index: number, value: string) => {
    // Only allow single digit
    const numericValue = value.replace(/[^0-9]/g, '')
    if (numericValue.length > 1) return
    
    const newOtp = otp.split('')
    newOtp[index] = numericValue
    setOtp(newOtp.join(''))
    
    // Auto-focus next input
    if (numericValue && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }
  
  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }
  
  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6)
    setOtp(pasteData)
    
    // Focus the next empty input or the last one
    const nextIndex = Math.min(pasteData.length, 5)
    const nextInput = document.getElementById(`otp-${nextIndex}`)
    nextInput?.focus()
  }

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit verification code")
      return
    }

    try {
      setIsVerifying(true)
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Email verified successfully!")
        onVerifySuccess()
      } else {
        const errorMessage = data.message || "Invalid verification code"
        toast.error(errorMessage)
        onVerifyError?.(errorMessage)
        // Clear OTP on error
        setOtp("")
        // Focus first input
        const firstInput = document.getElementById("otp-0")
        firstInput?.focus()
      }
    } catch (error) {
      const errorMessage = "Failed to verify code. Please try again."
      toast.error(errorMessage)
      onVerifyError?.(errorMessage)
      setOtp("")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("New verification code sent to your email")
        setResendCooldown(120) // 2-minute cooldown
        setOtp("") // Clear current OTP
        // Focus first input
        const firstInput = document.getElementById("otp-0")
        firstInput?.focus()
      } else {
        toast.error(data.message || "Failed to resend code")
      }
    } catch (error) {
      toast.error("Failed to resend code. Please try again.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          {subtitle.includes('email address') 
            ? subtitle.replace('email address', `email address: ${email}`)
            : subtitle
          }
        </p>

        {/* Individual OTP Input Boxes */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Input
              key={index}
              id={`otp-${index}`}
              type="text"
              value={otp[index] || ''}
              onChange={(e) => handleOTPChange(index, e.target.value)}
              onKeyDown={(e) => handleOTPKeyDown(index, e)}
              onPaste={handleOTPPaste}
              className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 hover:border-gray-400 bg-white"
              maxLength={1}
            />
          ))}
        </div>

        {/* Error message */}
        {otp.length > 0 && otp.length < 6 && (
          <p className="text-red-500 text-sm mb-4">Please enter all 6 digits</p>
        )}

        {/* Resend Code */}
        <div className="mb-6">
          {resendCooldown > 0 ? (
            <p className="text-gray-500 text-sm">
              Resend code in {Math.floor(resendCooldown / 60)}:{(resendCooldown % 60).toString().padStart(2, '0')}
            </p>
          ) : (
            <button
              onClick={handleResendOTP}
              className="text-primary hover:text-[#535c91] underline text-sm font-medium transition-colors"
            >
              Didn't receive the code? Resend
            </button>
          )}
        </div>

        {/* Verify Button */}
        <Button
          onClick={handleVerifyOTP}
          disabled={otp.length !== 6 || isVerifying}
          className="w-full bg-primary hover:bg-[#535c91] text-white py-3 rounded-lg text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isVerifying ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Verifying...
            </div>
          ) : (
            "Verify Email"
          )}
        </Button>

        {/* Expiration notice */}
        <p className="text-xs text-gray-500 mt-4">
          Code expires in 5 minutes
        </p>
      </div>
    </div>
  )
}
