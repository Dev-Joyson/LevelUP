"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Building2, Briefcase, GraduationCap, Download, RefreshCw } from "lucide-react"
import { DashboardCard } from "@/components/AdminComponents/DashboardCard"
import { DashboardChart } from "@/components/AdminComponents/DashboardChart"
import { useDashboardData } from "@/hooks/useDashboardData"



export default function DashboardPage() {
  const { 
    stats, 
    chartData, 
    activities,
    topCompanies,
    loading, 
    error, 
    refetchData, 
    fetchRegistrationTrends,
    fetchInternshipAnalytics
  } = useDashboardData()

  const [chartType, setChartType] = useState<'students' | 'companies' | 'mentors' | 'internships'>('students')
  const [chartPeriod, setChartPeriod] = useState<'monthly' | 'weekly' | 'daily'>('monthly')

  const handleChartTypeChange = (type: 'students' | 'companies' | 'mentors' | 'internships') => {
    setChartType(type)
    if (type === 'internships') {
      fetchInternshipAnalytics('status')
    } else {
      fetchRegistrationTrends(type, chartPeriod)
    }
  }

  const handlePeriodChange = (period: 'monthly' | 'weekly' | 'daily') => {
    setChartPeriod(period)
    if (chartType !== 'internships') {
      fetchRegistrationTrends(chartType, period)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (error && loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-red-900">Error Loading Dashboard</h1>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
          <Button 
            onClick={refetchData} 
            className="bg-[#535c91] hover:bg-[#464f7a]"
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back, Admin!</h1>
          <p className="text-gray-600 text-sm mt-1">Let's check your platform stats today!</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="gap-2 bg-transparent" 
            onClick={refetchData}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Students"
          value={stats?.students.total || 0}
          growth={stats?.students.growth}
          icon={<Users className="h-4 w-4 text-[#535c91]" />}
          loading={loading}
        />
        <DashboardCard
          title="Active Companies"
          value={stats?.companies.total || 0}
          growth={stats?.companies.growth}
          icon={<Building2 className="h-4 w-4 text-[#535c91]" />}
          loading={loading}
        />
        <DashboardCard
          title="Total Mentors"
          value={stats?.mentors.total || 0}
          growth={stats?.mentors.growth}
          icon={<GraduationCap className="h-4 w-4 text-[#535c91]" />}
          loading={loading}
        />
        <DashboardCard
          title="Total Internships"
          value={stats?.internships.total || 0}
          growth={stats?.internships.growth}
          icon={<Briefcase className="h-4 w-4 text-[#535c91]" />}
          loading={loading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration/Analytics Overview */}
        <DashboardChart
          title={chartType === 'internships' ? 'Internship Analytics' : 'Registration Overview'}
          data={chartData}
          type={chartType === 'internships' ? 'pie' : 'area'}
          loading={loading}
          xKey="name"
          yKey="value"
          actions={
            <div className="flex gap-2 flex-wrap">
              <div className="flex gap-1">
                <Button 
                  variant={chartType === 'students' ? 'default' : 'ghost'} 
                  size="sm" 
                  className={chartType === 'students' ? 'bg-[#535c91] hover:bg-[#464f7a]' : 'text-[#535c91]'}
                  onClick={() => handleChartTypeChange('students')}
                >
                  Students
                </Button>
                <Button 
                  variant={chartType === 'companies' ? 'default' : 'ghost'} 
                  size="sm"
                  className={chartType === 'companies' ? 'bg-[#535c91] hover:bg-[#464f7a]' : 'text-[#535c91]'}
                  onClick={() => handleChartTypeChange('companies')}
                >
                  Companies
                </Button>
                <Button 
                  variant={chartType === 'mentors' ? 'default' : 'ghost'} 
                  size="sm"
                  className={chartType === 'mentors' ? 'bg-[#535c91] hover:bg-[#464f7a]' : 'text-[#535c91]'}
                  onClick={() => handleChartTypeChange('mentors')}
                >
                  Mentors
                </Button>
                <Button 
                  variant={chartType === 'internships' ? 'default' : 'ghost'} 
                  size="sm"
                  className={chartType === 'internships' ? 'bg-[#535c91] hover:bg-[#464f7a]' : 'text-[#535c91]'}
                  onClick={() => handleChartTypeChange('internships')}
                >
                  Analytics
                </Button>
              </div>
              {chartType !== 'internships' && (
                <div className="flex gap-1">
                  <Button 
                    variant={chartPeriod === 'monthly' ? 'default' : 'ghost'} 
                    size="sm"
                    className={chartPeriod === 'monthly' ? 'bg-[#6b7aa3] hover:bg-[#5f6e96]' : 'text-[#6b7aa3]'}
                    onClick={() => handlePeriodChange('monthly')}
                  >
                    Monthly
                  </Button>
                  <Button 
                    variant={chartPeriod === 'weekly' ? 'default' : 'ghost'} 
                    size="sm"
                    className={chartPeriod === 'weekly' ? 'bg-[#6b7aa3] hover:bg-[#5f6e96]' : 'text-[#6b7aa3]'}
                    onClick={() => handlePeriodChange('weekly')}
                  >
                    Weekly
                  </Button>
                  <Button 
                    variant={chartPeriod === 'daily' ? 'default' : 'ghost'} 
                    size="sm"
                    className={chartPeriod === 'daily' ? 'bg-[#6b7aa3] hover:bg-[#5f6e96]' : 'text-[#6b7aa3]'}
                    onClick={() => handlePeriodChange('daily')}
                  >
                    Daily
                  </Button>
                </div>
              )}
            </div>
          }
        />

        {/* Top Performing Companies */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Top Performing Companies</CardTitle>
            <Button variant="ghost" size="sm" className="text-[#535c91]">
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2"></div>
                  </div>
                ))}
              </div>
            ) : topCompanies && topCompanies.length > 0 ? (
              topCompanies.map((company, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">{company.name}</span>
                      {company.verified && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" title="Verified Company"></div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">{company.percentage}%</span>
                      <div className="text-xs text-gray-500">{company.internshipCount} posts</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${company.color}`} 
                      style={{ width: `${company.percentage}%` }} 
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                No company data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Company & Mentor Registrations</CardTitle>
          <Button variant="ghost" size="sm" className="text-[#535c91]">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="text-gray-600 font-medium">Date</TableHead>
                  <TableHead className="text-gray-600 font-medium">ID</TableHead>
                  <TableHead className="text-gray-600 font-medium">Name</TableHead>
                  <TableHead className="text-gray-600 font-medium">Details</TableHead>
                  <TableHead className="text-gray-600 font-medium">Type</TableHead>
                  <TableHead className="text-gray-600 font-medium">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities && activities.length > 0 ? (
                  activities.map((activity) => (
                    <TableRow key={activity.id} className="border-gray-100">
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(activity.date)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900 font-medium">
                        {activity.activityNo}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900 font-semibold">
                        <div className="flex items-center gap-2">
                          {activity.name}
                          {activity.verified && (
                            <div className="w-2 h-2 bg-green-500 rounded-full" title="Verified"></div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 max-w-xs">
                        {activity.details}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        <Badge 
                          variant="outline" 
                          className={
                            activity.type === "Company Registration" 
                              ? "border-blue-200 text-blue-700 bg-blue-50" 
                              : "border-purple-200 text-purple-700 bg-purple-50"
                          }
                        >
                          {activity.type === "Company Registration" ? "Company" : "Mentor"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            activity.status === "Verified"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          }
                        >
                          {activity.status}
                        </Badge>
                      </TableCell>
                     
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No recent registrations found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
