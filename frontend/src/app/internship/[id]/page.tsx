import { notFound } from "next/navigation"
import { Bookmark, Briefcase, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Job } from "@/components/InterviewComponents/InternshipSidebar"

// Sample job data - in a real app, this would come from an API or database
const jobListings: Record<
  string,
  Job & {
    description?: string
    aboutRole?: string
    requirements?: string[]
    benefits?: string
    qualifications?: { skill: string; match: boolean }[]
    jobType?: string

  }
> = {
  "virtusa-mlops": {
    id: "virtusa-mlops",
    company: {
      name: "virtusa",
    },
    title: "MLOps Engineer",
    location: "Colombo, Srilanka",
    salary: "30,000 LKR - 50,0000 LKR",
    description:
      "Built for consumers and companies, alike. In a world driven by data, we believe consumers and businesses can coexist. Our founders had a vision to empower consumers to leverage their greatest asset—their data—in exchange for modern financial services. Built with this vision in mind, our platform allows consumers to access savings tools, earned wages and rewards without cost or hidden fees. In exchange, they give permission to use their real-time data for research, insights and targeted advertising.",
    qualifications: [
      { skill: "Management", match: true },
      { skill: "Leadership", match: true },
      { skill: "IT", match: true },
    ],
    aboutRole:
      "Built for consumers and companies, alike. In a world driven by data, we believe consumers and businesses can coexist. Our founders had a vision to empower consumers to leverage their greatest asset—their data—in exchange for modern financial services. Built with this vision in mind, our platform allows consumers to access savings tools, earned wages and rewards without cost or hidden fees. In exchange, they give permission to use their real-time data for research, insights and targeted advertising.\n\nAt Attain, your contribution will help us build a more equitable and efficient data sharing ecosystem—whether helping consumers access modern financial services directly or helping businesses leverage data to make better decisions directly with hands-on leaders and mission-driven individuals.\n\nAbout the role\nWe are looking for a machine learning (ML) and data science-based MLOps Engineer to join our team. To meet the growing needs of our business, we are searching for an experienced Machine Learning Operations Engineer to support the development of a machine learning platform that will enable our data scientists across the company to easily build and deploy machine learning solutions and data science applications components. The person will be responsible for building and maintaining machine learning models and algorithms into AI products for our consumers.",
    requirements: [
      "2+ years of hands-on experience building and deploying machine learning models",
      "Experience in building and deploying offline and online machine learning services in production",
      "Good understanding of machine learning software and infrastructure development",
      "Proficiency in Python",
    ],
    benefits:
      "At Attain, we are passionate about finding people to continuously help us grow our organization. We encourage you to apply even if you don't meet all the requirements. If you're excited about this role but don't see something that immediately fits, we will keep you in mind for future opportunities.",
  },
  "softsora-it": {
    id: "softsora-it",
    company: {
      name: "Softsora",
    },
    title: "IT Engineer",
    location: "Colombo, Srilanka",
    salary: "30,000 LKR - 50,0000 LKR",
    description: "Job description for IT Engineer position at Softsora.",
    qualifications: [
      { skill: "Networking", match: true },
      { skill: "System Administration", match: false },
      { skill: "Cloud Computing", match: true },
    ],
  },
  "coginitix-python": {
    id: "coginitix-python",
    company: {
      name: "Coginitix",
    },
    title: "Python Developer",
    location: "Colombo, Srilanka",
    salary: "30,000 LKR - 50,0000 LKR",
    description: "Job description for Python Developer position at Coginitix.",
    qualifications: [
      { skill: "Python", match: true },
      { skill: "Django", match: false },
      { skill: "Flask", match: true },
    ],
  },
  "rootcode-ai": {
    id: "rootcode-ai",
    company: {
      name: "rootCode",
    },
    title: "AI/ML Engineer",
    location: "Colombo, Srilanka",
    salary: "30,000 LKR - 50,0000 LKR",
    description: "Job description for AI/ML Engineer position at rootCode.",
    qualifications: [
      { skill: "Machine Learning", match: true },
      { skill: "TensorFlow", match: false },
      { skill: "PyTorch", match: true },
    ],
  },
}

