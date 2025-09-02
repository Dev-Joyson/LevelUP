"use client"

import { useState, useEffect } from "react"
import { Search, Loader2, Eye, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"
import Image from "next/image"
import Link from "next/link"

interface Application {
  id: string
  company: string
  companyLogo?: string
  role: string
  applicationDate: string
  status: "Pending" | "Reviewed" | "Shortlisted" | "Accepted" | "Rejected"
  matchScore?: number
  internshipId?: string
  studentId?: string
}

export default function StudentApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Use port 5000 since other functionality is working with this port
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
  console.log("API_BASE_URL:", API_BASE_URL)
  
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
          console.error("No auth token found in localStorage")
          // For demo purposes, load mock data if no token
          setApplications(demoApplications)
          setIsLoading(false)
          return
        }
        
        // Check if token format looks valid
        if (!token.includes('.') || token.trim().split('.').length !== 3) {
          console.error("Token format appears invalid:", token.substring(0, 15) + "...")
          toast.error("Authentication token appears invalid. Please try logging in again.")
          setApplications(demoApplications)
          setIsLoading(false)
          return
        }
        
        // Get the student ID from localStorage
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
        
        // Use the new application controller endpoint
        const apiUrl = `${API_BASE_URL}/api/applications/student`
        console.log("API URL:", apiUrl)
          
        console.log("🔑 Auth Debug:", {
          studentId: studentId || "from token",
          tokenPreview: token.substring(0, 15) + "...",
          user: localStorage.getItem("user"),
          userData: localStorage.getItem("userData")
        })
        
        // Add timeout for fetch to prevent hanging requests
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout
        
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        console.log("API response status:", response.status, response.statusText)
        
        if (!response.ok) {
          // Try to get more error details from the response body
          let errorDetail = '';
          try {
            const errorData = await response.json();
            errorDetail = errorData.message || JSON.stringify(errorData);
            console.error("API error response:", errorData);
          } catch (e) {
            console.error("Could not parse error response:", e);
          }
          
          throw new Error(`Failed to fetch applications data: ${response.status} ${response.statusText} ${errorDetail ? `- ${errorDetail}` : ''}`)
        }
        
        const data = await response.json()
        console.log("Applications data received:", data)
        // Debug response structure
        if (Array.isArray(data)) {
          console.log(`Received ${data.length} applications`);
          if (data.length > 0) {
            console.log("Sample application structure:", data[0]);
            
            // Debug company field
            const app = data[0];
            console.log("Company related fields:", {
              company: app.company,
              companyName: app.companyName,
              companyId: app.companyId,
              internshipId: app.internshipId,
              internshipDetails: app.internshipDetails,
              companyDetails: app.companyDetails
            });
          }
        } else {
          console.log("Unexpected data format - not an array:", typeof data);
        }
        
        if (!data) {
          console.error("API returned null or undefined data")
          toast.error("Server returned empty response")
          setApplications(demoApplications)
        } else if (!Array.isArray(data)) {
          console.error("API did not return an array:", typeof data, data)
          toast.error("Server returned unexpected data format")
          setApplications(demoApplications)
        } else if (data.length === 0) {
          console.log("No applications found (empty array returned)")
          // This is a valid state - just show empty list
          setApplications([])
        } else {
          try {
            // Debug: Log the actual API response structure
            console.log('📋 Raw API Response:', data)
            console.log('📋 First application structure:', data[0])
            
            // Format the applications data
            const formattedApplications: Application[] = data.map((app: any, index: number) => {
              // Debug: Log each application structure
              if (index < 3) { // Only log first 3 to avoid spam
                console.log(`📋 Application ${index}:`, {
                  id: app.id,
                  company: app.company,
                  companyDetails: app.companyDetails,
                  internshipDetails: app.internshipDetails,
                  fullApp: app
                })
              }
              
              // Validate required fields
              if (!app.id || !app.company || !app.role || !app.applicationDate || !app.status) {
                console.warn("Application missing required fields:", app)
              }
              
              // Enhanced company name extraction
              const companyName = app.company || 
                                 app.companyName || 
                                 app.companyDetails?.name || 
                                 app.internshipDetails?.companyName || 
                                 app.internshipDetails?.company?.name ||
                                 'Unknown Company'
              
              const companyLogo = app.companyLogo || 
                                 app.companyDetails?.logo || 
                                 app.internshipDetails?.companyLogo ||
                                 app.internshipDetails?.company?.logo
              
              console.log(`📋 Extracted company for app ${index}: "${companyName}"`)
              
              return {
                id: app.id || app._id || `unknown-${Math.random()}`,
                company: companyName,
                companyLogo: companyLogo,
                role: app.role || app.internshipDetails?.title || 'Unknown Role',
                applicationDate: app.applicationDate ? new Date(app.applicationDate).toISOString().split('T')[0] : 'Unknown Date',
                status: (app.status || 'Pending') as Application["status"],
                matchScore: app.matchScore?.total || app.matchScore,
                internshipId: app.internshipId || app.internship_id
              }
            })
            
            setApplications(formattedApplications)
          } catch (err) {
            console.error("Error formatting application data:", err)
            toast.error("Error processing application data")
            setApplications(demoApplications)
          }
        }
      } catch (error) {
        console.error("Error fetching applications:", error)
        
        // Handle different error types with specific messages
        if (error instanceof DOMException && error.name === 'AbortError') {
          toast.error("Request timed out. Check your network connection.")
        } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          toast.error("Network error. Check your connection or API server.")
        } else {
          toast.error(`Failed to load applications data: ${error instanceof Error ? error.message : 'Unknown error'}. Using demo data instead.`)
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
    (app) => {
      const matchesSearch = 
        app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.role.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = !statusFilter || app.status === statusFilter
      
      return matchesSearch && matchesStatus
    }
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
            <span>{studentName ? `Showing ${studentName}'s applications` : "Showing applications submitted by you"}</span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by company or role"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500"
            />
          </div>
          
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-12 px-4 border border-gray-200 rounded-md bg-gray-50 text-gray-900"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
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
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
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
                            <span className="font-medium">{application.company || "Unknown Company"}</span>
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
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="View Details"
                              asChild
                            >
                              <Link href={`/applications/${application.id}`} target="_blank">
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {application.internshipId && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="View Internship"
                                asChild
                              >
                                <Link href={`/internship/${application.internshipId}`} target="_blank">
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                          </div>
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
              <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
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
                  <div className="text-2xl font-bold text-blue-600">
                    {applications.filter((app) => app.status === "Reviewed").length}
                  </div>
                  <div className="text-sm text-gray-600">Reviewed</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {applications.filter((app) => app.status === "Shortlisted").length}
                  </div>
                  <div className="text-sm text-gray-600">Shortlisted</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {applications.filter((app) => app.status === "Accepted").length}
                  </div>
                  <div className="text-sm text-gray-600">Accepted</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center col-span-2">
                  <div className="text-2xl font-bold text-red-600">
                    {applications.filter((app) => app.status === "Rejected").length}
                  </div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center col-span-3">
                  <div className="text-lg font-medium text-gray-900 mb-1">Average Match Score</div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="bg-gray-200 h-3 w-36 rounded-full">
                      <div 
                        className="bg-green-500 h-3 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, applications.reduce((acc, app) => acc + (app.matchScore || 0), 0) / 
                            (applications.filter(app => app.matchScore !== undefined).length || 1))}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-xl font-bold">
                      {Math.round(applications.reduce((acc, app) => acc + (app.matchScore || 0), 0) / 
                        (applications.filter(app => app.matchScore !== undefined).length || 1))}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
