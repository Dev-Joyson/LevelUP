"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

interface ApplyButtonProps {
  internshipId: string
  title: string
  companyName: string
  className?: string
}

export function ApplyButton({ internshipId, title, companyName, className }: ApplyButtonProps) {
  const [isApplying, setIsApplying] = useState(false)
  const router = useRouter()

  const handleApply = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login to apply for internships')
        router.push('/login')
        return
      }

      setIsApplying(true)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/student/apply-internship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          internshipId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Successfully applied to ${title} at ${companyName}!`)
        // Optionally redirect to applications page or refresh
        // router.push('/student/applications')
      } else {
        toast.error(data.message || 'Failed to apply to internship')
      }
    } catch (error) {
      console.error('Apply error:', error)
      toast.error('An error occurred while applying')
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <Button 
      onClick={handleApply}
      disabled={isApplying}
      className={`bg-primary text-white hover:bg-white hover:border-1 hover:border-primary hover:text-primary rounded-md px-9 ${className}`}
    >
      {isApplying ? 'Applying...' : 'Apply'}
    </Button>
  )
}
