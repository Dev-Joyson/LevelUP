"use client"

import { useState } from "react"
import { Search, MapPin, ArrowRight, Play, CheckCircle, Users, Building2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export function HeroSection() {
  const [activeTab, setActiveTab] = useState<"students" | "companies">("students")
  const [jobSearch, setJobSearch] = useState("")
  const [location, setLocation] = useState("")

  const handleSearch = () => {
    console.log("Searching for:", { jobSearch, location, userType: activeTab })
  }

  return (
    // <section className="relative py-12 bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden">
    <section className=" py-17 ">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <Badge className="bg-[#535c91]/10 text-[#535c91] border-[#535c91]/20 mb-6 px-3 py-1">
                🚀 Join 10,000+ Students Already Growing Their Careers
              </Badge>

              {/* Main Heading */}
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3 leading-tight">
                <span className="text-primary">Level</span>
                <span className="text-primary">UP</span>
                <br />
                <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Your Career Journey
                </span>
              </h1>

              {/* Subtitle */}
              <p className=" text-gray-500 mb-6 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Connect with top companies, experienced mentors, and exclusive internship opportunities. Transform your
                potential into professional success.
              </p>

              {/* Features List */}
              <div className="flex flex-col sm:flex-row gap-6 mb-6 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600">Verified Companies</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600">Expert Mentors</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600">Career Growth</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-primary cursor-pointer hover:bg-primary/90 text-white px-6 py-3  rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Explore Now
                  <ArrowRight className=" h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-1 border-primary cursor-pointer text-primary hover:bg-gray-50 px-6 py-3  rounded-xl"
                >
                  <Play className=" h-5 w-5 text-primary" />
                  Watch Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-[#535c91] mb-1">95%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-[#535c91] mb-1">500+</div>
                  <div className="text-sm text-gray-600">Active Mentors</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold text-[#535c91] mb-1">200+</div>
                  <div className="text-sm text-gray-600">Partner Companies</div>
                </div>
              </div>
            </div>

            {/* Right Side - Search Card */}
            <div className="relative">
              {/* Main Search Card */}
              <div className="bg-white rounded-xl py-8 px-4 shadow-2xl border border-gray-100 relative z-10 ">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Find Your Perfect Match</h3>
                  <p className="text-gray-500">Discover opportunities tailored to your goals</p>
                </div>

                {/* Toggle Buttons */}
                <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
                  <button
                    onClick={() => setActiveTab("students")}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      activeTab === "students"
                        ? "bg-white text-[#535c91] shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Find Jobs
                  </button>
                  <button
                    onClick={() => setActiveTab("companies")}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      activeTab === "companies"
                        ? "bg-white text-[#535c91] shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Find Talent
                  </button>
                </div>

                {/* Search Form */}
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder={
                        activeTab === "students"
                          ? "Search jobs, internships..."
                          : "Search for talent, skills..."
                      }
                      value={jobSearch}
                      onChange={(e) => setJobSearch(e.target.value)}
                      className="pl-12 h-12 bg-gray-50 border-gray-200 focus:border-[#535c91] focus:ring-[#535c91] text-gray-900 placeholder:text-gray-500 rounded-xl text-lg"
                    />
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Enter location or 'Remote'"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-12 h-12 bg-gray-50 border-gray-200 focus:border-[#535c91] focus:ring-[#535c91] text-gray-900 placeholder:text-gray-500 rounded-xl text-lg"
                    />
                  </div>

                  <Button
                    onClick={handleSearch}
                    className="w-full h-12 bg-primary hover:from-[#535c91]/90 hover:to-[#6366f1]/90 text-white font-semibold rounded-xl cursor-pointer transition-all duration-300"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    {activeTab === "students" ? "Find Opportunities" : "Find Talent"}
                  </Button>
                </div>

                {/* Popular Searches */}
                <div className="mt-6">
                  <p className="text-sm text-gray-500 mb-3">Popular searches:</p>
                  <div className="flex flex-wrap gap-2">
                    {["Software Engineering", "Data Science", "UI/UX Design", "Marketing", "Remote Work"].map(
                      (term) => (
                        <Badge
                          key={term}
                          variant="outline"
                          className="text-xs text-gray-800 cursor-pointer hover:bg-[#535c91] hover:text-white transition-colors duration-200 border-gray-300"
                        >
                          {term}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-4 shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>

              <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-4 shadow-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>

              {/* Testimonial Card */}
              <div className="absolute -bottom-8 right-8 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 max-w-xs">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 mb-2">"Got my dream internship in 2 weeks!"</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">S</span>
                  </div>
                  <span className="text-xs text-gray-500">Sarah M., Student</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  )
}












// "use client"

// import { useState } from "react"
// import { Search, MapPin } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"

// export function HeroSection() {
//   const [activeTab, setActiveTab] = useState<"students" | "companies">("students")
//   const [jobSearch, setJobSearch] = useState("")
//   const [location, setLocation] = useState("")

//   const handleSearch = () => {
//     console.log("Searching for:", { jobSearch, location, userType: activeTab })
//     // Handle search logic here
//   }

//   const getPopularTerms = () => {
//     return activeTab === "students"
//       ? ["Software", "Design", "Marketing", "Remote"]
//       : ["Developers", "Designers", "Interns", "Graduates"]
//   }

//   return (
//     <section className="py-10 sm:py-15">
//       <div className="px-4">
//         {/* Hero Banner with Integrated Search */}
//         <div className="bg-white relative overflow-hidden rounded-2xl sm:rounded-3xl">
//           {/* Content Grid */}
//           <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
//             {/* Left Side - Content + Search */}
//             <div>
//               <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
//                 Unlock Your <span className="text-primary">Future</span> With US
//               </h1>
//               <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 leading-relaxed">
//                 Connect with top companies and experienced mentors to kickstart your career. Gain real-world experience
//                 through internships and mentorship programs.
//               </p>
//               {/* Compact Search Section */}
//               <div className="bg-[#f7f7fa] backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 ">
//                 {/* Toggle Buttons */}
//                 <div className="flex rounded-lg bg-gray-100 p-1 mb-3 sm:mb-4">
//                   <button
//                     onClick={() => setActiveTab("students")}
//                     className={`flex-1 py-2 px-2 sm:px-3 rounded-md text-xs font-medium transition-all ${
//                       activeTab === "students"
//                         ? "bg-white text-gray-900 shadow-sm"
//                         : "text-gray-600 hover:text-gray-900"
//                     }`}
//                   >
//                     Find Jobs
//                   </button>
//                   <button
//                     onClick={() => setActiveTab("companies")}
//                     className={`flex-1 py-2 px-2 sm:px-3 rounded-md text-xs font-medium transition-all ${
//                       activeTab === "companies"
//                         ? "bg-white text-gray-900 shadow-sm"
//                         : "text-gray-600 hover:text-gray-900"
//                     }`}
//                   >
//                     Find Talent
//                   </button>
//                 </div>
//                 <div className="space-y-2 sm:space-y-3">
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <Input
//                       type="text"
//                       placeholder={
//                         activeTab === "students" ? "Search jobs, internships..." : "Search for talent, skills..."
//                       }
//                       value={jobSearch}
//                       onChange={(e) => setJobSearch(e.target.value)}
//                       className="pl-10 h-10 sm:h-11 bg-white border-gray-200 focus:border-blue-500 text-gray-900 placeholder:text-gray-500 rounded-lg text-sm"
//                     />
//                   </div>
//                   <div className="relative">
//                     <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <Input
//                       type="text"
//                       placeholder="Enter location..."
//                       value={location}
//                       onChange={(e) => setLocation(e.target.value)}
//                       className="pl-10 h-10 sm:h-11 bg-white border-gray-200 focus:border-blue-500 text-gray-900 placeholder:text-gray-500 rounded-lg text-sm"
//                     />
//                   </div>
//                   <Button
//                     onClick={handleSearch}
//                     className="w-full h-10 sm:h-11 bg-primary text-white font-semibold rounded-lg mt-3 sm:mt-4"
//                   >
//                     <Search className="h-4 w-4 mr-2" />
//                     {activeTab === "students" ? "Find Opportunities" : "Find Talent"}
//                   </Button>
//                 </div>
//               </div>
//             </div>
//             {/* Right Side - SVG Illustration */}
//             <div className="hidden md:flex justify-center items-center">
//               <img
//                 src="/mentor-support.svg"
//                 alt="Mentor helping employee climb up - representing career growth and mentorship"
//                 className="w-full h-auto max-w-3xl"
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }

















// // "use client"

// // import { useState } from "react"
// // import { Search, MapPin } from "lucide-react"
// // import { Button } from "@/components/ui/button"
// // import { Input } from "@/components/ui/input"

// // export function HeroSection() {
// //   const [jobSearch, setJobSearch] = useState("")
// //   const [location, setLocation] = useState("")
// //   const [activeTab, setActiveTab] = useState<"students" | "companies">("students")

// //   const handleSearch = () => {
// //     console.log("Searching for:", { jobSearch, location })
// //     // Handle search logic here
// //   }

// //   const getPopularTerms = () => {
// //     return activeTab === "students"
// //       ? ["Software", "Design", "Marketing", "Remote"]
// //       : ["Developers", "Designers", "Interns", "Graduates"]
// //   }

// //   return (
// //     <section className="py-8 ">
// //       <div className="container mx-auto px-4">
// //         {/* Hero Banner with Integrated Search */}
// //         {/* <div className="bg-gradient-to-r from-primary via-c to-[#535c91] rounded-3xl p-8 md:p-12 relative overflow-hidden"> */}
// //         {/* <div className="bg-gradient-to-t from-[#3d446a] to-[#d9dae8] rounded-3xl p-8 md:p-12 relative overflow-hidden"> */}
// //         <div className="bg-gradient-to-t from-[#3d446a] via-[#d9dae8] to-[#f8f8fb] rounded-3xl p-8 md:p-12 relative overflow-hidden">
// //           {/* Decorative Elements */}
// //           {/* <div className="absolute right-8 top-8 opacity-20">
// //             <svg width="200" height="200" viewBox="0 0 200 200" className="text-green-600">
// //               <path
// //                 d="M100 20C120 20 140 40 140 60C140 80 120 100 100 100C80 100 60 80 60 60C60 40 80 20 100 20Z"
// //                 fill="currentColor"
// //               />
// //               <path
// //                 d="M80 80C90 80 100 90 100 100C100 110 90 120 80 120C70 120 60 110 60 100C60 90 70 80 80 80Z"
// //                 fill="currentColor"
// //               />
// //               <path
// //                 d="M120 80C130 80 140 90 140 100C140 110 130 120 120 120C110 120 100 110 100 100C100 90 110 80 120 80Z"
// //                 fill="currentColor"
// //               />
// //             </svg>
// //           </div> */}

// //           {/* <div className="absolute left-8 bottom-8 opacity-20">
// //             <svg width="150" height="150" viewBox="0 0 150 150" className="text-green-500">
// //               <path
// //                 d="M75 10C85 10 95 20 95 30C95 40 85 50 75 50C65 50 55 40 55 30C55 20 65 10 75 10Z"
// //                 fill="currentColor"
// //               />
// //               <path d="M75 50L75 140M55 70L95 70M60 90L90 90M65 110L85 110" stroke="currentColor" strokeWidth="8" />
// //             </svg>
// //           </div> */}

// //           {/* Content Grid */}
// //           <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
// //             {/* Left Side - Content + Search */}
// //             <div>
// //               <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
// //                 LevelUp: Your Launchpad to Success
// //               </h1>
// //               <p className="text-base md:text-lg text-gray-700 mb-8 leading-relaxed">
// //                 Connect with top companies and experienced mentors to kickstart your career. Gain real-world experience
// //                 through internships and mentorship programs.
// //               </p>

// //               {/* Compact Search Section */}
// //               <div className="bg-[#f7f7fa] backdrop-blur-sm rounded-xl p-4 border border-white/20">
// //                 {/* Toggle Buttons */}
// //                 <div className="flex rounded-lg bg-gray-100 p-1 mb-4">
// //                   <button
// //                     onClick={() => setActiveTab("students")}
// //                     className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
// //                       activeTab === "students"
// //                         ? "bg-white text-gray-900 shadow-sm"
// //                         : "text-gray-600 hover:text-gray-900"
// //                     }`}
// //                   >
// //                     Find Jobs
// //                   </button>
// //                   <button
// //                     onClick={() => setActiveTab("companies")}
// //                     className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
// //                       activeTab === "companies"
// //                         ? "bg-white text-gray-900 shadow-sm"
// //                         : "text-gray-600 hover:text-gray-900"
// //                     }`}
// //                   >
// //                     Find Talent
// //                   </button>
// //                 </div>

// //                 <div className="space-y-3">
// //                   <div className="relative">
// //                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
// //                     <Input
// //                       type="text"
// //                       placeholder={
// //                         activeTab === "students" ? "Search jobs, internships..." : "Search for talent, skills..."
// //                       }
// //                       value={jobSearch}
// //                       onChange={(e) => setJobSearch(e.target.value)}
// //                       className="pl-10 h-11 bg-white border-gray-200 focus:border-blue-500 text-gray-900 placeholder:text-gray-500 rounded-lg text-sm"
// //                     />
// //                   </div>

// //                   <div className="relative">
// //                     <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
// //                     <Input
// //                       type="text"
// //                       placeholder="Enter location..."
// //                       value={location}
// //                       onChange={(e) => setLocation(e.target.value)}
// //                       className="pl-10 h-11 bg-white border-gray-200 focus:border-blue-500 text-gray-900 placeholder:text-gray-500 rounded-lg text-sm"
// //                     />
// //                   </div>

// //                   <Button
// //                     onClick={handleSearch}
// //                     className="w-full h-11 bg-primary  text-white font-semibold rounded-lg"
// //                   >
// //                     <Search className="h-4 w-4 mr-2" />
// //                     {activeTab === "students" ? "Find Opportunities" : "Find Talent"}
// //                   </Button>
// //                 </div>

// //                 {/* Quick Links */}
// //                 {/* <div className="mt-1 pt-3 border-t border-gray-100">
// //                   <p className="text-xs text-gray-500 mb-2">Popular:</p>
// //                   <div className="flex flex-wrap gap-1">
// //                     {getPopularTerms().map((term) => (
// //                       <button
// //                         key={term}
// //                         onClick={() => setJobSearch(term)}
// //                         className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded transition-colors"
// //                       >
// //                         {term}
// //                       </button>
// //                     ))}
// //                   </div>
// //                 </div> */}
// //               </div>
// //             </div>

// //             {/* Right Side - Stats or Additional Content */}
// //             <div className="hidden md:block">
// //               <div className="grid grid-cols-2 gap-6">
// //                 <div className="text-center">
// //                   <div className="text-3xl font-bold text-gray-900 mb-1">10K+</div>
// //                   <div className="text-sm text-gray-600">Active Students</div>
// //                 </div>
// //                 <div className="text-center">
// //                   <div className="text-3xl font-bold text-gray-900 mb-1">500+</div>
// //                   <div className="text-sm text-gray-600">Companies</div>
// //                 </div>
// //                 <div className="text-center">
// //                   <div className="text-3xl font-bold text-gray-900 mb-1">1K+</div>
// //                   <div className="text-sm text-gray-600">Mentors</div>
// //                 </div>
// //                 <div className="text-center">
// //                   <div className="text-3xl font-bold text-gray-900 mb-1">95%</div>
// //                   <div className="text-sm text-gray-600">Success Rate</div>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </section>
// //   )
// // }
