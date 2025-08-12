"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Calendar, Star, TrendingUp, Clock, CheckCircle } from "lucide-react"

interface StatsData {
  totalMentees: number
  totalSessions: number
  averageRating: number
  completedSessions: number
  upcomingSessions: number
  hoursSpent: number
}

interface StatsCardsProps {
  data: StatsData
}

export function MentorStatsCards({ data }: StatsCardsProps) {
  const stats = [
    {
      title: "Total Mentees",
      value: data.totalMentees,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+12%",
      changeType: "increase"
    },
    {
      title: "Total Sessions",
      value: data.totalSessions,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+8%",
      changeType: "increase"
    },
    {
      title: "Average Rating",
      value: data.averageRating.toFixed(1),
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      change: "+0.2",
      changeType: "increase"
    },
    {
      title: "Completed Sessions",
      value: data.completedSessions,
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+15%",
      changeType: "increase"
    },
    {
      title: "Upcoming Sessions",
      value: data.upcomingSessions,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: "3 this week",
      changeType: "neutral"
    },
    {
      title: "Hours Mentored",
      value: data.hoursSpent,
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      change: "+25h",
      changeType: "increase"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-600">{stat.title}</span>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="flex items-center gap-1">
                    {stat.changeType === "increase" && (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    )}
                    <span className={`text-xs font-medium ${
                      stat.changeType === "increase" ? "text-green-600" : 
                      stat.changeType === "neutral" ? "text-gray-600" : "text-red-600"
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
