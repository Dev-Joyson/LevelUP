"use client"

import { useState } from "react"
import { Card, CardContent } from "@/app/(panel)/admin/components/ui/card"
import { Button } from "@/app/(panel)/admin/components/ui/button"
import { Input } from "@/app/(panel)/admin/components/ui/input"
import { Badge } from "@/app/(panel)/admin/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/(panel)/admin/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/(panel)/admin/components/ui/table"
import { Search } from "lucide-react"
import { StudentCVModal } from "@/app/(panel)/admin/components/student-cv-modal"

const students = [
  {
    id: 1,
    name: "Ethan Harper",
    university: "State University",
    major: "Computer Science",
    status: "Active",
  },
  {
    id: 2,
    name: "Olivia Bennett",
    university: "City College",
    major: "Business Administration",
    status: "Pending",
  },
  {
    id: 3,
    name: "Noah Carter",
    university: "Tech Institute",
    major: "Electrical Engineering",
    status: "Active",
  },
  {
    id: 4,
    name: "Ava Davis",
    university: "Community College",
    major: "Marketing",
    status: "Suspended",
  },
  {
    id: 5,
    name: "Liam Evans",
    university: "Regional University",
    major: "Biology",
    status: "Active",
  },
  {
    id: 6,
    name: "Sophia Foster",
    university: "Global University",
    major: "Psychology",
    status: "Pending",
  },
  {
    id: 7,
    name: "Jackson Green",
    university: "National University",
    major: "Economics",
    status: "Active",
  },
  {
    id: 8,
    name: "Isabella Hayes",
    university: "Metropolitan College",
    major: "Sociology",
    status: "Suspended",
  },
  {
    id: 9,
    name: "Aiden Ingram",
    university: "Coastal University",
    major: "Environmental Science",
    status: "Active",
  },
  {
    id: 10,
    name: "Mia Jenkins",
    university: "Valley College",
    major: "Political Science",
    status: "Pending",
  },
]

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [universityFilter, setUniversityFilter] = useState("all")
  const [majorFilter, setMajorFilter] = useState("all")

  const [selectedStudent, setSelectedStudent] = useState<(typeof students)[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || student.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesUniversity = universityFilter === "all" || student.university === universityFilter
    const matchesMajor = majorFilter === "all" || student.major === majorFilter

    return matchesSearch && matchesStatus && matchesUniversity && matchesMajor
  })

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleViewStudent = (student: (typeof students)[0]) => {
    setSelectedStudent(student)
    setIsModalOpen(true)
  }

  const handleBlockProfile = (studentId: number) => {
    // Update the student status to suspended
    const updatedStudents = students.map((student) =>
      student.id === studentId ? { ...student, status: "Suspended" } : student,
    )
    // In a real app, you would update this in your state management or API
    console.log(`Blocked student with ID: ${studentId}`)
  }

  const universities = [...new Set(students.map((s) => s.university))]
  const majors = [...new Set(students.map((s) => s.major))]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Students</h1>
        <p className="text-gray-600 mt-1">Manage student accounts and applications</p>
      </div>

      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>

          <Select value={universityFilter} onValueChange={setUniversityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="University" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Universities</SelectItem>
              {universities.map((university) => (
                <SelectItem key={university} value={university}>
                  {university}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={majorFilter} onValueChange={setMajorFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Major" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Majors</SelectItem>
              {majors.map((major) => (
                <SelectItem key={major} value={major}>
                  {major}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="font-medium text-gray-600 py-4">Name</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">University</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Major</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Status</TableHead>
                <TableHead className="font-medium text-gray-600 py-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id} className="border-b border-gray-100">
                  <TableCell className="py-4 font-medium">{student.name}</TableCell>
                  <TableCell className="py-4 text-gray-600">{student.university}</TableCell>
                  <TableCell className="py-4 text-gray-600">{student.major}</TableCell>
                  <TableCell className="py-4">{getStatusBadge(student.status)}</TableCell>
                  <TableCell className="py-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      onClick={() => handleViewStudent(student)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <StudentCVModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBlockProfile={handleBlockProfile}
      />
    </div>
  )
}
