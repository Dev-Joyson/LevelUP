"use client"

import { useState } from "react"
import { Search, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function HeroSection() {
  const [activeTab, setActiveTab] = useState<"students" | "companies">("students")
  const [jobSearch, setJobSearch] = useState("")
  const [location, setLocation] = useState("")

  const handleSearch = () => {
    console.log("Searching for:", { jobSearch, location, userType: activeTab })
    // Handle search logic here
  }

  const getPopularTerms = () => {
    return activeTab === "students"
      ? ["Software", "Design", "Marketing", "Remote"]
      : ["Developers", "Designers", "Interns", "Graduates"]
  }

  return (
    <section className="py-15">
      <div className="">
        {/* Hero Banner with Integrated Search */}
        <div className="bg-white relative overflow-hidden">
          {/* Content Grid */}
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            {/* Left Side - Content + Search */}
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Unlock Your <span className="text-primary">Future</span> With US
              </h1>
              <p className="text-base  text-gray-500 mb-8 leading-relaxed">
                Connect with top companies and experienced mentors to kickstart your career. Gain real-world experience
                through internships and mentorship programs.
              </p>

              {/* Compact Search Section */}
              <div className="bg-[#f7f7fa] backdrop-blur-sm rounded-xl p-4 border border-white/20 ">
                {/* Toggle Buttons */}
                <div className="flex rounded-lg bg-gray-100 p-1 mb-4">
                  <button
                    onClick={() => setActiveTab("students")}
                    className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                      activeTab === "students"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Find Jobs
                  </button>
                  <button
                    onClick={() => setActiveTab("companies")}
                    className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                      activeTab === "companies"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Find Talent
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder={
                        activeTab === "students" ? "Search jobs, internships..." : "Search for talent, skills..."
                      }
                      value={jobSearch}
                      onChange={(e) => setJobSearch(e.target.value)}
                      className="pl-10 h-11 bg-white border-gray-200 focus:border-blue-500 text-gray-900 placeholder:text-gray-500 rounded-lg text-sm"
                    />
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Enter location..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10 h-11 bg-white border-gray-200 focus:border-blue-500 text-gray-900 placeholder:text-gray-500 rounded-lg text-sm"
                    />
                  </div>

                  <Button
                    onClick={handleSearch}
                    className="w-full h-11 bg-primary  text-white font-semibold rounded-lg mt-4"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {activeTab === "students" ? "Find Opportunities" : "Find Talent"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Side - SVG Illustration */}
            <div className="hidden md:flex justify-center items-center">
              <img
                src="/mentor-support.svg"
                alt="Mentor helping employee climb up - representing career growth and mentorship"
                className=" w-full h-auto max-w-3xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

















// "use client"

// import { useState } from "react"
// import { Search, MapPin } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"

// export function HeroSection() {
//   const [jobSearch, setJobSearch] = useState("")
//   const [location, setLocation] = useState("")
//   const [activeTab, setActiveTab] = useState<"students" | "companies">("students")

//   const handleSearch = () => {
//     console.log("Searching for:", { jobSearch, location })
//     // Handle search logic here
//   }

//   const getPopularTerms = () => {
//     return activeTab === "students"
//       ? ["Software", "Design", "Marketing", "Remote"]
//       : ["Developers", "Designers", "Interns", "Graduates"]
//   }

//   return (
//     <section className="py-8 ">
//       <div className="container mx-auto px-4">
//         {/* Hero Banner with Integrated Search */}
//         {/* <div className="bg-gradient-to-r from-primary via-c to-[#535c91] rounded-3xl p-8 md:p-12 relative overflow-hidden"> */}
//         {/* <div className="bg-gradient-to-t from-[#3d446a] to-[#d9dae8] rounded-3xl p-8 md:p-12 relative overflow-hidden"> */}
//         <div className="bg-gradient-to-t from-[#3d446a] via-[#d9dae8] to-[#f8f8fb] rounded-3xl p-8 md:p-12 relative overflow-hidden">
//           {/* Decorative Elements */}
//           {/* <div className="absolute right-8 top-8 opacity-20">
//             <svg width="200" height="200" viewBox="0 0 200 200" className="text-green-600">
//               <path
//                 d="M100 20C120 20 140 40 140 60C140 80 120 100 100 100C80 100 60 80 60 60C60 40 80 20 100 20Z"
//                 fill="currentColor"
//               />
//               <path
//                 d="M80 80C90 80 100 90 100 100C100 110 90 120 80 120C70 120 60 110 60 100C60 90 70 80 80 80Z"
//                 fill="currentColor"
//               />
//               <path
//                 d="M120 80C130 80 140 90 140 100C140 110 130 120 120 120C110 120 100 110 100 100C100 90 110 80 120 80Z"
//                 fill="currentColor"
//               />
//             </svg>
//           </div> */}

//           {/* <div className="absolute left-8 bottom-8 opacity-20">
//             <svg width="150" height="150" viewBox="0 0 150 150" className="text-green-500">
//               <path
//                 d="M75 10C85 10 95 20 95 30C95 40 85 50 75 50C65 50 55 40 55 30C55 20 65 10 75 10Z"
//                 fill="currentColor"
//               />
//               <path d="M75 50L75 140M55 70L95 70M60 90L90 90M65 110L85 110" stroke="currentColor" strokeWidth="8" />
//             </svg>
//           </div> */}

//           {/* Content Grid */}
//           <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
//             {/* Left Side - Content + Search */}
//             <div>
//               <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
//                 LevelUp: Your Launchpad to Success
//               </h1>
//               <p className="text-base md:text-lg text-gray-700 mb-8 leading-relaxed">
//                 Connect with top companies and experienced mentors to kickstart your career. Gain real-world experience
//                 through internships and mentorship programs.
//               </p>

//               {/* Compact Search Section */}
//               <div className="bg-[#f7f7fa] backdrop-blur-sm rounded-xl p-4 border border-white/20">
//                 {/* Toggle Buttons */}
//                 <div className="flex rounded-lg bg-gray-100 p-1 mb-4">
//                   <button
//                     onClick={() => setActiveTab("students")}
//                     className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
//                       activeTab === "students"
//                         ? "bg-white text-gray-900 shadow-sm"
//                         : "text-gray-600 hover:text-gray-900"
//                     }`}
//                   >
//                     Find Jobs
//                   </button>
//                   <button
//                     onClick={() => setActiveTab("companies")}
//                     className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
//                       activeTab === "companies"
//                         ? "bg-white text-gray-900 shadow-sm"
//                         : "text-gray-600 hover:text-gray-900"
//                     }`}
//                   >
//                     Find Talent
//                   </button>
//                 </div>

//                 <div className="space-y-3">
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <Input
//                       type="text"
//                       placeholder={
//                         activeTab === "students" ? "Search jobs, internships..." : "Search for talent, skills..."
//                       }
//                       value={jobSearch}
//                       onChange={(e) => setJobSearch(e.target.value)}
//                       className="pl-10 h-11 bg-white border-gray-200 focus:border-blue-500 text-gray-900 placeholder:text-gray-500 rounded-lg text-sm"
//                     />
//                   </div>

//                   <div className="relative">
//                     <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <Input
//                       type="text"
//                       placeholder="Enter location..."
//                       value={location}
//                       onChange={(e) => setLocation(e.target.value)}
//                       className="pl-10 h-11 bg-white border-gray-200 focus:border-blue-500 text-gray-900 placeholder:text-gray-500 rounded-lg text-sm"
//                     />
//                   </div>

//                   <Button
//                     onClick={handleSearch}
//                     className="w-full h-11 bg-primary  text-white font-semibold rounded-lg"
//                   >
//                     <Search className="h-4 w-4 mr-2" />
//                     {activeTab === "students" ? "Find Opportunities" : "Find Talent"}
//                   </Button>
//                 </div>

//                 {/* Quick Links */}
//                 {/* <div className="mt-1 pt-3 border-t border-gray-100">
//                   <p className="text-xs text-gray-500 mb-2">Popular:</p>
//                   <div className="flex flex-wrap gap-1">
//                     {getPopularTerms().map((term) => (
//                       <button
//                         key={term}
//                         onClick={() => setJobSearch(term)}
//                         className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded transition-colors"
//                       >
//                         {term}
//                       </button>
//                     ))}
//                   </div>
//                 </div> */}
//               </div>
//             </div>

//             {/* Right Side - Stats or Additional Content */}
//             <div className="hidden md:block">
//               <div className="grid grid-cols-2 gap-6">
//                 <div className="text-center">
//                   <div className="text-3xl font-bold text-gray-900 mb-1">10K+</div>
//                   <div className="text-sm text-gray-600">Active Students</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-3xl font-bold text-gray-900 mb-1">500+</div>
//                   <div className="text-sm text-gray-600">Companies</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-3xl font-bold text-gray-900 mb-1">1K+</div>
//                   <div className="text-sm text-gray-600">Mentors</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-3xl font-bold text-gray-900 mb-1">95%</div>
//                   <div className="text-sm text-gray-600">Success Rate</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }
