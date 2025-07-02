"use client"

import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';

interface Application {
  _id: string;
  studentInfo: {
    name: string;
    email: string;
    phone: string;
  };
  internshipInfo: {
    title: string;
    _id: string;
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
  resumeData: {
    skills: {
      technical: string[];
      soft: string[];
      tools: string[];
    };
    projects: Array<{
      name: string;
      technologies: string[];
      description: string;
    }>;
    experience: Array<{
      company: string;
      position: string;
      duration: string;
      description: string;
    }>;
    gpa: number;
    certifications: string[];
  };
}

interface ApplicationsTableProps {
  companyId: string;
}

const ApplicationsTable: React.FC<ApplicationsTableProps> = ({ companyId }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'matchScore' | 'appliedAt' | 'status'>('matchScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [companyId, sortBy, sortOrder, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        sortBy,
        sortOrder,
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(
        `http://localhost:5000/api/applications/company/${companyId}?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/applications/${applicationId}/status`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      // Refresh applications
      fetchApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'shortlisted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'accepted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
        <button
          onClick={fetchApplications}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="accepted">Accepted</option>
          </select>
        </div>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="matchScore">Match Score</option>
            <option value="appliedAt">Applied Date</option>
            <option value="status">Status</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Applications Table */}
      {applications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No applications found for the selected criteria.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Internship
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Match Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((application) => (
                  <tr key={application._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {application.studentInfo.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.studentInfo.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {application.internshipInfo.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-lg ${getMatchScoreColor(application.matchScore.totalScore)}`}>
                        {application.matchScore.totalScore.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        S:{application.matchScore.breakdown.skills.toFixed(0)} 
                        P:{application.matchScore.breakdown.projects.toFixed(0)} 
                        E:{application.matchScore.breakdown.experience.toFixed(0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusBadgeColor(application.status)}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <select
                        value={application.status}
                        onChange={(e) => updateApplicationStatus(application._id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                        <option value="accepted">Accepted</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">Application Details</h3>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Info */}
                <div>
                  <h4 className="font-medium mb-2">Student Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {selectedApplication.studentInfo.name}</p>
                    <p><strong>Email:</strong> {selectedApplication.studentInfo.email}</p>
                    <p><strong>Phone:</strong> {selectedApplication.studentInfo.phone}</p>
                    <p><strong>GPA:</strong> {selectedApplication.resumeData.gpa}</p>
                  </div>
                </div>

                {/* Match Score Breakdown */}
                <div>
                  <h4 className="font-medium mb-2">Match Score Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Skills:</span>
                      <span className="font-medium">{selectedApplication.matchScore.breakdown.skills.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Projects:</span>
                      <span className="font-medium">{selectedApplication.matchScore.breakdown.projects.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Experience:</span>
                      <span className="font-medium">{selectedApplication.matchScore.breakdown.experience.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GPA:</span>
                      <span className="font-medium">{selectedApplication.matchScore.breakdown.gpa.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Certifications:</span>
                      <span className="font-medium">{selectedApplication.matchScore.breakdown.certifications.toFixed(1)}%</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total:</span>
                      <span className={getMatchScoreColor(selectedApplication.matchScore.totalScore)}>
                        {selectedApplication.matchScore.totalScore.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="font-medium mb-2">Skills</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Technical:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedApplication.resumeData.skills.technical.map((skill, index) => (
                          <Badge key={index} className="bg-blue-100 text-blue-800 text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Tools:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedApplication.resumeData.skills.tools.map((tool, index) => (
                          <Badge key={index} className="bg-green-100 text-green-800 text-xs">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Projects */}
                <div>
                  <h4 className="font-medium mb-2">Projects ({selectedApplication.resumeData.projects.length})</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedApplication.resumeData.projects.map((project, index) => (
                      <div key={index} className="border rounded p-2">
                        <p className="font-medium text-sm">{project.name}</p>
                        <p className="text-xs text-gray-600 mb-1">{project.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.map((tech, techIndex) => (
                            <Badge key={techIndex} className="bg-purple-100 text-purple-800 text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div className="md:col-span-2">
                  <h4 className="font-medium mb-2">Experience ({selectedApplication.resumeData.experience.length})</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedApplication.resumeData.experience.map((exp, index) => (
                      <div key={index} className="border rounded p-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{exp.position}</p>
                            <p className="text-sm text-gray-600">{exp.company}</p>
                          </div>
                          <p className="text-xs text-gray-500">{exp.duration}</p>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                {selectedApplication.resumeData.certifications.length > 0 && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium mb-2">Certifications</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedApplication.resumeData.certifications.map((cert, index) => (
                        <Badge key={index} className="bg-yellow-100 text-yellow-800">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsTable; 