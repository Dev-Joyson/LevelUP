"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Mail, Globe, MapPin, Calendar, Users, Briefcase, Shield, Phone, FileDown } from "lucide-react"

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

interface CompanyDetailsModalProps {
  company: Company | null
  isOpen: boolean
  onClose: () => void
  onSuspendCompany: (companyId: string) => void
}

export function CompanyDetailsModal({ company, isOpen, onClose, onSuspendCompany }: CompanyDetailsModalProps) {
  if (!company) return null

  console.log('Company data:', company) // Debug log

  const handleSuspendCompany = () => {
    onSuspendCompany(company._id)
    onClose()
  }

  const handleDownloadDocument = () => {
    if (company.pdfUrl) {
      window.open(company.pdfUrl, '_blank')
    }
  }

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {company.companyName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Company Overview */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Company Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-700">{company.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{company.userId?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{company.website || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{company.location || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Founded: {company.foundedYear || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Employees: {company.employees || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Industry: {company.industry || 'Not provided'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registration Document */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileDown className="h-4 w-4" />
                Registration Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              {company.pdfUrl ? (
                <Button
                  onClick={handleDownloadDocument}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                >
                  <FileDown className="h-4 w-4" />
                  Download Registration Document
                </Button>
              ) : (
                <p className="text-sm text-gray-500">No registration document available</p>
              )}
            </CardContent>
          </Card>

          {/* Activity Statistics */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="h-4 w-4" />
                Activity Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Total Jobs Posted</p>
                  <p className="text-xl font-bold">{company.internships?.length || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Total Applications</p>
                  <p className="text-xl font-bold">{company.appliedStudents || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Account Status</p>
                  <Badge className={company.verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                    {company.verified ? "Active" : "Pending"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Phone className="h-4 w-4" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-1">Primary Contact</h4>
                  <p className="text-sm text-gray-600">HR Department</p>
                  <p className="text-sm text-gray-600">{company.userId?.email || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Business Address</h4>
                  <p className="text-sm text-gray-600">{company.location || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
