import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function InternshipNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <h1 className="text-2xl font-bold mb-2">Internship Not Found</h1>
      <p className="text-muted-foreground mb-6 text-center">
        The internship you're looking for doesn't exist or has been removed.
      </p>
      <Button asChild>
        <Link href="/internship">Back to Internships</Link>
      </Button>
    </div>
  )
}