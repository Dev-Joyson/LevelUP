import React from "react";
import { ChevronLeftIcon, ChevronRightIcon, StarFilledIcon } from "@radix-ui/react-icons";

const testimonials = [
  {
    name: "Sophia Carter",
    role: "Student",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAk9Y_En7_EfYL7QONa2TfNKwocouTrKDGt5q2RND9gmKB0X8MMBW9rTIhPnLWmr7cf98NbTLDpo9U-P9WVqbCkj6NVVLNWuMVmVQzPqOZtM88xbbqI05W-Y1ft8DorD-TP-BN23C3gFH4CKGUOzl5bm0rkV0um_0X9Bk-aYhHCgQp02shL9yAgG-i_bQRyzY6T5pH4iQFfVm5lW0jqPocDQywfu710ehB-GPwii_QE3fxDSwj2uCcMOQM4dVq0uP-P-s6K9998lkM",
    quote: "LevelUp helped me land an internship at a leading tech company. The mentorship I received was invaluable."
  },
  {
    name: "Ethan Walker",
    role: "Student",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAe146hHdSVHTQ-g-pPlOYz4Jx3cCgeEAS6YPwneuowx4wH-deZ-rHbI37NDlZP7zOaX9bXySZZNRnTKVngZ4ihxWO1rGMGY5HYFMHRK77ay01mpjRdhINHe7IUDy3H4OKSmywppwkfQ7aSP31plJKOMTuoB1Lylm0WfO5fRaNsGyn88Oo7ejTpOMp8HhNMui-2SqJTiQA477xTdvXjvVhPov9ED4r3wVQVz8a2k4HsHdnTpdF8uKwNkarx6CThOGwSI5HacnJukCg",
    quote: "The platform is user-friendly and the support team is responsive. I highly recommend LevelUp to all students."
  },
  {
    name: "Olivia Bennett",
    role: "Mentor",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAchhmuGK_hmxZoebhTzAYhd1DA049GGIxINS1jpkfuN14sIMpqvkSNW0fCGE7NKqu-SXTmrgh_usg3n_XHlC2GTSo64OZsgsIBKV0SvYSxPliTYp1Bf3qOaSdBLkeBkvQoOOYxDVhkODdDoIghRpLCNFvsRwTXJ8bpKU6XR-lzSUJDdfTD2KCtn5WSoyBDPFnCUiv4aPmUBzC2lmS5owmbUmbj0Xv3tH7dXBywM8h44zmRGfaU-TaAzg7VSunaYH2gDid9nJYotdg",
    quote: "Mentoring students through LevelUp has been a rewarding experience. It's great to see them grow."
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-background-light dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-light dark:text-text-dark tracking-tight">Testimonials</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">What our community says about LevelUp</p>
        </div>
        <div className="relative mt-16">
          <div className="absolute inset-y-0 left-0 flex items-center">
            <button className="bg-card-light dark:bg-card-dark p-2 rounded-full shadow-md text-text-light dark:text-text-dark hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 -ml-6 lg:-ml-12">
              <ChevronLeftIcon width={24} height={24} />
            </button>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-card-light dark:bg-card-dark p-8 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarFilledIcon key={i} className="text-yellow-400" width={20} height={20} />
                  ))}
                </div>
                <blockquote className="text-text-light dark:text-text-dark text-lg">
                  <p>"{t.quote}"</p>
                </blockquote>
                <div className="mt-6 flex items-center">
                  <img alt={`Photo of ${t.name}`} className="h-12 w-12 rounded-full object-cover" src={t.image} />
                  <div className="ml-4">
                    <p className="font-semibold text-text-light dark:text-text-dark">{t.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button className="bg-card-light dark:bg-card-dark p-2 rounded-full shadow-md text-text-light dark:text-text-dark hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 -mr-6 lg:-mr-12">
              <ChevronRightIcon width={24} height={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;