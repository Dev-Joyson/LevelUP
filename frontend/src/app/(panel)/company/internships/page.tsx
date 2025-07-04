"use client"

import { useState, useEffect } from "react"
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Briefcase,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "react-toastify"
import CreateInternshipModal from "@/components/CompanyComponents/CreateInternshipModal"
import MatchingCriteriaModal from "@/components/CompanyComponents/MatchingCriteriaModal"
import { ViewInternshipModal } from "@/components/CompanyComponents/ViewInternshipModal"
import { DeleteInternshipDialog } from "@/components/CompanyComponents/DeleteInternshipDialog"

interface Internship {
  _id: string
  title: string
  domain: string
  location: string
  workMode: string
  salary: {
    min: number
    max: number
    display: string
  }
  matchingCriteria: {
    skills: number
    projects: number
    experience: number
    gpa: number
    certifications: number
  }
  preferredSkills: string[]
  minimumGPA: number
  applicationDeadline?: string
  positions: number
  isPublished: boolean
  applicationCount: number
  createdAt: string
  description?: string
  requirements?: string[]
  benefits?: string[]
  isExpired?: boolean
}

interface Analytics {
  totalApplications: number
  statusCounts: {
    pending?: number
    reviewed?: number
    shortlisted?: number
    rejected?: number
    accepted?: number
  }
  averageMatchScore: number
  topInternships: Array<{
    title: string
    count: number
  }>
}

