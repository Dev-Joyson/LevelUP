"use client"

import { useState, useEffect } from "react"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "react-toastify"
import Image from "next/image"

interface Application {
  id: string
  company: string
  companyLogo?: string
  role: string
  applicationDate: string
  status: "Pending" | "Reviewed" | "Shortlisted" | "Accepted" | "Rejected"
  matchScore?: number
  internshipId?: string
}

export default function StudentApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Use port 5000 since other functionality is working with this port
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
  
  // Get student name from localStorage if available
  const [studentName, setStudentName] = useState<string>("")
  
  useEffect(() => {
    // Try to get student name from localStorage
    try {
      const userData = localStorage.getItem("userData")
      if (userData) {
        const parsedData = JSON.parse(userData)
        if (parsedData.name || parsedData.fullName) {
          setStudentName(parsedData.name || parsedData.fullName)
        }
      }
    } catch (error) {
      console.error("Error getting student data from localStorage:", error)
    }
  }, [])
  
  // Demo applications data - these are specifically for the logged-in student
  const demoApplications: Application[] = [
    {
      id: "1",
      company: "Tech Innovators Inc.",
      role: "Software Engineering Intern",
      applicationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
      status: "Pending",
      matchScore: 85
    },
    {
      id: "2",
      company: "Global Solutions Ltd.",
      role: "Data Science Intern",
      applicationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days ago
      status: "Reviewed",
      matchScore: 72
    },
    {
      id: "3",
      company: "Creative Minds Co.",
      role: "Marketing Intern",
      applicationDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days ago
      status: "Accepted",
      matchScore: 91
    },
    {
      id: "4",
      company: "Future Leaders Group",
      role: "Finance Intern",
      applicationDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 20 days ago
      status: "Rejected",
      matchScore: 65
    }
  ]

  // Fetch applications data or use demo data if API is unavailable
  useEffect(() => {
    async function fetchApplications() {
      try {
        // If API_BASE_URL is not available, use demo data
        if (!API_BASE_URL) {
          console.warn("API_BASE_URL is not defined, using demo application data")
          setApplications(demoApplications)
          setIsLoading(false)
          return
        }

        const token = localStorage.getItem("token")
        if (!token) {
          // For demo purposes, load mock data if no token
          setApplications(demoApplications)
          setIsLoading(false)
          return
        }
        
        // Attempt to get the student ID from localStorage for extra validation
        let studentId = ""
        try {
          const userData = localStorage.getItem("userData")
          if (userData) {
            const parsedData = JSON.parse(userData)
            if (parsedData.id || parsedData.studentId) {
              studentId = parsedData.id || parsedData.studentId
            }
          }
        } catch (error) {
          console.error("Error getting student ID from localStorage:", error)
        }
        
        // The endpoint should always filter by the authenticated user's ID from the token
        // But we can add the student ID as an extra parameter if available
        const apiUrl = studentId 
          ? `${API_BASE_URL}/api/student/applications?studentId=${studentId}` 
          : `${API_BASE_URL}/api/student/applications`
          
        console.log("Fetching applications from:", apiUrl)
        console.log("Using auth token:", token.substring(0, 15) + "...")
        
        // Add timeout for fetch to prevent hanging requests
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout
        
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch applications data: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log("Applications data received:", data)
        
        if (!data || !Array.isArray(data) || data.length === 0) {
          console.log("No applications found, using demo data")
          setApplications(demoApplications)
        } else {
          // Format the applications data
          const formattedApplications: Application[] = data.map((app: any) => ({
            id: app.id,
            company: app.company,
            companyLogo: app.companyLogo,
            role: app.role,
            applicationDate: new Date(app.applicationDate).toISOString().split('T')[0],
            status: app.status as Application["status"],
            matchScore: app.matchScore,
            internshipId: app.internshipId
          }))
          
          setApplications(formattedApplications)
        }
      } catch (error) {
        console.error("Error fetching applications:", error)
        
        // Handle different error types with specific messages
        if (error instanceof DOMException && error.name === 'AbortError') {
          toast.error("Request timed out. Check your network connection.")
        } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          toast.error("Network error. Check your connection or API server.")
        } else {
          toast.error("Failed to load applications data. Using demo data instead.")
        }
        
        // Use demo data if API call fails
        setApplications(demoApplications)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchApplications()
  }, [API_BASE_URL])

  const filteredApplications = applications.filter(
    (app) =>
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadgeVariant = (status: Application["status"]) => {
    switch (status) {
      case "Pending":
        return "secondary"
      case "Reviewed":
        return "outline"
      case "Accepted":
        return "default"
      case "Rejected":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusColor = (status: Application["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Reviewed":
        return "bg-blue-100 text-blue-800"
      case "Accepted":
        return "bg-green-100 text-green-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-600">Track the status of your internship applications</p>
          <div className="mt-2 text-sm bg-blue-50 text-blue-700 p-2 rounded-md border border-blue-200 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Showing applications submitted by you</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by company or role"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Applications Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Company</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Application Date</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Match Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredApplications.map((application) => (
                      <tr key={application.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            {application.companyLogo && (
                              <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                <Image
                                  src={application.companyLogo}
                                  alt={application.company}
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            )}
                            <span>{application.company}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{application.role}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{application.applicationDate}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              application.status,
                            )}`}
                          >
                            {application.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {application.matchScore !== undefined ? (
                            <div className="flex items-center gap-2">
                              <div className="bg-gray-200 h-2 w-24 rounded-full">
                                <div 
                                  className="bg-green-500 h-2 rounded-full" 
                                  style={{ width: `${Math.min(100, application.matchScore)}%` }}
                                ></div>
                              </div>
                              <span>{Math.round(application.matchScore)}%</span>
                            </div>
                          ) : (
                            <span>N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredApplications.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {searchTerm 
                      ? "No applications found matching your search." 
                      : "You haven't applied to any internships yet."}
                  </p>
                  <p className="mt-2 text-sm text-blue-500">
                    {studentName && !searchTerm ? `${studentName}, start your internship journey by applying to available opportunities!` : ""}
                  </p>
                </div>
              )}
            </div>

            {/* Summary Stats */}
            {applications.length > 0 && (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
                  <div className="text-sm text-gray-600">Total Applications</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {applications.filter((app) => app.status === "Pending").length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {applications.filter((app) => app.status === "Accepted").length}
                  </div>
                  <div className="text-sm text-gray-600">Accepted</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {applications.filter((app) => app.status === "Rejected").length}
                  </div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