export default function InternshipDetailPage({ params }: { params: { id: string } }) {
  const job = jobListings[params.id]

  if (!job) {
    notFound()
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="text-gray-600">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{job.company.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bookmark className="h-7 w-7" />
          </Button>
          <Button className="bg-primary text-white  hover:bg-white hover:border-1 hover:border-primary hover:text-primary rounded-md px-9">Apply</Button>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mt-2">{job.title}</h2>
      <div className="flex items-center gap-2 mt-1 text-gray-500">
        <span className="text-sm">{job.location}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-gray-500"></span>
        <span className="text-sm">{job.salary}</span>
      </div>

      <div className="mt-4 border-t pt-6">
        <h3 className="text-xl font-semibold mb-4">Your qualifications for this job</h3>
        <div className="border rounded-lg p-6 bg-white">
          <p className="mb-4 font-medium">Do you have any of these qualifications?</p>
          <div className="space-y-3">
            {job.qualifications?.map((qual, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${qual.match ? "bg-gray-200 text-black" : "bg-gray-200 text-black"}`}
                >
                  {qual.match ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                </div>
                <span>{qual.skill}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 border-t pt-6">
        <h3 className="text-xl font-bold mb-4">About this JOB</h3>
        <p className="text-gray-700 leading-relaxed">{job.description}</p>

        
      </div>

      {/* About the role section */}
      {job.aboutRole && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-bold mb-4">About the role</h3>
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">{job.aboutRole}</div>
        </div>
      )}

      {/* Requirements section */}
      {job.requirements && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-bold mb-4">You have</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            {job.requirements.map((requirement, index) => (
              <li key={index}>{requirement}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Benefits section */}
      {job.benefits && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-bold mb-4">What you'll learn from you</h3>
          <p className="text-gray-700 leading-relaxed">{job.benefits}</p>
        </div>
      )}
    </div>
  )
}
















// import { notFound } from "next/navigation"
// import { MoreHorizontal, Bookmark, Check, X } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Job } from "@/types/job"

// // Sample job data - in a real app, this would come from an API or database
// const jobListings: Record<
//   string,
//   Job & {
//     description?: string
//     qualifications?: { skill: string; match: boolean }[]
//     jobType?: string
//   }
// > = {
//   "spotify-backend": {
//     id: "spotify-backend",
//     company: {
//       name: "Spotify",
//       logo: "/placeholder.svg?height=48&width=48",
//       rating: 4.0,
//     },
//     title: "Backend Engineer II, Personalization",
//     location: "New York, NY",
//     salary: "$123K - $175K (Employer provided)",
//     postedDays: 22,
//     description:
//       "The Personalization team makes deciding what to play next easier and more enjoyable for every listener. From Blend to Discover Weekly, we're behind some of Spotify's most-loved features. We built them by understanding the world of music and podcasts better than anyone else. Join us and you'll keep millions of users listening by making great recommendations to each and every one of them.",
//     qualifications: [
//       { skill: "Java", match: true },
//       { skill: "Writing skills", match: true },
//       { skill: "System design", match: false },
//       { skill: "APIs", match: false },
//     ],
//     jobType: "Full-time",
//   },
//   "va-heart-failure": {
//     id: "va-heart-failure",
//     company: {
//       name: "VA Northern California Health Care System",
//       logo: "/placeholder.svg?height=48&width=48",
//       rating: 3.7,
//     },
//     title: "Heart Failure RN-Mather",
//     location: "Mather, CA",
//     salary: "$103K - $194K (Employer provided)",
//     postedDays: 20,
//     isEasyApply: true,
//     description:
//       "The Heart Failure RN position at VA Northern California Health Care System involves providing specialized care for veterans with heart failure. The nurse will work as part of a multidisciplinary team to manage patient care, educate patients on self-management, and coordinate care transitions.",
//     qualifications: [
//       { skill: "RN License", match: true },
//       { skill: "2+ years experience", match: true },
//       { skill: "Heart failure certification", match: false },
//       { skill: "Electronic health records", match: true },
//     ],
//     jobType: "Full-time",
//   },
//   "uc-davis-case-manager": {
//     id: "uc-davis-case-manager",
//     company: {
//       name: "UC Davis Health",
//       logo: "/placeholder.svg?height=48&width=48",
//       rating: 3.8,
//     },
//     title: "Per Diem Clinical Case Manager Transfer Center",
//     location: "Sacramento, CA",
//     salary: "$82.77 Per Hour (Employer provided)",
//     postedDays: 7,
//     description:
//       "The Per Diem Clinical Case Manager at UC Davis Health Transfer Center will facilitate patient transfers between healthcare facilities, coordinate care plans, and ensure appropriate resource allocation. This role requires strong clinical judgment and excellent communication skills.",
//     qualifications: [
//       { skill: "RN License", match: true },
//       { skill: "Case management experience", match: true },
//       { skill: "Transfer center experience", match: false },
//       { skill: "Communication skills", match: true },
//     ],
//     jobType: "Per Diem",
//   },
//   "laseraway-nurse": {
//     id: "laseraway-nurse",
//     company: {
//       name: "LaserAway",
//       logo: "/placeholder.svg?height=48&width=48",
//       rating: 2.9,
//     },
//     title: "Registered Nurse",
//     location: "Elk Grove, CA",
//     salary: "$50.00 - $55.00 Per Hour (Employer provided)",
//     postedDays: 14,
//     isEasyApply: true,
//     description:
//       "LaserAway is seeking a Registered Nurse to join our team in Elk Grove. The ideal candidate will perform aesthetic procedures including laser hair removal, injectables, and other cosmetic treatments. Training will be provided for qualified candidates.",
//     qualifications: [
//       { skill: "RN License", match: true },
//       { skill: "Aesthetic experience", match: false },
//       { skill: "Customer service", match: true },
//       { skill: "Flexibility", match: true },
//     ],
//     jobType: "Part-time",
//   },
//   "sutter-case-manager": {
//     id: "sutter-case-manager",
//     company: {
//       name: "Sutter Health",
//       logo: "/placeholder.svg?height=48&width=48",
//       rating: 3.9,
//     },
//     title: "RN Case Manager, Home Health",
//     location: "Roseville, CA",
//     salary: "$65.17 - $86.66 Per Hour (Employer provided)",
//     postedDays: 30,
//     description:
//       "The RN Case Manager at Sutter Health Home Health will coordinate patient care in the home setting, develop care plans, and collaborate with interdisciplinary teams. This role requires strong assessment skills and the ability to work independently.",
//     qualifications: [
//       { skill: "RN License", match: true },
//       { skill: "Home health experience", match: false },
//       { skill: "Case management", match: true },
//       { skill: "Documentation skills", match: true },
//     ],
//     jobType: "Full-time",
//   },
// }

// export default function InternshipDetailPage({ params }: { params: { id: string } }) {
//   const job = jobListings[params.id]

//   if (!job) {
//     notFound()
//   }

//   return (
//     <div className="p-6  flex flex-col">
        
//       <div className="flex justify-between items-start w-full">
//         <div className="flex items-center gap-4">
//           <div className="w-12 h-12 flex-shrink-0">
//             <img
//               src={job.company.logo || "/placeholder.svg"}
//               alt={job.company.name}
//               className="w-full h-full object-contain"
//             />
//           </div>
//           <div>
//             <div className="flex items-center gap-2">
//               <h1 className="text-2xl font-bold">{job.company.name}</h1>
//               <span className="text-muted-foreground">{job.company.rating}★</span>
//             </div>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           <Button variant="ghost" size="icon">
//             <MoreHorizontal className="h-5 w-5" />
//           </Button>
//           <Button variant="ghost" size="icon">
//             <Bookmark className="h-5 w-5" />
//           </Button>
//           <Button className="px-4 py-2 text-white font-semibold rounded bg-primary hover:opacity-90 cursor-pointer transition-all">Apply</Button>
//         </div>
//       </div>

//       <h2 className="text-2xl font-bold mt-6">{job.title}</h2>
//       <div className="flex items-center gap-2 mt-2 text-muted-foreground">
//         <span>{job.location}</span>
//         <span>•</span>
//         <span>{job.salary}</span>
//       </div>

//       <div className="mt-8">
//         <h3 className="text-xl font-semibold mb-4">Your qualifications for this job</h3>
//         <div className="border rounded-lg p-6">
//           <p className="mb-4">Do you have any of these qualifications?</p>
//           <div className="grid grid-cols-2 gap-4">
//             {job.qualifications?.map((qual, index) => (
//               <div key={index} className="flex items-center gap-2">
//                 <div
//                   className={`w-6 h-6 rounded-full flex items-center justify-center ${qual.match ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"}`}
//                 >
//                   {qual.match ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
//                 </div>
//                 <span>{qual.skill}</span>
//               </div>
//             ))}
//           </div>
//           <Button variant="outline" className="mt-4 w-full">
//             Show more
//           </Button>
//         </div>
//       </div>

//       <div className="mt-8">
//         <h3 className="text-lg font-semibold">Backend</h3>
//         <p className="mt-4 text-muted-foreground">{job.description}</p>

//         <div className="mt-6">
//           <h4 className="font-medium">Location</h4>
//           <p className="mt-2">{job.location}</p>
//         </div>

//         <div className="mt-6">
//           <h4 className="font-medium">Job type</h4>
//           <p className="mt-2">{job.jobType}</p>
//         </div>
//       </div>
    
//     </div>
//   )
// }