export default function CompanyInternshipsPage() {
  const [user, setUser] = useState<any>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [internships, setInternships] = useState<Internship[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

  useEffect(() => {
    // fetchUserData()
    fetchInternships()
    // fetchAnalytics()
  }, [])

  // const fetchUserData = async () => {
  //   try {
  //     const token = localStorage.getItem("token")
  //     const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     if (response.ok) {
  //       const userData = await response.json()
  //       setUser(userData)
  //     }
  //   } catch (error) {
  //     console.error("Error fetching user data:", error)
  //   }
  // }

  const fetchInternships = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/company/internships`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        // Handle the new API response structure
        if (data.success && data.data && data.data.internships) {
          setInternships(data.data.internships)
        } else {
          // Fallback for old API structure
          setInternships(data.internships || [])
        }
      } else {
        toast.error("Failed to fetch internships")
        setInternships([]) // Set empty array on error
      }
    } catch (error) {
      console.error("Error fetching internships:", error)
      toast.error("Error fetching internships")
      setInternships([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  // const fetchAnalytics = async () => {
  //   try {
  //     const token = localStorage.getItem("token")
  //     const response = await fetch(`${API_BASE_URL}/api/applications/company/analytics`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     if (response.ok) {
  //       const data = await response.json()
  //       setAnalytics(data)
  //     }
  //   } catch (error) {
  //     console.error("Error fetching analytics:", error)
  //   }
  // }

  // Add safety check for filter operation
  const filteredInternships = (internships || []).filter(
    (internship) =>
      internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateInternship = () => {
    setIsCreateModalOpen(true)
  }

  const handleView = (internship: Internship) => {
    setSelectedInternship(internship)
    setIsViewModalOpen(true)
  }

  const handleEdit = (internship: Internship) => {
    setSelectedInternship(internship)
    setIsEditModalOpen(true)
  }

  const handleEditCriteria = (internship: Internship) => {
    setSelectedInternship(internship)
    setIsCriteriaModalOpen(true)
  }

  const handleDelete = (internship: Internship) => {
    setSelectedInternship(internship)
    setIsDeleteDialogOpen(true)
  }

  const handleSaveEdit = (updatedInternship: Internship) => {
    setInternships((prev) =>
      prev.map((internship) => (internship._id === updatedInternship._id ? updatedInternship : internship)),
    )
    setIsEditModalOpen(false)
    setSelectedInternship(null)
  }

  const handleConfirmDelete = async () => {
    if (selectedInternship) {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${API_BASE_URL}/api/company/internships/${selectedInternship._id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setInternships((prev) => prev.filter((internship) => internship._id !== selectedInternship._id))
          toast.success("Internship deleted successfully")
          // fetchAnalytics() // Refresh analytics
        } else {
          toast.error("Failed to delete internship")
        }
      } catch (error) {
        console.error("Error deleting internship:", error)
        toast.error("Error deleting internship")
      }

      setIsDeleteDialogOpen(false)
      setSelectedInternship(null)
    }
  }

  const onInternshipCreated = () => {
    fetchInternships()
    // fetchAnalytics()
    setIsCreateModalOpen(false)
  }

  const handleCriteriaModalClose = () => {
    setIsCriteriaModalOpen(false)
    setSelectedInternship(null)
  }

  const handleCriteriaUpdate = () => {
    fetchInternships()
    // fetchAnalytics()
  }

  const getStatusBadge = (isPublished: boolean) => {
    return isPublished ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
  }

  const getWorkModeBadge = (workMode: string) => {
    const variants: { [key: string]: string } = {
      "Full-time": "bg-blue-100 text-blue-800",
      "Part-time": "bg-purple-100 text-purple-800",
      Remote: "bg-green-100 text-green-800",
      Hybrid: "bg-orange-100 text-orange-800",
      "On-site": "bg-gray-100 text-gray-800",
    }
    return variants[workMode] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Internships</h1>
            <p className="text-gray-600 mt-1">Manage and track your posted internship opportunities</p>
          </div>
          <Button onClick={handleCreateInternship} className="cursor-pointer bg-primary text-white">
            <Plus className="h-4 w-4" />
            Create Internship
          </Button>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalApplications}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(internships || []).filter((i) => i.isPublished).length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Match Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(analytics.averageMatchScore)}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.statusCounts.pending || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search internships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-white border-gray-200"
            />
          </div>
          <Button variant="outline" className="h-10 bg-transparent">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Internships Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-900">Position</TableHead>
                <TableHead className="font-semibold text-gray-900">Domain</TableHead>
                <TableHead className="font-semibold text-gray-900">Location</TableHead>
                <TableHead className="font-semibold text-gray-900">Work Mode</TableHead>
                <TableHead className="font-semibold text-gray-900">Salary</TableHead>
                <TableHead className="font-semibold text-gray-900">Status</TableHead>
                <TableHead className="font-semibold text-gray-900">Applicants</TableHead>
                <TableHead className="font-semibold text-gray-900">Deadline</TableHead>
                <TableHead className="font-semibold text-gray-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInternships.map((internship) => (
                <TableRow key={internship._id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{internship.title}</div>
                      <div className="text-sm text-gray-500">
                        Created {new Date(internship.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700">{internship.domain}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-gray-700">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {internship.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getWorkModeBadge(internship.workMode)} text-xs`}>{internship.workMode}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-gray-700">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      {internship.salary.display}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusBadge(internship.isPublished)} text-xs`}>
                      {internship.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <span className="font-medium text-gray-900">{internship.applicationCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-gray-700">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {internship.applicationDeadline
                        ? new Date(internship.applicationDeadline).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(internship)}
                        className="h-8 w-8 p-0 hover:bg-blue-50"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCriteria(internship)}
                        className="h-8 w-8 p-0 hover:bg-green-50"
                        title="Edit Criteria"
                      >
                        <Edit className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(internship)}
                        className="h-8 w-8 p-0 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredInternships.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm ? "No internships found matching your search." : "No internships posted yet."}
              </p>
            </div>
          )}
        </div>

        {/* Modals */}
        <CreateInternshipModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={onInternshipCreated}
        />

        <MatchingCriteriaModal
          isOpen={isCriteriaModalOpen}
          onClose={handleCriteriaModalClose}
          internship={selectedInternship}
          onUpdate={handleCriteriaUpdate}
        />

        {selectedInternship && (
          <>
            <ViewInternshipModal
              internship={selectedInternship}
              isOpen={isViewModalOpen}
              onClose={() => {
                setIsViewModalOpen(false)
                setSelectedInternship(null)
              }}
            />
            <DeleteInternshipDialog
              internship={selectedInternship}
              isOpen={isDeleteDialogOpen}
              onClose={() => {
                setIsDeleteDialogOpen(false)
                setSelectedInternship(null)
              }}
              onConfirm={handleConfirmDelete}
            />
          </>
        )}
      </div>
    </div>
  )
}

















