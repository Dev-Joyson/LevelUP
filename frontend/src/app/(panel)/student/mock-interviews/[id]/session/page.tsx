"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function StudentInterviewSessionPage() {
  const params = useParams()
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to standalone interview page
    if (params.id) {
      router.push(`/mock-interviews/${params.id}/interview`)
    } else {
      router.push('/mock-interviews')
    }
  }, [params.id, router])

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}