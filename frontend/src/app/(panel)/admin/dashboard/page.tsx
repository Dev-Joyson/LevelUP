"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Users, Building2, Briefcase, TrendingUp, TrendingDown, Download, Plus } from "lucide-react"
import { Loader } from "@/components/common/Loader"
import { useState, useEffect } from "react"

const chartData = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 5000 },
  { name: "Apr", value: 4500 },
  { name: "May", value: 6000 },
  { name: "Jun", value: 5500 },
  { name: "Jul", value: 7000 },
]

const countryData = [
  { name: "United States", percentage: 50, color: "bg-[#535c91]" },
  { name: "United Kingdom", percentage: 20, color: "bg-[#6b7aa3]" },
  { name: "Bangladesh", percentage: 10, color: "bg-[#8390b5]" },
]

const recentActivities = [
  {
    date: "27 Aug 2024 at 3:30 PM",
    activityNo: "ACT001",
    description: "New Student Registration - John Doe",
    type: "Registration",
    status: "Completed",
  },
  {
    date: "26 Aug 2024 at 4:30 PM",
    activityNo: "ACT002",
    description: "Company Partnership - Tech Corp",
    type: "Partnership",
    status: "Completed",
  },
  {
    date: "25 Aug 2024 at 5:30 AM",
    activityNo: "ACT003",
    description: "Mentor Application - Sarah Wilson",
    type: "Application",
    status: "Pending",
  },
]

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading for demonstration
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return <Loader />

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back,</h1>
          <p className="text-gray-600 text-sm mt-1">Kazi! Let's check your platform stats today!</p>
        </div>
        {/* <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
          <Button className="bg-[#535c91] hover:bg-[#464f7a] gap-2">
            <Plus className="h-4 w-4" />
            Add Student
          </Button>
        </div> */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#535c91]/10">
                    <Users className="h-4 w-4 text-[#535c91]" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Total Students</span>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-gray-900">1,234</div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs font-medium text-green-600">+15%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#535c91]/10">
                    <Building2 className="h-4 w-4 text-[#535c91]" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Active Companies</span>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-gray-900">150</div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs font-medium text-green-600">+12%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#535c91]/10">
                    <Briefcase className="h-4 w-4 text-[#535c91]" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Job Placements</span>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-gray-900">567</div>
                  <div className="flex items-center gap-1">
                    <TrendingDown className="h-3 w-3 text-red-500" />
                    <span className="text-xs font-medium text-red-600">-10%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Registration Overview */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Student Registration Overview</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-[#535c91]">
                Monthly View
              </Button>
              <Button variant="ghost" size="sm">
                Weekly View
              </Button>
              <Button variant="ghost" size="sm">
                Daily View
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#535c91" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#535c91" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#535c91"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Regions */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Top Performing Regions</CardTitle>
            <Button variant="ghost" size="sm" className="text-[#535c91]">
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {countryData.map((country, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{country.name}</span>
                  <span className="text-sm font-semibold text-gray-900">{country.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${country.color}`} style={{ width: `${country.percentage}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Platform Activities</CardTitle>
          <Button variant="ghost" size="sm" className="text-[#535c91]">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="text-gray-600 font-medium">Date</TableHead>
                <TableHead className="text-gray-600 font-medium">Activity ID</TableHead>
                <TableHead className="text-gray-600 font-medium">Description</TableHead>
                <TableHead className="text-gray-600 font-medium">Type</TableHead>
                <TableHead className="text-gray-600 font-medium">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivities.map((activity, index) => (
                <TableRow key={index} className="border-gray-100">
                  <TableCell className="text-sm text-gray-600">{activity.date}</TableCell>
                  <TableCell className="text-sm text-gray-900 font-medium">{activity.activityNo}</TableCell>
                  <TableCell className="text-sm text-gray-900">{activity.description}</TableCell>
                  <TableCell className="text-sm text-gray-900">{activity.type}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`${
                        activity.status === "Completed"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                      }`}
                    >
                      {activity.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
