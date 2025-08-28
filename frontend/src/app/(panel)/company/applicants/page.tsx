"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CompanySidebar } from "@/components/CompanyComponents/company-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { toast } from "sonner"
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap,
  Star,
  Calendar,
  Briefcase,
  Award
} from "lucide-react"

interface Application {
  _id: string
  student: {
    name: string
    email: string
    university?: string
    graduationYear?: string
  }
  resumeData: {
    name?: string
    email?: string
    phone?: string
    university?: string
    degree?: string
    skills?: {
      programmingLanguages?: string[]
      frameworks?: string[]
      tools?: string[]
      cloudPlatforms?: string[]
      databases?: string[]
      other?: string[]
    }
    experience?: Array<{
      company: string
      role: string
      duration: string
      description: string
    }>
    projects?: Array<{
      name: string
      description: string
      technologies: string[]
      url?: string
    }>
    gpa?: number
    certifications?: string[]
  }
  internshipId: {
    _id: string
    title: string
    domain: string
    location: string
    workMode?: string
    salary?: {
      display: string
    }
  }
  matchScore: {
    total: number
    breakdown: {
      skills: number
      projects: number
      experience: number
      gpa: number
      certifications: number
    }
    details: {
      skillsMatched: string[]
      projectsCount: number
      experienceCount: number
      gpaValue: number
      certificationsCount: number
    }
  }
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted'
  resumeUrl: string
  appliedAt: string
  coverLetter?: string
  notes?: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewed: "bg-blue-100 text-blue-800", 
  shortlisted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  accepted: "bg-purple-100 text-purple-800"
}

export default function ApplicantsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [sortBy, setSortBy] = useState("matchScore")
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

  useEffect(() => {
    fetchApplications()
  }, [pagination.page, statusFilter, sortBy])

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token")
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        ...(statusFilter && { status: statusFilter })
      })

      const response = await fetch(`${API_BASE_URL}/api/applications/company?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setApplications(data.data.applications)
          setPagination(prev => ({
            ...prev,
            ...data.data.pagination
          }))
        }
      } else {
        toast.error("Failed to fetch applications")
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
      toast.error("Error fetching applications")
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/applications/status/${applicationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success("Application status updated successfully")
        fetchApplications() // Refresh the list
      } else {
        toast.error("Failed to update application status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Error updating application status")
    }
  }

  const filteredApplications = applications.filter(app => 
    app.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.internshipId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.student.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 font-bold"
    if (score >= 60) return "text-yellow-600 font-semibold"
    return "text-red-600"
  }

  const getAllSkills = (skills: any) => {
    if (!skills) return []
    return [
      ...(skills.programmingLanguages || []),
      ...(skills.frameworks || []),
      ...(skills.tools || []),
      ...(skills.cloudPlatforms || []),
      ...(skills.databases || []),
      ...(skills.other || [])
    ]
  }

  if (loading) {
    return (
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-lg">Loading applications...</div>
            </div>
          </div>
        </div>
      </SidebarInset>
    )
  }
  return (
    <>
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-8">
            <div className="space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Job Applications</h1>
                  <p className="text-gray-600 mt-1">Review and manage applications for your internships</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm">
                    {pagination.total} Total Applications
                  </Badge>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search by name, position, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 bg-white border-gray-200"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 px-3 border border-gray-200 rounded-md bg-white"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                  <option value="accepted">Accepted</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 px-3 border border-gray-200 rounded-md bg-white"
                >
                  <option value="matchScore">Match Score</option>
                  <option value="appliedAt">Application Date</option>
                  <option value="name">Name</option>
                </select>
              </div>

              {/* Applications Table */}
              <Card>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-gray-900">Applicant</TableHead>
                        <TableHead className="font-semibold text-gray-900">Position</TableHead>
                        <TableHead className="font-semibold text-gray-900">Education</TableHead>
                        <TableHead className="font-semibold text-gray-900">Skills</TableHead>
                        <TableHead className="font-semibold text-gray-900">Match Score</TableHead>
                        <TableHead className="font-semibold text-gray-900">Status</TableHead>
                        <TableHead className="font-semibold text-gray-900">Applied</TableHead>
                        <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((application) => (
                        <TableRow key={application._id} className="hover:bg-gray-50">
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">
                                {application.resumeData?.name || application.student.name}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {application.resumeData?.email || application.student.email}
                              </div>
                              {application.resumeData?.phone && (
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {application.resumeData.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{application.internshipId.title}</div>
                              <div className="text-sm text-gray-500">{application.internshipId.domain}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {application.internshipId.location}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div>
                              {application.resumeData?.university && (
                                <div className="text-sm text-gray-900 flex items-center gap-1">
                                  <GraduationCap className="h-3 w-3" />
                                  {application.resumeData.university}
                                </div>
                              )}
                              {application.resumeData?.degree && (
                                <div className="text-sm text-gray-500">{application.resumeData.degree}</div>
                              )}
                              {application.resumeData?.gpa && (
                                <div className="text-sm text-gray-500">GPA: {application.resumeData.gpa}</div>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="max-w-xs">
                              {getAllSkills(application.resumeData?.skills).slice(0, 3).map((skill, idx) => (
                                <Badge key={idx} variant="secondary" className="mr-1 mb-1 text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {getAllSkills(application.resumeData?.skills).length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{getAllSkills(application.resumeData?.skills).length - 3} more
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className={`font-medium ${getMatchScoreColor(application.matchScore.total)}`}>
                                {Math.round(application.matchScore.total)}%
                              </span>
                            </div>
                            {application.matchScore.details.skillsMatched.length > 0 && (
                              <div className="text-xs text-gray-500 mt-1">
                                {application.matchScore.details.skillsMatched.length} skills matched
                              </div>
                            )}
                          </TableCell>

                          <TableCell>
                            <select
                              value={application.status}
                              onChange={(e) => updateApplicationStatus(application._id, e.target.value)}
                              className={`text-xs px-2 py-1 rounded-full border-0 ${statusColors[application.status]}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="rejected">Rejected</option>
                              <option value="accepted">Accepted</option>
                            </select>
                          </TableCell>

                          <TableCell>
                            <div className="text-sm text-gray-700 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(application.appliedAt).toLocaleDateString()}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedApplication(application)}
                                className="h-8 w-8 p-0 hover:bg-blue-50"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(application.resumeUrl, '_blank')}
                                className="h-8 w-8 p-0 hover:bg-green-50"
                                title="View Resume"
                              >
                                <Download className="h-4 w-4 text-green-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {filteredApplications.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">
                        {searchTerm ? "No applications found matching your search." : "No applications received yet."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} applications
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === pagination.pages}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  )
}