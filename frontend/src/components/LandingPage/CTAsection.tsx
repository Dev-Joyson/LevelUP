"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="px-4 ">
      <div className="container mx-auto bg-primary rounded-2xl sm:rounded-3xl py-12 sm:py-20">
      <div className=" text-center">
        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">Ready to LevelUp Your Career?</h2>
        <p className="text-base sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
          Join thousands of students, mentors, and companies who are already part of the LevelUp community.
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-lg">
          <Link href="/join">Register Now</Link>
        </Button>
      </div>
      </div>
    </section>
  )
}
