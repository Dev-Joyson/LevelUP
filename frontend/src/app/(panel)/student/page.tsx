"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  DollarSign,
  User,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Bookmark,
  Users,
  Award,
  Target,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-toastify';
import Link from 'next/link';

interface DashboardData {
  profile: {
    name: string;
    email: string;
    university: string;
    graduationYear: string;
    profileImageUrl?: string;
    completionPercentage: number;
  };
  statistics: {
    applications: {
      total: number;
      pending: number;
      reviewed: number;
      shortlisted: number;
      accepted: number;
      rejected: number;
    };
    averageMatchScore: number;
    successRate: number;
    savedInternships: number;
    mentorSessions: {
      total: number;
      completed: number;
      upcoming: number;
      cancelled: number;
    };
    mockInterviews: {
      total: number;
      averageScore: number;
      lastAttempted: string | null;
    };
  };
  recentActivity: {
    applications: Array<{
      id: string;
      internshipTitle: string;
      companyName: string;
      domain: string;
      status: string;
      appliedAt: string;
      matchScore: number;
    }>;
  };
}

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to view dashboard');
        return;
      }

      console.log('Fetching dashboard data with token:', token ? 'Token present' : 'No token');

      const response = await fetch(`${API_BASE_URL}/api/student/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Dashboard API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard data received:', data);
        setDashboardData(data);
      } else {
        const errorText = await response.text();
        console.error('Dashboard API error:', response.status, errorText);
        throw new Error(`Failed to fetch dashboard data: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'reviewed': return <Eye className="h-3 w-3" />;
      case 'shortlisted': return <TrendingUp className="h-3 w-3" />;
      case 'rejected': return <XCircle className="h-3 w-3" />;
      case 'accepted': return <CheckCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Failed to load dashboard data</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header with Profile Info */}
     <div className="flex justify-between items-start">
  <div className="flex items-center space-x-4">
    <Avatar className="h-16 w-16">
      <AvatarImage src={dashboardData.profile.profileImageUrl} />
      <AvatarFallback>
        {dashboardData.profile.name.split(' ').map(n => n[0]).join('')}
      </AvatarFallback>
    </Avatar>
    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        Welcome back, {dashboardData.profile.name.split(' ')[0]}!
      </h1>
      <p className="text-gray-600">
        {dashboardData.profile.university} • Class of {dashboardData.profile.graduationYear}
      </p>
      <p className="text-sm text-gray-500">{dashboardData.profile.email}</p>
    </div>
  </div>
  <Card className="w-64 bg-blue-200/20 backdrop-blur-lg border border-blue-100/30">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-800">Profile Completion</span>
        <span className="text-sm text-gray-600">{dashboardData.profile.completionPercentage}%</span>
      </div>
      <Progress value={dashboardData.profile.completionPercentage} className="h-2" />
      <Link href="/student/profile">
        <Button variant="outline" size="sm" className="w-full mt-3">
          Complete Profile
        </Button>
      </Link>
    </CardContent>
  </Card>
</div>

{/* Main Statistics Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">

  {/* Applications */}
  <Card className="bg-blue-200/20 backdrop-blur-lg border border-blue-100/30">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-800">Total Applications</CardTitle>
      <Briefcase className="h-6 w-6 text-blue-500" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-900">{dashboardData.statistics.applications.total}</div>
      <p className="text-xs text-gray-600">
        {dashboardData.statistics.applications.accepted + dashboardData.statistics.applications.shortlisted} successful
      </p>
    </CardContent>
  </Card>

  {/* Average Match Score */}
  <Card className="bg-blue-200/20 backdrop-blur-lg border border-blue-100/30">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-800">Average Match Score</CardTitle>
      <Target className="h-6 w-6 text-green-500" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-900">{dashboardData.statistics.averageMatchScore}%</div>
      <p className="text-xs text-gray-600">
        {dashboardData.statistics.successRate}% success rate
      </p>
    </CardContent>
  </Card>

  {/* Saved Internships */}
  <Card className="bg-blue-200/20 backdrop-blur-lg border border-blue-100/30">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-800">Saved Internships</CardTitle>
      <Bookmark className="h-6 w-6 text-purple-500" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-900">{dashboardData.statistics.savedInternships}</div>
      <Link href="/student/saved-internships">
        <p className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
          View saved →
        </p>
      </Link>
    </CardContent>
  </Card>

  {/* Mentor Sessions */}
  <Card className="bg-blue-200/20 backdrop-blur-lg border border-blue-100/30">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-800">Mentor Sessions</CardTitle>
      <Users className="h-6 w-6 text-orange-500" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-900">{dashboardData.statistics.mentorSessions.total}</div>
      <p className="text-xs text-gray-600">
        {dashboardData.statistics.mentorSessions.upcoming} upcoming
      </p>
    </CardContent>
  </Card>

</div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Application Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Pending', count: dashboardData.statistics.applications.pending, color: 'bg-yellow-500' },
              { label: 'Reviewed', count: dashboardData.statistics.applications.reviewed, color: 'bg-blue-500' },
              { label: 'Shortlisted', count: dashboardData.statistics.applications.shortlisted, color: 'bg-green-500' },
              { label: 'Accepted', count: dashboardData.statistics.applications.accepted, color: 'bg-purple-500' },
              { label: 'Rejected', count: dashboardData.statistics.applications.rejected, color: 'bg-red-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm">{item.label}</span>
                </div>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mock Interview Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Mock Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {dashboardData.statistics.mockInterviews.total}
                </div>
                <p className="text-sm text-gray-600">Completed Interviews</p>
              </div>
              {dashboardData.statistics.mockInterviews.total > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-semibold text-green-600">
                    {dashboardData.statistics.mockInterviews.averageScore.toFixed(1)}/100
                  </div>
                  <p className="text-sm text-gray-600">Average Score</p>
                </div>
              )}
              <Link href="/student/mock-interviews">
                <Button variant="outline" className="w-full">
                  {dashboardData.statistics.mockInterviews.total === 0 ? 'Start Practice' : 'View History'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/internship">
              <Button className="w-full justify-start" variant="outline">
                <Briefcase className="h-4 w-4 mr-2" />
                Explore Internships
              </Button>
            </Link>
            <Link href="/student/resume">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Update Resume
              </Button>
            </Link>
            <Link href="/student/mentorship">
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Find Mentor
              </Button>
            </Link>
            <Link href="/student/mock-interviews">
              <Button className="w-full justify-start" variant="outline">
                <Award className="h-4 w-4 mr-2" />
                Practice Interview
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.recentActivity.applications.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-600 mb-4">Start applying to internships to see your activity here</p>
              <Link href="/internship">
                <Button>Browse Internships</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.recentActivity.applications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{application.internshipTitle}</h4>
                      <p className="text-sm text-gray-600">{application.companyName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {application.domain}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Applied {new Date(application.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`${getStatusColor(application.status)} text-xs flex items-center gap-1`}>
                        {getStatusIcon(application.status)}
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium text-blue-600">
                      {application.matchScore.toFixed(1)}% match
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center">
                <Link href="/student/applications">
                  <Button variant="outline">View All Applications</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;