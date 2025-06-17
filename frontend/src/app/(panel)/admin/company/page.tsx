"use client"

import { useState } from "react"
import { Card, CardContent } from "@/app/(panel)/admin/components/ui/card"
import { Button } from "@/app/(panel)/admin/components/ui/button"
import { Input } from "@/app/(panel)/admin/components/ui/input"
import { Badge } from "@/app/(panel)/admin/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/(panel)/admin/components/ui/table"
import { Search } from "lucide-react"
import { CompanyDetailsModal } from "@/app/(panel)/admin/components/company-details-modal"

const companies = [
  {
    id: 1,
    name: "Tech Innovators Inc.",
    status: "Active",
    jobs: 12,
    appliedStudents: 50,
    lastActivity: "2 days ago",
    email: "contact@techinnovators.com",
    industry: "Technology",
    location: "San Francisco, CA",
    description: "Leading technology company specializing in AI and machine learning solutions.",
    website: "www.techinnovators.com",
    foundedYear: "2018",
    employees: "500-1000",
  },
  {
    id: 2,
    name: "Global Solutions Ltd.",
    status: "Active",
    jobs: 8,
    appliedStudents: 35,
    lastActivity: "1 week ago",
    email: "hr@globalsolutions.com",
    industry: "Consulting",
    location: "New York, NY",
    description: "International consulting firm providing business solutions worldwide.",
    website: "www.globalsolutions.com",
    foundedYear: "2015",
    employees: "1000+",
  },
  {
    id: 3,
    name: "Future Dynamics Corp.",
    status: "Pending",
    jobs: 0,
    appliedStudents: 0,
    lastActivity: "3 days ago",
    email: "info@futuredynamics.com",
    industry: "Fintech",
    location: "Austin, TX",
    description: "Emerging fintech company focused on blockchain and cryptocurrency solutions.",
    website: "www.futuredynamics.com",
    foundedYear: "2023",
    employees: "50-100",
  },
  {
    id: 4,
    name: "Creative Minds Agency",
    status: "Active",
    jobs: 5,
    appliedStudents: 20,
    lastActivity: "5 days ago",
    email: "hello@creativeminds.com",
    industry: "Marketing",
    location: "Los Angeles, CA",
    description: "Creative marketing agency specializing in digital campaigns and brand development.",
    website: "www.creativeminds.com",
    foundedYear: "2020",
    employees: "100-500",
  },
  {
    id: 5,
    name: "Innovative Ventures LLC",
    status: "Suspended",
    jobs: 2,
    appliedStudents: 10,
    lastActivity: "2 weeks ago",
    email: "contact@innovativeventures.com",
    industry: "Startup",
    location: "Seattle, WA",
    description: "Venture capital firm investing in early-stage technology startups.",
    website: "www.innovativeventures.com",
    foundedYear: "2019",
    employees: "10-50",
  },
]

type StatusFilter = "all" | "active" | "pending" | "suspended"

export default function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [selectedCompany, setSelectedCompany] = useState<(typeof companies)[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || company.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleViewCompany = (company: (typeof companies)[0]) => {
    setSelectedCompany(company)
    setIsModalOpen(true)
  }

  const handleSuspendCompany = (companyId: number) => {
    // In a real app, you would update this in your state management or API
    console.log(`Suspended company with ID: ${companyId}`)
  }

  const getFilterButtonClass = (filter: StatusFilter) => {
    return statusFilter === filter
      ? "bg-blue-50 text-blue-700 border-b-2 border-blue-700"
      : "text-gray-600 hover:text-gray-900"
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
      </div>

      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search companies"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-8 border-b border-gray-200">
          <button
            onClick={() => setStatusFilter("all")}
            className={`pb-2 px-1 font-medium ${getFilterButtonClass("all")}`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`pb-2 px-1 font-medium ${getFilterButtonClass("pending")}`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter("suspended")}
            className={`pb-2 px-1 font-medium ${getFilterButtonClass("suspended")}`}
          >
            Suspended
          </button>
        </div>
      </div>

      {/* Companies Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="font-medium text-gray-600 py-4">Company</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Status</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Jobs</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Applied Students</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Last Activity</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id} className="border-b border-gray-100">
                  <TableCell className="py-4 font-medium">{company.name}</TableCell>
                  <TableCell className="py-4">{getStatusBadge(company.status)}</TableCell>
                  <TableCell className="py-4 text-gray-600">{company.jobs}</TableCell>
                  <TableCell className="py-4 text-gray-600">{company.appliedStudents}</TableCell>
                  <TableCell className="py-4 text-gray-600">{company.lastActivity}</TableCell>
                  <TableCell className="py-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      onClick={() => handleViewCompany(company)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CompanyDetailsModal
        company={selectedCompany}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuspendCompany={handleSuspendCompany}
      />
    </div>
  )
}
