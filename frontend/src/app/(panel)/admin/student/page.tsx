"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search } from "lucide-react"
import { StudentCVModal } from "@/components/ui/student-cv-modal"

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [universityFilter, setUniversityFilter] = useState("all")
  const [majorFilter, setMajorFilter] = useState("all")

  const [selectedStudent, setSelectedStudent] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 🔐 Token (can be from localStorage or login context)
  

  // 🔄 Fetch students using axios
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token") || "";

        const response = await axios.get("http://localhost:5000/api/admin/students", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setStudents(response.data.students || [])
        console.log("vanakkam data vanthuddu joly")
      } catch (error) {
        console.error("Error fetching students:", error)
      }
    }

    fetchStudents()
  }, [])
const filteredStudents = students.filter((student: any) => {
  // console.log("data intha"+ JSON.stringify(student))
  const name = student.firstname || ""
  const status = student.status || "active"
  const university = student.university || ""
  const major = student.major || ""

  const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase())
  const matchesStatus =
    statusFilter === "all" || status.toLowerCase() === statusFilter.toLowerCase()
  const matchesUniversity =
    universityFilter === "all" || university === universityFilter
  const matchesMajor = majorFilter === "all" || major === majorFilter

  return matchesSearch && matchesStatus && matchesUniversity && matchesMajor
})


  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student)
    setIsModalOpen(true)
  }

  const handleBlockProfile = (studentId: any) => {
    console.log(`Blocked student with ID: ${studentId}`)
    // You can send axios.post/put here to update status if needed
  }

  const universities = [...new Set(students.map((s: any) => s.university))]
  const majors = [...new Set(students.map((s: any) => s.major))]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Students</h1>
        <p className="text-gray-600 mt-1">Manage student accounts and applications</p>
      </div>

      {/* Search + Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>

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
              {universities.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
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
              {majors.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
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
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Major</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student: any) => (
                <TableRow key={student._id}>
                  <TableCell>{student.firstname}</TableCell>
                  <TableCell>{student.university}</TableCell>
                  <TableCell>{student.major}</TableCell>
                  <TableCell>{getStatusBadge(student.status)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleViewStudent(student)}>
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
