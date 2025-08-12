import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function MentorNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Mentor Not Found</h1>
        <p className="text-gray-600 mb-8">
          The mentor you're looking for doesn't exist or may have been removed.
        </p>
        <Button asChild>
          <Link href="/mentorship">Browse All Mentors</Link>
        </Button>
      </div>
    </div>
  )
}
