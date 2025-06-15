import { Star } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sophia Carter",
      role: "Student",
      image: "/placeholder.svg?height=80&width=80",
      content:
        "LevelUp helped me land an internship at a leading tech company. The mentorship I received was invaluable.",
      rating: 5,
      bgColor: "bg-teal-100",
    },
    {
      name: "Ethan Walker",
      role: "Student",
      image: "/placeholder.svg?height=80&width=80",
      content:
        "The platform is user-friendly and the support team is responsive. I highly recommend LevelUp to all students.",
      rating: 5,
      bgColor: "bg-blue-100",
    },
    {
      name: "Olivia Bennett",
      role: "Mentor",
      image: "/placeholder.svg?height=80&width=80",
      content:
        "Mentoring students through LevelUp has been a rewarding experience. It's great to see students grow and succeed.",
      rating: 5,
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <section className="py-15 bg-white">
      <div className="">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Testimonials</h2>
          <p className="text-gray-600">What our community says about LevelUp</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className={`${testimonial.bgColor} rounded-2xl p-8`}>
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <blockquote className="text-gray-800 mb-6 leading-relaxed">"{testimonial.content}"</blockquote>

              <div className="flex items-center">
                <img
                  src={testimonial.image || "/placeholder.svg"}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
