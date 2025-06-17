"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/(panel)/admin/components/ui/dialog"
import { Button } from "@/app/(panel)/admin/components/ui/button"
import { Badge } from "@/app/(panel)/admin/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/(panel)/admin/components/ui/card"
import { Building2, Mail, Globe, MapPin, Calendar, Users, Briefcase, Shield, Phone } from "lucide-react"

interface Company {
  id: number
  name: string
  status: string
  jobs: number
  appliedStudents: number
  lastActivity: string
  email: string
  industry: string
  location: string
  description: string
  website: string
  foundedYear: string
  employees: string
}

interface CompanyDetailsModalProps {
  company: Company | null
  isOpen: boolean
  onClose: () => void
  onSuspendCompany: (companyId: number) => void
}

export function CompanyDetailsModal({ company, isOpen, onClose, onSuspendCompany }: CompanyDetailsModalProps) {
  if (!company) return null

  const handleSuspendCompany = () => {
    onSuspendCompany(company.id)
    onClose()
  }

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-bold">{company.name} - Company Profile</DialogTitle>
          <div className="flex items-center gap-2">
            {getStatusBadge(company.status)}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleSuspendCompany}
              className="flex items-center gap-2"
              disabled={company.status.toLowerCase() === "suspended"}
            >
              <Shield className="h-4 w-4" />
              {company.status.toLowerCase() === "suspended" ? "Suspended" : "Suspend Company"}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Company Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{company.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{company.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{company.website}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{company.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Founded: {company.foundedYear}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Employees: {company.employees}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Industry: {company.industry}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{company.jobs}</div>
                <p className="text-sm text-gray-500">Currently posted</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Applied Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{company.appliedStudents}</div>
                <p className="text-sm text-gray-500">Total applications</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Last Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{company.lastActivity}</div>
                <p className="text-sm text-gray-500">Platform activity</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Job Postings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Recent Job Postings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {company.jobs > 0 ? (
                  <>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Software Engineer Intern</h4>
                        <p className="text-sm text-gray-600">Full-time • Remote</p>
                      </div>
                      <Badge variant="outline">15 applicants</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Marketing Intern</h4>
                        <p className="text-sm text-gray-600">Part-time • On-site</p>
                      </div>
                      <Badge variant="outline">8 applicants</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Data Analyst Intern</h4>
                        <p className="text-sm text-gray-600">Full-time • Hybrid</p>
                      </div>
                      <Badge variant="outline">12 applicants</Badge>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-4">No active job postings</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Primary Contact</h4>
                  <p className="text-sm text-gray-600">HR Department</p>
                  <p className="text-sm text-gray-600">{company.email}</p>
                  <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Business Address</h4>
                  <p className="text-sm text-gray-600">{company.location}</p>
                  <p className="text-sm text-gray-600">Business Hours: 9 AM - 6 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
