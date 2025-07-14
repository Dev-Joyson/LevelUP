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
import { Loader } from "@/components/common/Loader"

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [universityFilter, setUniversityFilter] = useState("all")
  const [majorFilter, setMajorFilter] = useState("all")

  const [selectedStudent, setSelectedStudent] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

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
      } catch (error) {
        console.error("Error fetching students:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [])

  const filteredStudents = students.filter((student: any) => {
    // console.log("data intha"+ JSON.stringify(student))
    const name = student.firstname || ""
    const university = student.university || ""
    // Use education as major
    const major = student.education || student.major || ""
    // Status: Studying if graduationYear >= current year, else Completed
    const currentYear = new Date().getFullYear();
    let status = "Studying";
    if (student.graduationYear && Number(student.graduationYear) < currentYear) {
      status = "Completed";
    }

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
      case "studying":
        return <Badge className="bg-blue-100 text-blue-800">Studying</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleViewStudent = (student: any) => {
    setSelectedStudent(mapStudentForModal(student))
    setIsModalOpen(true)
  }

  const handleBlockProfile = (studentId: any) => {
    console.log(`Blocked student with ID: ${studentId}`)
    // You can send axios.post/put here to update status if needed
  }

  // const universities = [...new Set(students.map((s: any) => s.university))]
  // const majors = [...new Set(students.map((s: any) => s.major))]

  const universities = [...new Set(students.map((s: any) => s.university).filter(Boolean))]
  const majors = [...new Set(students.map((s: any) => s.major).filter(Boolean))]

  function mapStudentForModal(student: any) {
    return {
      id: student._id,
      name: student.firstname,
      university: student.university,
      major: student.education || student.major,
      // Status: Studying if graduationYear >= current year, else Completed
      status: (student.graduationYear && Number(student.graduationYear) < new Date().getFullYear()) ? "Completed" : "Studying",
      email: student.email,
      phone: student.phoneNumber,
      location: student.location,
      gpa: student.gpa,
      graduationYear: student.graduationYear,
      skills: student.skills,
      experience: student.experience,
      education: student.education,
      achievements: student.achievements,
      resumeUrl: student.resumeUrl,
    }
  }

  if (loading) return <Loader />

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
              <SelectItem value="studying">Studying</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
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
              {filteredStudents.map((student: any) => {
                const major = student.education || student.major;
                const currentYear = new Date().getFullYear();
                const status = (student.graduationYear && Number(student.graduationYear) < currentYear) ? "Completed" : "Studying";
                return (
                  <TableRow key={student._id}>
                    <TableCell>{student.firstname}</TableCell>
                    <TableCell>{student.university}</TableCell>
                    <TableCell>{major}</TableCell>
                    <TableCell>{getStatusBadge(status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleViewStudent(student)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
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
