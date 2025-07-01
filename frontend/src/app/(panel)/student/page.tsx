"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  DollarSign,
  Upload,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Internship {
  _id: string;
  title: string;
  company: {
    name: string;
    _id: string;
  };
  description: string;
  location: string;
  workMode: string;
  domain: string;
  salary: {
    min: number;
    max: number;
    display: string;
  };
  matchingCriteria: {
    skills: number;
    projects: number;
    experience: number;
    gpa: number;
    certifications: number;
  };
  preferredSkills: string[];
  minimumGPA: number;
  applicationDeadline: string;
  positions: number;
  requirements: string[];
  benefits: string[];
  isPublished: boolean;
}

interface Application {
  _id: string;
  internshipInfo: {
    title: string;
    company: string;
  };
  matchScore: {
    totalScore: number;
    breakdown: {
      skills: number;
      projects: number;
      experience: number;
      gpa: number;
      certifications: number;
    };
  };
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  appliedAt: string;
}

const StudentDashboard = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchInternships();
    fetchApplications();
  }, []);

  const fetchInternships = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/internships`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInternships(data.internships || []);
      }
    } catch (error) {
      console.error('Error fetching internships:', error);
      toast.error('Failed to fetch internships');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/applications/student`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleApplyToInternship = async (internshipId: string) => {
    if (!resumeFile) {
      toast.error('Please upload a resume first');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const response = await fetch(`${API_BASE_URL}/api/applications/apply/${internshipId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Application submitted! Match Score: ${data.matchScore.totalScore.toFixed(1)}%`);
        fetchApplications();
        setSelectedInternship(null);
        setResumeFile(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error applying to internship:', error);
      toast.error('Failed to submit application');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'shortlisted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'accepted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'reviewed': return <Eye className="h-4 w-4" />;
      case 'shortlisted': return <TrendingUp className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 font-semibold';
    if (score >= 60) return 'text-blue-600 font-semibold';
    if (score >= 40) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-2">Discover internships and track your applications</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Internships</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{internships.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Match Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.length > 0 
                ? (applications.reduce((sum, app) => sum + app.matchScore.totalScore, 0) / applications.length).toFixed(1) + '%'
                : 'N/A'
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter(app => app.status === 'shortlisted' || app.status === 'accepted').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="internships" className="space-y-6">
        <TabsList>
          <TabsTrigger value="internships">Available Internships</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="internships" className="space-y-4">
          <div className="grid gap-6">
            {internships.map((internship) => (
              <Card key={internship._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{internship.title}</CardTitle>
                      <p className="text-gray-600 mt-1">{internship.company.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{internship.domain}</Badge>
                      <Badge variant={internship.workMode === 'remote' ? 'default' : 'secondary'}>
                        {internship.workMode}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{internship.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {internship.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      {internship.salary.display}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      Apply by: {new Date(internship.applicationDeadline).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Briefcase className="h-4 w-4" />
                      {internship.positions} positions
                    </div>
                  </div>

                  {/* Matching Criteria */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Matching Criteria Weights:</h4>
                    <div className="grid grid-cols-5 gap-2 text-xs">
                      <div>Skills: {internship.matchingCriteria.skills}%</div>
                      <div>Projects: {internship.matchingCriteria.projects}%</div>
                      <div>Experience: {internship.matchingCriteria.experience}%</div>
                      <div>GPA: {internship.matchingCriteria.gpa}%</div>
                      <div>Certs: {internship.matchingCriteria.certifications}%</div>
                    </div>
                    {internship.minimumGPA > 0 && (
                      <p className="text-xs text-gray-600 mt-1">Minimum GPA: {internship.minimumGPA}</p>
                    )}
                  </div>

                  {/* Preferred Skills */}
                  {internship.preferredSkills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Preferred Skills:</h4>
                      <div className="flex flex-wrap gap-1">
                        {internship.preferredSkills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedInternship(internship)}
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={() => setSelectedInternship(internship)}
                      disabled={applications.some(app => app.internshipInfo.title === internship.title)}
                    >
                      {applications.some(app => app.internshipInfo.title === internship.title) 
                        ? 'Already Applied' 
                        : 'Apply Now'
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <div className="grid gap-4">
            {applications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-600">Start applying to internships to see your applications here</p>
                </CardContent>
              </Card>
            ) : (
              applications.map((application) => (
                <Card key={application._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{application.internshipInfo.title}</h3>
                        <p className="text-gray-600">{application.internshipInfo.company}</p>
                        <p className="text-sm text-gray-500">
                          Applied: {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className={`text-lg font-semibold ${getMatchScoreColor(application.matchScore.totalScore)}`}>
                            {application.matchScore.totalScore.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">Match Score</div>
                        </div>
                        <Badge className={`${getStatusColor(application.status)} flex items-center gap-1`}>
                          {getStatusIcon(application.status)}
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    {/* Match Score Breakdown */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium mb-2">Score Breakdown:</h4>
                      <div className="grid grid-cols-5 gap-2 text-xs">
                        <div>
                          <div className="font-medium">Skills</div>
                          <div className="text-gray-600">{application.matchScore.breakdown.skills.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="font-medium">Projects</div>
                          <div className="text-gray-600">{application.matchScore.breakdown.projects.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="font-medium">Experience</div>
                          <div className="text-gray-600">{application.matchScore.breakdown.experience.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="font-medium">GPA</div>
                          <div className="text-gray-600">{application.matchScore.breakdown.gpa.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="font-medium">Certs</div>
                          <div className="text-gray-600">{application.matchScore.breakdown.certifications.toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Application Modal */}
      {selectedInternship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedInternship.title}</h3>
                  <p className="text-gray-600">{selectedInternship.company.name}</p>
                </div>
                <button
                  onClick={() => setSelectedInternship(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-700">{selectedInternship.description}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Requirements</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {selectedInternship.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Benefits</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {selectedInternship.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Upload Resume</h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      className="w-full"
                    />
                    {resumeFile && (
                      <p className="text-sm text-green-600 mt-2">
                        Selected: {resumeFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedInternship(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleApplyToInternship(selectedInternship._id)}
                  disabled={!resumeFile || uploading}
                >
                  {uploading ? 'Applying...' : 'Apply Now'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;