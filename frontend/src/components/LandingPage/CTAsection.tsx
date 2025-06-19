import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-20 bg-primary rounded-3xl">
      <div className=" px-4 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">Ready to LevelUp Your Career?</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Join thousands of students, mentors, and companies who are already part of the LevelUp community.
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg rounded-lg">
          <Link href="/join">Register Now</Link>
        </Button>
      </div>
    </section>
  )
}
