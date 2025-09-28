"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function StudentMockInterviewsPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to standalone mock interviews page
    router.push('/mock-interviews')
  }, [router])

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}