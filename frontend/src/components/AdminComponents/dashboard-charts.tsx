"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, Bar, BarChart, Tooltip, Legend } from "recharts"

const newUsersData = [
  { week: "Week 1", users: 45 },
  { week: "Week 2", users: 52 },
  { week: "Week 3", users: 38 },
  { week: "Week 4", users: 65 },
]

const engagementData = [
  { week: "Week 1", engagement: 78 },
  { week: "Week 2", engagement: 82 },
  { week: "Week 3", engagement: 85 },
  { week: "Week 4", engagement: 88 },
]

export function DashboardCharts() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">New Users Over Time</CardTitle>
          <div className="text-2xl font-bold text-green-600">+12%</div>
          <div className="text-sm text-muted-foreground">
            Last 30 Days <span className="text-green-600">+12%</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={newUsersData}>
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">User Engagement by Week</CardTitle>
          <div className="text-2xl font-bold text-green-600">+8%</div>
          <div className="text-sm text-muted-foreground">
            Last 4 Weeks <span className="text-green-600">+8%</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData}>
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="engagement" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
