"use client"

import { useState, useEffect } from "react"
import {
  Eye,
  Download,
  Search,
  Calendar,
  MapPin,
  User,
  GraduationCap,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-toastify"

interface Application {
  _id: string
  student: {
    _id: string
    name: string
    email: string
    profilePicture?: string
    gpa: number
    university: string
    course: string
    year: number
  }
  internship: {
    _id: string
    title: string
    domain: string
    location: string
  }
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "accepted"
  matchScore: number
  appliedAt: string
  resumeUrl?: string
  coverLetter?: string
}

interface ApplicationsTableProps {
  companyId?: string
}

export default function ApplicationsTable({ companyId }: ApplicationsTableProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("appliedAt")

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/applications/company`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
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

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/applications/${applicationId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setApplications((prev) =>
          prev.map((app) => (app._id === applicationId ? { ...app, status: newStatus as any } : app)),
        )
        toast.success("Application status updated successfully")
      } else {
        toast.error("Failed to update application status")
      }
    } catch (error) {
      console.error("Error updating application status:", error)
      toast.error("Error updating application status")
    }
  }

  const handleDownloadResume = async (resumeUrl: string, studentName: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(resumeUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${studentName}_Resume.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        toast.error("Failed to download resume")
      }
    } catch (error) {
      console.error("Error downloading resume:", error)
      toast.error("Error downloading resume")
    }
  }

  const filteredApplications = applications
    .filter((app) => {
      const matchesSearch =
        app.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.student.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || app.status === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "matchScore":
          return b.matchScore - a.matchScore
        case "gpa":
          return b.student.gpa - a.student.gpa
        case "appliedAt":
        default:
          return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
      }
    })

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      pending: "bg-yellow-100 text-yellow-800",
      reviewed: "bg-blue-100 text-blue-800",
      shortlisted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      accepted: "bg-purple-100 text-purple-800",
    }
    return variants[status] || "bg-gray-100 text-gray-800"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "reviewed":
        return <Eye className="h-4 w-4" />
      case "shortlisted":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "accepted":
        return <Star className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 font-semibold"
    if (score >= 60) return "text-blue-600 font-semibold"
    if (score >= 40) return "text-yellow-600 font-semibold"
    return "text-red-600 font-semibold"
  }

  const statusCounts = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading applications...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.pending || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.shortlisted || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <Star className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.accepted || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Match Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.length > 0
                ? Math.round(applications.reduce((sum, app) => sum + app.matchScore, 0) / applications.length)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 bg-white border-gray-200"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="appliedAt">Date Applied</SelectItem>
            <SelectItem value="matchScore">Match Score</SelectItem>
            <SelectItem value="gpa">GPA</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Student</TableHead>
              <TableHead className="font-semibold text-gray-900">Internship</TableHead>
              <TableHead className="font-semibold text-gray-900">Academic Info</TableHead>
              <TableHead className="font-semibold text-gray-900">Match Score</TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900">Applied Date</TableHead>
              <TableHead className="font-semibold text-gray-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.map((application) => (
              <TableRow key={application._id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {application.student.profilePicture ? (
                        <img
                          src={application.student.profilePicture || "/placeholder.svg"}
                          alt={application.student.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{application.student.name}</div>
                      <div className="text-sm text-gray-500">{application.student.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900">{application.internship.title}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {application.internship.location}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="flex items-center gap-1 text-sm">
                      <GraduationCap className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">GPA: {application.student.gpa}</span>
                    </div>
                    <div className="text-sm text-gray-500">{application.student.university}</div>
                    <div className="text-sm text-gray-500">
                      {application.student.course} - Year {application.student.year}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-center">
                    <span className={`text-lg font-bold ${getMatchScoreColor(application.matchScore)}`}>
                      {application.matchScore}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={application.status}
                    onValueChange={(value) => handleStatusChange(application._id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(application.status)}
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-gray-700">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {application.resumeUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadResume(application.resumeUrl!, application.student.name)}
                        className="h-8 w-8 p-0 hover:bg-blue-50"
                        title="Download Resume"
                      >
                        <Download className="h-4 w-4 text-blue-600" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-green-50" title="View Details">
                      <Eye className="h-4 w-4 text-green-600" />
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
              {searchTerm || statusFilter !== "all"
                ? "No applications found matching your criteria."
                : "No applications received yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}