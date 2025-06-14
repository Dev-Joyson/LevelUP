import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function InternshipPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="max-w-md text-center p-8">
        <h1 className="text-2xl font-bold mb-4">Internship Opportunities</h1>
        <p className="text-muted-foreground mb-6">
          Select an internship from the sidebar to view detailed information.
        </p>
        <Link
          href="/internship/spotify-backend"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          View featured internship <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
