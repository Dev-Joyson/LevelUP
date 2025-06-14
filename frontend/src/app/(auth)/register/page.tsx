"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MultiSelect } from "@/components/multi-select"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function RegistrationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get("role") || "student"

  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [password, setPassword] = useState("")

  // Common dynamic fields
  const [university, setUniversity] = useState("")
  const [graduationYear, setGraduationYear] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [companyName, setCompanyName] = useState("")
  const [position, setPosition] = useState("")

  const [step, setStep] = useState(1)
  const totalSteps = 2

  const skillOptions = [
    "JavaScript", "Python", "React", "Node.js", "Java",
    "C++", "Data Analysis", "Machine Learning", "UI/UX Design", "Project Management"
  ]

  const universityOptions = [
    "University of Colombo", "University of Peradeniya", "University of Moratuwa",
    "University of Jaffna", "University of Ruhuna", "University of Kelaniya",
    "University of Sri Jayewardenepura", "University of Sabaragamuwa", "University of Wayamba",
    "University of Uva Wellassa", "University of the Visual & Performing Arts",
    "Open University of Sri Lanka", "Eastern University, Sri Lanka",
    "South Eastern University of Sri Lanka", "Rajarata University of Sri Lanka"
  ]

  const handleContinue = async () => {
    if (step === 1) {
      if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
        toast.error("Please fill out all fields before continuing.")
        return
      }
      setStep(2)
    } else {
      let extra: any = {
        firstname: firstName,
        lastname: lastName
      }

      if (role === "student") {
        if (!university || !graduationYear || skills.length === 0) {
          toast.error("Please complete all profile details.")
          return
        }
        extra.university = university
        extra.graduationYear = graduationYear
        extra.skills = skills
      } else if (role === "mentor") {
        if (!position || skills.length === 0) {
          toast.error("Please fill mentor profile fields.")
          return
        }
        extra.position = position
        extra.skills = skills
      } else if (role === "company") {
        if (!companyName || !position) {
          toast.error("Please fill company profile fields.")
          return
        }
        extra.companyName = companyName
        extra.position = position
      }

      try {
        const response = await fetch('http://localhost:4000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role, extra }),
        })

        if (response.ok) {
          toast.success('Registration successful!')
          router.push('/login')
        } else {
          const error = await response.json()
          toast.error(error.message || "Registration failed")
        }
      } catch (err) {
        toast.error("Server error. Please try again later.")
      }
    }
  }

  const progressPercentage = (step / totalSteps) * 100

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <ToastContainer />
      <div className="w-full max-w-md bg-white rounded-lg border-1 border-gray-200 p-8">
        <div>
          <p className="text-[#535c91] text-2xl text-center font-bold">Level<span className="text-primary">UP</span></p>
          <p className="text-sm text-gray-500 text-center mb-5">Register</p>
          <h2 className="text-[20px] font-semibold mb-5 text-primary">
            {step === 1 ? `${role.charAt(0).toUpperCase() + role.slice(1)} registration` : "Complete your profile"}
          </h2>

          {step === 2 && (
            <div className="mb-4">
              <button onClick={() => setStep(1)} className="text-sm text-blue-700 underline cursor-pointer">Back</button>
            </div>
          )}

          <div className="mb-8">
            <div className="w-full bg-gray-200 h-1 rounded-full">
              <div className="bg-green-500 h-1 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1/2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1" />
                </div>
                <div className="w-1/2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {role === "student" && (
                <>
                  <div>
                    <Label>University</Label>
                    <Select value={university} onValueChange={setUniversity}>
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Select university" />
                      </SelectTrigger>
                      <SelectContent>
                        {universityOptions.map((u) => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Graduation Year</Label>
                    <Select value={graduationYear} onValueChange={setGraduationYear}>
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Select graduation year" />
                      </SelectTrigger>
                      <SelectContent>
                        {["2024", "2025", "2026", "2027", "2028"].map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Skills</Label>
                    <MultiSelect options={skillOptions} selectedValues={skills} onChange={setSkills} placeholder="Select skills" />
                  </div>
                </>
              )}

              {role === "mentor" && (
                <>
                  <div>
                    <Label>Current Position</Label>
                    <Input value={position} onChange={(e) => setPosition(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Expertise / Skills</Label>
                    <MultiSelect options={skillOptions} selectedValues={skills} onChange={setSkills} placeholder="Select skills" />
                  </div>
                </>
              )}

              {role === "company" && (
                <>
                  <div>
                    <Label>Company Name</Label>
                    <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Position (e.g., HR Manager)</Label>
                    <Input value={position} onChange={(e) => setPosition(e.target.value)} className="mt-1" />
                  </div>
                </>
              )}
            </div>
          )}

          <Button onClick={handleContinue} className="w-full mt-6 bg-primary text-white py-2 rounded">
            {step === totalSteps ? "Sign Up" : "Continue"}
          </Button>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
            </p>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>
              This site is protected by reCAPTCHA and the Google{" "}
              <Link href="#" className="text-blue-600 hover:underline">Privacy Policy</Link> and{" "}
              <Link href="#" className="text-blue-600 hover:underline">Terms of Service</Link> apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}























