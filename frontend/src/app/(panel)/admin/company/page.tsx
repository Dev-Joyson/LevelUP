"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/inputAdmin"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"
import { CompanyDetailsModal } from "@/components/AdminComponents/company-details-modal"
import { toast } from "react-toastify"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Company {
  _id: string;
  companyName: string;
  verified: boolean;
  internships: string[];
  appliedStudents: number;
  userId: {
    _id: string;
    email: string;
  };
  industry?: string;
  location?: string;
  description: string;
  website?: string;
  foundedYear?: string;
  employees?: string;
  createdAt: string;
  pdfUrl?: string;
  pdfPublicId?: string;
}

type StatusFilter = "all" | "pending"

export default function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [companyToApprove, setCompanyToApprove] = useState<Company | null>(null)

  useEffect(() => {
    fetchCompanies()
  }, [statusFilter])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const endpoint = statusFilter === 'all' 
        ? 'http://localhost:4000/api/admin/companies'
        : 'http://localhost:4000/api/admin/companies/unverified'

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch companies')
      }

      const data = await response.json()
      console.log('Fetched companies data:', data) // Debug log
      setCompanies(data)
    } catch (error) {
      console.error('Error fetching companies:', error)
      toast.error('Failed to fetch companies')
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter((company) => {
    return company.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const getStatusBadge = (verified: boolean) => {
    return verified 
      ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      : <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
  }

  const handleViewCompany = (company: Company) => {
    setSelectedCompany(company)
    setIsModalOpen(true)
  }

  const handleApproveClick = (company: Company) => {
    setCompanyToApprove(company)
    setApproveDialogOpen(true)
  }

  const handleApproveConfirm = async () => {
    if (!companyToApprove) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:4000/api/admin/companies/${companyToApprove._id}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to approve company')
      }

      toast.success('Company approved successfully')
      fetchCompanies() // Refresh the list
    } catch (error) {
      console.error('Error approving company:', error)
      toast.error('Failed to approve company')
    } finally {
      setApproveDialogOpen(false)
      setCompanyToApprove(null)
    }
  }

  const getFilterButtonClass = (filter: StatusFilter) => {
    return statusFilter === filter
      ? "bg-blue-50 text-blue-700 border-b-2 border-blue-700"
      : "text-gray-600 hover:text-gray-900"
  }

  if (loading) {
    return <div className="p-6">Loading companies...</div>
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
                <TableHead className="font-medium text-gray-600 py-4">Email</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company._id} className="border-b border-gray-100">
                  <TableCell className="py-4 font-medium">{company.companyName}</TableCell>
                  <TableCell className="py-4">{getStatusBadge(company.verified)}</TableCell>
                  <TableCell className="py-4 text-gray-600">{company.internships?.length || 0}</TableCell>
                  <TableCell className="py-4 text-gray-600">{company.appliedStudents || 0}</TableCell>
                  <TableCell className="py-4 text-gray-600">{company.userId?.email || 'N/A'}</TableCell>
                  <TableCell className="py-4">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        onClick={() => handleViewCompany(company)}
                      >
                        View
                      </Button>
                      {!company.verified && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-800 hover:bg-green-50"
                          onClick={() => handleApproveClick(company)}
                        >
                          Approve
                        </Button>
                      )}
                    </div>
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
        onSuspendCompany={() => {}}
      />

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve {companyToApprove?.companyName}? This will send a verification email to the company.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveConfirm}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
