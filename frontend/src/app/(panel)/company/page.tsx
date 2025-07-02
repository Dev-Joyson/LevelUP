import { redirect } from "next/navigation"

export default function CompanyPage() {
  redirect("/company/dashboard")
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
// import ApplicationsTable from '../../../components/CompanyComponents/ApplicationsTable';
// import MatchingCriteriaModal from '../../../components/CompanyComponents/MatchingCriteriaModal';

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
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
//           <p className="text-gray-600 mt-2">Manage your internships and track applications</p>
//         </div>
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
//             <button
//               onClick={() => setIsCreateModalOpen(true)}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Create New Internship
//             </button>
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