// "use client"

// import { useState } from "react"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import { MultiSelect } from "@/components/multi-select"
// import { toast } from 'react-toastify'
// import { ToastContainer } from 'react-toastify'
// import 'react-toastify/dist/ReactToastify.css'
// import { useRouter } from 'next/navigation'

// export default function StudentRegistration() {
//   const router = useRouter()
//   const [email, setEmail] = useState("")
//   const [firstName, setFirstName] = useState("")
//   const [lastName, setLastName] = useState("")
//   const [password, setPassword] = useState("")
//   const [university, setUniversity] = useState("")
//   const [graduationYear, setGraduationYear] = useState("")
//   const [skills, setSkills] = useState<string[]>([])
//   const [step, setStep] = useState(1)
//   const totalSteps = 2

//   const skillOptions = [
//     "JavaScript",
//     "Python",
//     "React",
//     "Node.js",
//     "Java",
//     "C++",
//     "Data Analysis",
//     "Machine Learning",
//     "UI/UX Design",
//     "Project Management",
//   ]

//   const universityOptions = [
//     "University of Colombo",
//     "University of Peradeniya",
//     "University of Moratuwa",
//     "University of Jaffna",
//     "University of Ruhuna",
//     "University of Kelaniya",
//     "University of Sri Jayewardenepura",
//     "University of Sabaragamuwa",
//     "University of Wayamba",
//     "University of Uva Wellassa",
//     "University of the Visual & Performing Arts",
//     "Open University of Sri Lanka",
//     "Eastern University, Sri Lanka",
//     "South Eastern University of Sri Lanka",
//     "Rajarata University of Sri Lanka",
//   ]

//   const handleContinue = async () => {
//     if (step === 1) {
//       // Validate Step 1 fields
//       if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
//         toast.error("Please fill out all fields before continuing.");
//         return;
//       }
//       setStep(2)
//     } else {
//       // Validate Step 2 fields
//       if (!university || !graduationYear || skills.length === 0) {
//         toast.error("Please complete all profile details before signing up.");
//         return;
//       }
  
//       try {
//         const response = await fetch('http://localhost:4000/api/auth/register', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             email,
//             password,
//             role: 'student',
//             extra: {
//               firstname: firstName,
//               lastname: lastName,
//               university,
//               graduationYear,
//               skills,
//             },
//           }),
//         });
  
//         if (response.ok) {
//           toast.success('Registration successful!');
//           router.push('/login');
//         } else {
//           const error = await response.json();
//           toast.error(error.message || "Registration failed");
//         }
//       } catch (error) {
//         console.error('Error during registration:', error);
//         toast.error("Server error. Please try again later.");
//       }
//     }
//   }
  

//   const progressPercentage = (step / totalSteps) * 100

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-white">
//       <ToastContainer />
//       <div className="w-full max-w-md bg-white rounded-lg border-1 border-gray-200 p-8">
//         <div>
//         <p className="text-[#535c91] text-2xl text-center font-bold">Level<span className="text-primary">UP</span></p>
//         <p className="text-sm text-gray-500 text-center mb-5">Register</p>
//           <h2 className="text-[20px] font-semibold mb-5 text-primary">
//             {step === 1 ? "Student registration" : "Complete your profile"}
            
