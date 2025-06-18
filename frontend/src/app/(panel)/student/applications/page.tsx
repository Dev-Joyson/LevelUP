"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Application {
  id: string
  company: string
  role: string
  applicationDate: string
  status: "Pending" | "Reviewed" | "Accepted" | "Rejected"
}

const applications: Application[] = [
  {
    id: "1",
    company: "Tech Innovators Inc.",
    role: "Software Engineering Intern",
    applicationDate: "2024-07-15",
    status: "Pending",
  },
  {
    id: "2",
    company: "Global Solutions Ltd.",
    role: "Data Science Intern",
    applicationDate: "2024-07-10",
    status: "Reviewed",
  },
  {
    id: "3",
    company: "Creative Minds Co.",
    role: "Marketing Intern",
    applicationDate: "2024-07-05",
    status: "Accepted",
  },
  {
    id: "4",
    company: "Future Leaders Group",
    role: "Finance Intern",
    applicationDate: "2024-06-30",
    status: "Rejected",
  },
  {
    id: "5",
    company: "NextGen Systems",
    role: "Product Management Intern",
    applicationDate: "2024-06-25",
    status: "Pending",
  },
]

export default function StudentApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("")

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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{application.company}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm ? "No applications found matching your search." : "No applications found."}
              </p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
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
      </div>
    </div>
  )
}
