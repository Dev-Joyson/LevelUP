"use client"

import { useState } from "react"
import { Card, CardContent } from "@/app/(panel)/admin/components/ui/card"
import { Input } from "@/app/(panel)/admin/components/ui/input"
import { Badge } from "@/app/(panel)/admin/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/(panel)/admin/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/(panel)/admin/components/ui/table"
import { Search } from "lucide-react"
import { JobDetailsModal } from "@/app/(panel)/admin/components/job-details-modal"

const jobs = [
  {
    id: 1,
    title: "Software Engineer Intern",
    company: "Tech Innovators Inc.",
    location: "San Francisco, CA",
    type: "Internship",
    salary: "$25-30/hour",
    posted: "2024-01-15",
    deadline: "2024-02-15",
    applicants: 45,
    status: "Active",
    description:
      "We are looking for a motivated Software Engineer Intern to join our development team. You will work on real-world projects, collaborate with experienced engineers, and gain hands-on experience with modern web technologies.\n\nThis is an excellent opportunity to learn and grow in a fast-paced startup environment while contributing to meaningful projects that impact thousands of users.",
    requirements: [
      "Currently pursuing a degree in Computer Science or related field",
      "Strong foundation in programming languages (JavaScript, Python, or Java)",
      "Familiarity with web development frameworks (React, Node.js preferred)",
      "Understanding of database concepts and SQL",
      "Excellent problem-solving and communication skills",
      "Ability to work collaboratively in a team environment",
    ],
    benefits: [
      "Competitive hourly compensation",
      "Mentorship from senior engineers",
      "Flexible working hours",
      "Professional development opportunities",
      "Potential for full-time offer upon graduation",
      "Modern office with latest technology",
    ],
  },
  {
    id: 2,
    title: "Marketing Intern",
    company: "Creative Minds Agency",
    location: "New York, NY",
    type: "Internship",
    salary: "$20-25/hour",
    posted: "2024-01-14",
    deadline: "2024-02-10",
    applicants: 32,
    status: "Active",
    description:
      "Join our dynamic marketing team as a Marketing Intern and gain experience in digital marketing, content creation, and campaign management. You'll work on exciting projects for diverse clients and learn from industry experts.",
    requirements: [
      "Currently pursuing a degree in Marketing, Communications, or related field",
      "Strong written and verbal communication skills",
      "Familiarity with social media platforms",
      "Basic understanding of digital marketing concepts",
      "Creative thinking and attention to detail",
      "Proficiency in Microsoft Office Suite",
    ],
    benefits: [
      "Hands-on experience with real client projects",
      "Training in digital marketing tools",
      "Networking opportunities",
      "Flexible schedule",
      "Certificate of completion",
      "Potential for extended internship",
    ],
  },
  {
    id: 3,
    title: "Data Analyst Intern",
    company: "Global Solutions Ltd.",
    location: "Remote",
    type: "Internship",
    salary: "$22-28/hour",
    posted: "2024-01-13",
    deadline: "2024-02-20",
    applicants: 28,
    status: "Active",
    description:
      "We're seeking a Data Analyst Intern to support our business intelligence team. You'll work with large datasets, create visualizations, and help derive insights that drive business decisions.",
    requirements: [
      "Currently pursuing a degree in Data Science, Statistics, or related field",
      "Proficiency in SQL and Excel",
      "Experience with data visualization tools (Tableau, Power BI preferred)",
      "Basic knowledge of Python or R",
      "Strong analytical and problem-solving skills",
      "Attention to detail and accuracy",
    ],
    benefits: [
      "Remote work flexibility",
      "Access to premium data tools",
      "Mentorship from senior analysts",
      "Real-world data projects",
      "Professional development budget",
      "Collaborative team environment",
    ],
  },
  {
    id: 4,
    title: "UX Design Intern",
    company: "Design Studio Pro",
    location: "Los Angeles, CA",
    type: "Internship",
    salary: "$18-24/hour",
    posted: "2024-01-12",
    deadline: "2024-01-30",
    applicants: 18,
    status: "Closed",
    description:
      "Join our design team to create user-centered digital experiences. You'll participate in the entire design process from research to prototyping and testing.",
    requirements: [
      "Currently pursuing a degree in Design, HCI, or related field",
      "Portfolio demonstrating design thinking and process",
      "Proficiency in design tools (Figma, Sketch, Adobe Creative Suite)",
      "Understanding of UX principles and methodologies",
      "Strong communication and presentation skills",
      "Eagerness to learn and receive feedback",
    ],
    benefits: [
      "Portfolio development opportunities",
      "Access to design software and tools",
      "Mentorship from experienced designers",
      "Exposure to diverse client projects",
      "Design thinking workshops",
      "Potential for full-time position",
    ],
  },
  {
    id: 5,
    title: "Business Development Intern",
    company: "Startup Ventures Co.",
    location: "Austin, TX",
    type: "Internship",
    salary: "$15-20/hour",
    posted: "2024-01-11",
    deadline: "2024-02-25",
    applicants: 12,
    status: "Draft",
    description:
      "Support our business development team in identifying new opportunities, conducting market research, and building strategic partnerships.",
    requirements: [
      "Currently pursuing a degree in Business, Economics, or related field",
      "Strong research and analytical skills",
      "Excellent written and verbal communication",
      "Interest in startup ecosystem and entrepreneurship",
      "Proficiency in Microsoft Office and Google Workspace",
      "Self-motivated and proactive approach",
    ],
    benefits: [
      "Startup environment experience",
      "Direct exposure to business strategy",
      "Networking with industry professionals",
      "Flexible working arrangements",
      "Performance-based bonuses",
      "Letter of recommendation",
    ],
  },
]

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedJob, setSelectedJob] = useState<(typeof jobs)[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || job.type.toLowerCase() === typeFilter.toLowerCase()
    const matchesStatus = statusFilter === "all" || job.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "closed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Closed</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Draft</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "full-time":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Full-time</Badge>
      case "part-time":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Part-time</Badge>
      case "internship":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Internship</Badge>
      case "contract":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Contract</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const handleViewJob = (job: (typeof jobs)[0]) => {
    setSelectedJob(job)
    setIsModalOpen(true)
  }

  const handleDeleteJob = (jobId: number) => {
    // In a real app, you would update this in your state management or API
    console.log(`Deleted job with ID: ${jobId}`)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
        <p className="text-gray-600 mt-1">Manage job postings and applications</p>
      </div>

      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search jobs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="font-medium text-gray-600 py-4">Job Title</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Company</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Location</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Type</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Salary</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Applicants</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Status</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Posted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow
                  key={job.id}
                  className="border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleViewJob(job)}
                >
                  <TableCell className="py-4 font-medium">{job.title}</TableCell>
                  <TableCell className="py-4 text-gray-600">{job.company}</TableCell>
                  <TableCell className="py-4 text-gray-600">{job.location}</TableCell>
                  <TableCell className="py-4">{getTypeBadge(job.type)}</TableCell>
                  <TableCell className="py-4 text-gray-600">{job.salary}</TableCell>
                  <TableCell className="py-4 text-gray-600">{job.applicants}</TableCell>
                  <TableCell className="py-4">{getStatusBadge(job.status)}</TableCell>
                  <TableCell className="py-4 text-gray-600">{job.posted}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <JobDetailsModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDeleteJob={handleDeleteJob}
      />
    </div>
  )
}