//           </h2>
          

//           {/* Back to registration (only on step 2) */}
//           {step === 2 && (
//             <div className="mb-4">
//               <button
//                 onClick={() => setStep(1)}
//                 className="text-sm text-blue-700 underline cursor-pointer"
//               >
//                 Back
//               </button>
//             </div>
//           )}

//           {/* Progress bar */}
//           <div className="mb-8">
//             <div className="w-full bg-gray-200 h-1 rounded-full">
//               <div
//                 className="bg-green-500 h-1 rounded-full"
//                 style={{ width: `${progressPercentage}%` }}
//               ></div>
//             </div>
//           </div>

//           {/* Step 1 */}
//           {step === 1 && (
//             <>
//               <div className="space-y-4">
//               <div className="flex gap-4">
//         <div className="w-1/2">
//           <Label htmlFor="firstName">First name</Label>
//           <Input
//             id="firstName"
//             value={firstName}
//             onChange={(e) => setFirstName(e.target.value)}
//             className="mt-1"
//           />
//         </div>

//         <div className="w-1/2">
//           <Label htmlFor="lastName">Last name</Label>
//           <Input
//             id="lastName"
//             value={lastName}
//             onChange={(e) => setLastName(e.target.value)}
//             className="mt-1"
//           />
//         </div>
//       </div>

//                 <div>
//                   <Label htmlFor="email">Email</Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="mt-1"
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="password">Password</Label>
//                   <Input
//                     id="password"
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="mt-1"
//                   />
//                 </div>
//               </div>
//             </>
//           )}

//           {/* Step 2 */}
//           {step === 2 && (
//             <>
//               <div className="space-y-4">
//                 <div>
//                   <Label htmlFor="university">University</Label>
//                   <Select
//                     onValueChange={setUniversity}
//                     value={university}
//                   >
//                     <SelectTrigger className="mt-1 w-full">
//                       <SelectValue placeholder="Select university" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {universityOptions.map((option) => (
//                         <SelectItem key={option} value={option}>
//                           {option}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div>
//                   <Label htmlFor="graduationYear">
//                     Graduation Year (Year and Month)
//                   </Label>
//                   <Select
//                     onValueChange={setGraduationYear}
//                     value={graduationYear}
//                   >
//                     <SelectTrigger className="mt-1 w-full">
//                       <SelectValue placeholder="Select graduation year" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="2024">2024</SelectItem>
//                       <SelectItem value="2025">2025</SelectItem>
//                       <SelectItem value="2026">2026</SelectItem>
//                       <SelectItem value="2027">2027</SelectItem>
//                       <SelectItem value="2028">2028</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div>
//                   <Label htmlFor="skills">Skills</Label>
//                   <div className="mt-1">
//                     <MultiSelect
//                       options={skillOptions}
//                       selectedValues={skills}
//                       onChange={setSkills}
//                       placeholder="Select skills"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}

//           {/* Continue / Submit button */}
//           <Button
//             onClick={handleContinue}
//             className="w-full mt-6 bg-primary text-white py-2 rounded"
//           >
//             {step === totalSteps ? "Sign Up" : "Continue"}
//           </Button>

//           {/* Footer Link */}
//           <div className="mt-4 text-center">
//             <p className="text-sm text-gray-500">
//               Already have an account?{" "}
//               <Link href="/login" className="text-blue-600 hover:underline">
//                 Login
//               </Link>
//             </p>
//           </div>

//           <div className="mt-6 text-center text-xs text-gray-500">
//             <p>
//               This site is protected by reCAPTCHA and the Google{" "}
//               <Link href="#" className="text-blue-600 hover:underline">
//                 Privacy Policy
//               </Link>{" "}
//               and{" "}
//               <Link href="#" className="text-blue-600 hover:underline">
//                 Terms of Service
//               </Link>{" "}
//               apply.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