// "use client"

// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { 
//   Plus, 
//   Briefcase, 
//   Users, 
//   TrendingUp, 
//   Eye,
//   Edit,
//   Settings,
//   Calendar,
//   MapPin,
//   DollarSign
// } from 'lucide-react';
// import { toast } from 'react-toastify';
// import CreateInternshipModal from '@/components/CompanyComponents/CreateInternshipModal';
// import ApplicationsTable from '../../../../components/CompanyComponents/ApplicationsTable';
// import MatchingCriteriaModal from '../../../../components/CompanyComponents/MatchingCriteriaModal';

// interface Internship {
//   _id: string;
//   title: string;
//   domain: string;
//   location: string;
//   workMode: string;
//   salary: {
//     min: number;
//     max: number;
//     display: string;
//   };
//   matchingCriteria: {
//     skills: number;
//     projects: number;
//     experience: number;
//     gpa: number;
//     certifications: number;
//   };
//   preferredSkills: string[];
//   minimumGPA: number;
//   applicationDeadline?: string;
//   positions: number;
//   isPublished: boolean;
//   applicationsCount: number;
//   createdAt: string;
// }

// interface Analytics {
//   totalApplications: number;
//   statusCounts: {
//     pending?: number;
//     reviewed?: number;
//     shortlisted?: number;
//     rejected?: number;
//     accepted?: number;
//   };
//   averageMatchScore: number;
//   topInternships: Array<{
//     title: string;
//     count: number;
//   }>;
// }

// const CompanyDashboard = () => {
//   const [user, setUser] = useState<any>(null);
//   const [analytics, setAnalytics] = useState<Analytics | null>(null);
//   const [internships, setInternships] = useState<Internship[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
//   const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);

//   const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

//   useEffect(() => {
//     fetchUserData();
//     fetchInternships();
//     fetchAnalytics();
//   }, []);

//   const fetchUserData = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       });

//       if (response.ok) {
//         const userData = await response.json();
//         setUser(userData);
//       }
//     } catch (error) {
//       console.error('Error fetching user data:', error);
//     }
//   };

//   const fetchInternships = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`${API_BASE_URL}/api/company/internships`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setInternships(data.internships);
//       } else {
//         toast.error('Failed to fetch internships');
//       }
//     } catch (error) {
//       console.error('Error fetching internships:', error);
//       toast.error('Error fetching internships');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchAnalytics = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await fetch(`${API_BASE_URL}/api/applications/company/analytics`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setAnalytics(data);
//       }
//     } catch (error) {
//       console.error('Error fetching analytics:', error);
//     }
//   };

//   const handleCreateInternship = () => {
//     setIsCreateModalOpen(true);
//   };

//   const handleEditCriteria = (internship: Internship) => {
//     setSelectedInternship(internship);
//     setIsCriteriaModalOpen(true);
//   };

//   const handleCriteriaModalClose = () => {
//     setIsCriteriaModalOpen(false);
//     setSelectedInternship(null);
//   };

//   const handleCriteriaUpdate = () => {
//     fetchInternships();
//     fetchAnalytics();
//   };

//   const onInternshipCreated = () => {
//     fetchInternships();
//     fetchAnalytics();
//     setIsCreateModalOpen(false);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-lg">Loading dashboard...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <div className="flex justify-end items-center mb-8">
//         {/* <div>
//           <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
//           <p className="text-gray-600 mt-2">Manage your internships and track applications</p>
//         </div> */}
//         <Button onClick={handleCreateInternship} className="flex items-center gap-2">
//           <Plus className="h-4 w-4" />
//           Create Internship
//         </Button>
//       </div>

