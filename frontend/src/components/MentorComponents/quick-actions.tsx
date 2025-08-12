"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Plus, Users, FileText, MessageSquare, Clock } from "lucide-react"

export function QuickActions() {
  const actions = [
    {
      title: "Schedule Session",
      description: "Book a new mentoring session",
      icon: Calendar,
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
      action: () => console.log("Schedule session"),
    },
    {
      title: "Add New Mentee",
      description: "Connect with a new student",
      icon: Plus,
      color: "bg-green-50 text-green-600 hover:bg-green-100",
      action: () => console.log("Add mentee"),
    },
    {
      title: "View All Mentees",
      description: "See your mentee list",
      icon: Users,
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
      action: () => console.log("View mentees"),
    },
    {
      title: "Create Resource",
      description: "Share learning materials",
      icon: FileText,
      color: "bg-orange-50 text-orange-600 hover:bg-orange-100",
      action: () => console.log("Create resource"),
    },
    {
      title: "Send Message",
      description: "Message your mentees",
      icon: MessageSquare,
      color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
      action: () => console.log("Send message"),
    },
    {
      title: "Session History",
      description: "Review past sessions",
      icon: Clock,
      color: "bg-gray-50 text-gray-600 hover:bg-gray-100",
      action: () => console.log("Session history"),
    },
  ]

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2 hover:shadow-md transition-all"
              onClick={action.action}
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">{action.title}</div>
                <div className="text-xs text-gray-500 mt-1">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
