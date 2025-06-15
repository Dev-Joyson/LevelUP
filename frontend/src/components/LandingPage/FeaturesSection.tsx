import { GraduationCap, Building2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FeaturesSection() {
  return (
    <section className="py-15">
      <div className="container mx-auto py-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Empowering Students, Companies, and Mentors</h2>
          <p className=" text-gray-500 max-w-3xl mx-auto">
            LevelUp is designed to benefit all stakeholders in the internship and mentorship ecosystem.
          </p>
          <Button className="mt-6 bg-primary  text-white px-8 py-3 rounded-lg">
            Explore Features
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* For Students */}
          <div className="bg-white rounded-xl p-8  border-2 border-gray-100">
            <div className="w-12 h-12 bg-primary/4 rounded-lg flex items-center justify-center mb-6">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">For Students</h3>
            <p className="text-gray-500 leading-relaxed">
              Find internships that match your skills and career goals. Connect with mentors for guidance and support.
            </p>
          </div>

          {/* For Companies */}
          <div className="bg-white rounded-xl p-8  border-2 border-gray-100">
            <div className="w-12 h-12 bg-primary/4 rounded-lg flex items-center justify-center mb-6">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">For Companies</h3>
            <p className="text-gray-500 leading-relaxed">
              Access a pool of talented students for internships. Build your brand and contribute to education.
            </p>
          </div>

          {/* For Mentors */}
          <div className="bg-white rounded-xl p-8  border-2 border-gray-100">
            <div className="w-12 h-12 bg-primary/4 rounded-lg flex items-center justify-center mb-6">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">For Mentors</h3>
            <p className="text-gray-500 leading-relaxed">
              Share your expertise and guide the next generation of professionals. Connect with motivated students.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
