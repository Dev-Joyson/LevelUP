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
  const [description, setDescription] = useState("")
  const [registrationDocument, setRegistrationDocument] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState("")

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB in bytes
        setUploadError("File size must be less than 5MB")
        setRegistrationDocument(null)
        return
      }
      if (file.type !== 'application/pdf') {
        setUploadError("Only PDF files are allowed")
        setRegistrationDocument(null)
        return
      }
      setUploadError("")
      setRegistrationDocument(file)
    }
  }

  const handleContinue = async () => {
    if (step === 1) {
      if (role === "company") {
        if (!email.trim() || !password.trim()) {
          toast.error("Please fill out all fields before continuing.")
          return
        }
      } else {
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
          toast.error("Please fill out all fields before continuing.")
          return
        }
      }
      setStep(2)
    } else {
      let extra: any = {}

      if (role === "company") {
        if (!companyName || !description || !registrationDocument) {
          toast.error("Please fill all company profile fields and upload registration document.")
          return
        }

        // Create FormData for file upload
        const formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)
        formData.append('role', role)
        formData.append('extra[companyName]', companyName)
        formData.append('extra[description]', description)
        formData.append('registrationDocument', registrationDocument)

        try {
          const response = await fetch('http://localhost:4000/api/auth/register', {
            method: 'POST',
            body: formData,
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
        return
      } else {
        extra.firstname = firstName
        extra.lastname = lastName
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
              {role !== "company" && (
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
              )}

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
                    <Label>Company Description</Label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md"
                      rows={4}
                      placeholder="Describe your company..."
                    />
                  </div>
                  <div>
                    <Label>Registration Document (PDF, max 5MB)</Label>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="mt-1"
                    />
                    {uploadError && (
                      <p className="text-red-500 text-sm mt-1">{uploadError}</p>
                    )}
                    {registrationDocument && (
                      <p className="text-green-500 text-sm mt-1">
                        File selected: {registrationDocument.name}
                      </p>
                    )}
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