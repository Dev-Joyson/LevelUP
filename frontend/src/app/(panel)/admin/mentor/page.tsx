"use client"

import { useState } from "react"
import { Card, CardContent } from "@/app/(panel)/admin/components/ui/card"
import { Button } from "@/app/(panel)/admin/components/ui/button"
import { Input } from "@/app/(panel)/admin/components/ui/input"
import { Badge } from "@/app/(panel)/admin/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/(panel)/admin/components/ui/table"
import { Search, UserPlus } from "lucide-react"
import { MentorDetailsModal } from "@/app/(panel)/admin/components/mentor-details-modal"
import { InviteMentorModal } from "@/app/(panel)/admin/components/invite-mentor-modal"

const mentors = [
  {
    id: 1,
    name: "Ethan Harper",
    email: "ethan.harper@example.com",
    company: "Tech Innovators Inc.",
    status: "Active",
    lastActive: "2 days ago",
    mentoringSessions: 12,
    expertise: "Software Engineering",
    experience: "8 years",
    bio: "Senior software engineer with expertise in full-stack development and team leadership.",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    joinedDate: "2023-01-15",
  },
  {
    id: 2,
    name: "Olivia Bennett",
    email: "olivia.bennett@example.com",
    company: "Global Solutions Ltd.",
    status: "Active",
    lastActive: "1 week ago",
    mentoringSessions: 8,
    expertise: "Business Strategy",
    experience: "12 years",
    bio: "Business consultant specializing in strategic planning and organizational development.",
    phone: "+1 (555) 234-5678",
    location: "New York, NY",
    joinedDate: "2023-02-20",
  },
  {
    id: 3,
    name: "Noah Carter",
    email: "noah.carter@example.com",
    company: "Digital Dynamics Co.",
    status: "Inactive",
    lastActive: "2 months ago",
    mentoringSessions: 5,
    expertise: "Digital Marketing",
    experience: "6 years",
    bio: "Digital marketing specialist with focus on social media and content strategy.",
    phone: "+1 (555) 345-6789",
    location: "Austin, TX",
    joinedDate: "2022-11-10",
  },
  {
    id: 4,
    name: "Ava Mitchell",
    email: "ava.mitchell@example.com",
    company: "Future Forward Enterprises",
    status: "Active",
    lastActive: "3 days ago",
    mentoringSessions: 15,
    expertise: "Product Management",
    experience: "10 years",
    bio: "Product manager with extensive experience in tech startups and product development.",
    phone: "+1 (555) 456-7890",
    location: "Seattle, WA",
    joinedDate: "2022-09-05",
  },
  {
    id: 5,
    name: "Liam Foster",
    email: "liam.foster@example.com",
    company: "Creative Minds Group",
    status: "Inactive",
    lastActive: "1 month ago",
    mentoringSessions: 7,
    expertise: "UX/UI Design",
    experience: "7 years",
    bio: "Creative designer specializing in user experience and interface design.",
    phone: "+1 (555) 567-8901",
    location: "Los Angeles, CA",
    joinedDate: "2023-03-12",
  },
]

type StatusFilter = "all" | "active" | "inactive" | "requests"

export default function MentorsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [selectedMentor, setSelectedMentor] = useState<(typeof mentors)[0] | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.company.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || mentor.status.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleViewMentor = (mentor: (typeof mentors)[0]) => {
    setSelectedMentor(mentor)
    setIsDetailsModalOpen(true)
  }

  const handleDeactivateMentor = (mentorId: number) => {
    // In a real app, you would update this in your state management or API
    console.log(`Deactivated mentor with ID: ${mentorId}`)
  }

  const getFilterButtonClass = (filter: StatusFilter) => {
    return statusFilter === filter
      ? "bg-blue-50 text-blue-700 border-b-2 border-blue-700"
      : "text-gray-600 hover:text-gray-900"
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Mentors</h1>
        <Button onClick={() => setIsInviteModalOpen(true)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Invite mentor
        </Button>
      </div>

      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search mentors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-8 border-b border-gray-200">
          <button
            onClick={() => setStatusFilter("all")}
            className={`pb-2 px-1 font-medium ${getFilterButtonClass("all")}`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`pb-2 px-1 font-medium ${getFilterButtonClass("active")}`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            className={`pb-2 px-1 font-medium ${getFilterButtonClass("inactive")}`}
          >
            Inactive
          </button>
          <button
            onClick={() => setStatusFilter("requests")}
            className={`pb-2 px-1 font-medium ${getFilterButtonClass("requests")}`}
          >
            Requests
          </button>
        </div>
      </div>

      {/* Mentors Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="font-medium text-gray-600 py-4">Name</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Email</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Company</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Status</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Last active</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Mentoring sessions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMentors.map((mentor) => (
                <TableRow
                  key={mentor.id}
                  className="border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleViewMentor(mentor)}
                >
                  <TableCell className="py-4 font-medium">{mentor.name}</TableCell>
                  <TableCell className="py-4 text-blue-600">{mentor.email}</TableCell>
                  <TableCell className="py-4 text-gray-600">{mentor.company}</TableCell>
                  <TableCell className="py-4">{getStatusBadge(mentor.status)}</TableCell>
                  <TableCell className="py-4 text-gray-600">{mentor.lastActive}</TableCell>
                  <TableCell className="py-4 text-gray-600">{mentor.mentoringSessions}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <MentorDetailsModal
        mentor={selectedMentor}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onDeactivateMentor={handleDeactivateMentor}
      />

      <InviteMentorModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
    </div>
  )
}