//       {/* Analytics Cards */}
//       {analytics && (
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
//               <Users className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{analytics.totalApplications}</div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
//               <Briefcase className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{internships.filter(i => i.isPublished).length}</div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Avg Match Score</CardTitle>
//               <TrendingUp className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{Math.round(analytics.averageMatchScore)}%</div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
//               <Eye className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{analytics.statusCounts.pending || 0}</div>
//             </CardContent>
//           </Card>
//         </div>
//       )}

//       <Tabs defaultValue="internships" className="space-y-6">
//         <TabsList>
//           <TabsTrigger value="internships">Internships</TabsTrigger>
//           <TabsTrigger value="applications">Applications</TabsTrigger>
//         </TabsList>

//         <TabsContent value="internships" className="space-y-4">
//           <div className="flex justify-between items-center">
//             <h3 className="text-lg font-semibold">Your Internships</h3>
//           </div>

//           <div className="grid gap-4">
//             {internships.map((internship) => (
//               <div key={internship._id} className="bg-white p-6 rounded-lg shadow">
//                 <div className="flex justify-between items-start">
//                   <div className="flex-1">
//                     <h4 className="font-semibold text-lg">{internship.title}</h4>
//                     <p className="text-gray-600 mb-2">{internship.domain}</p>
//                     <div className="flex flex-wrap gap-2 mb-3">
//                       <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
//                         {internship.location}
//                       </span>
//                       <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
//                         {internship.workMode}
//                       </span>
//                     </div>
//                     <div className="text-sm text-gray-500">
//                       <p>Applications: {internship.applicationsCount}</p>
//                       <p>Avg Match Score: {Math.round(internship.matchingCriteria.skills)}%</p>
//                     </div>
//                   </div>
//                   <div className="flex flex-col gap-2">
//                     <button
//                       onClick={() => handleEditCriteria(internship)}
//                       className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
//                     >
//                       Edit Criteria
//                     </button>
//                     <span className={`px-2 py-1 rounded text-xs ${
//                       internship.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//                     }`}>
//                       {internship.isPublished ? 'Published' : 'Draft'}
//                     </span>
//                   </div>
//                 </div>
                
//                 {/* Matching Criteria Display */}
//                 {internship.matchingCriteria && (
//                   <div className="mt-4 p-3 bg-gray-50 rounded">
//                     <h5 className="text-sm font-medium mb-2">Matching Criteria:</h5>
//                     <div className="grid grid-cols-5 gap-2 text-xs">
//                       <div>Skills: {internship.matchingCriteria.skills}%</div>
//                       <div>Projects: {internship.matchingCriteria.projects}%</div>
//                       <div>Experience: {internship.matchingCriteria.experience}%</div>
//                       <div>GPA: {internship.matchingCriteria.gpa}%</div>
//                       <div>Certs: {internship.matchingCriteria.certifications}%</div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </TabsContent>

//         <TabsContent value="applications" className="space-y-4">
//           <div className="flex justify-between items-center">
//             <h3 className="text-lg font-semibold">Applications</h3>
//           </div>
//           <ApplicationsTable companyId={user?._id} />
//         </TabsContent>
//       </Tabs>

//       {/* Modals */}
//       <CreateInternshipModal
//         isOpen={isCreateModalOpen}
//         onClose={() => setIsCreateModalOpen(false)}
//         onSuccess={onInternshipCreated}
//       />

//       <MatchingCriteriaModal
//         isOpen={isCriteriaModalOpen}
//         onClose={handleCriteriaModalClose}
//         internship={selectedInternship}
//         onUpdate={handleCriteriaUpdate}
//       />
//     </div>
//   );
// };

// export default CompanyDashboard;