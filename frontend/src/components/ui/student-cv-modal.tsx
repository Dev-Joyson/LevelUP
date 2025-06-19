"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin, Calendar, GraduationCap, Briefcase, Award, Shield } from "lucide-react"

interface Student {
  id: number
  name: string
  university: string
  major: string
  status: string
  email?: string
  phone?: string
  location?: string
  gpa?: string
  graduationYear?: string
  skills?: string[]
  experience?: Array<{
    title: string
    company: string
    duration: string
    description: string
  }>
  education?: Array<{
    degree: string
    institution: string
    year: string
    gpa: string
  }>
  achievements?: string[]
}

interface StudentCVModalProps {
  student: Student | null
  isOpen: boolean
  onClose: () => void
  onBlockProfile: (studentId: number) => void
}

export function StudentCVModal({ student, isOpen, onClose, onBlockProfile }: StudentCVModalProps) {
  if (!student) return null

  const handleBlockProfile = () => {
    onBlockProfile(student.id)
    onClose()
  }

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-bold">{student.name} - CV Profile</DialogTitle>
          <div className="flex items-center gap-2">
            {getStatusBadge(student.status)}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBlockProfile}
              className="flex items-center gap-2"
              disabled={student.status.toLowerCase() === "suspended"}
            >
              <Shield className="h-4 w-4" />
              {student.status.toLowerCase() === "suspended" ? "Blocked" : "Block Profile"}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {student.email || `${student.name.toLowerCase().replace(" ", ".")}@email.com`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{student.phone || "+1 (555) 123-4567"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{student.location || "New York, NY"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Graduation: {student.graduationYear || "2024"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-2 border-blue-200 pl-4">
                  <h4 className="font-semibold">Bachelor of Science in {student.major}</h4>
                  <p className="text-gray-600">{student.university}</p>
                  <p className="text-sm text-gray-500">Expected Graduation: {student.graduationYear || "2024"}</p>
                  <p className="text-sm text-gray-500">GPA: {student.gpa || "3.8/4.0"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(student.skills || getDefaultSkills(student.major)).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(student.experience || getDefaultExperience(student.major)).map((exp, index) => (
                  <div key={index} className="border-l-2 border-green-200 pl-4">
                    <h4 className="font-semibold">{exp.title}</h4>
                    <p className="text-gray-600">{exp.company}</p>
                    <p className="text-sm text-gray-500">{exp.duration}</p>
                    <p className="text-sm mt-2">{exp.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements & Awards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(student.achievements || getDefaultAchievements(student.major)).map((achievement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Award className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{achievement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helper functions to generate default data based on major
function getDefaultSkills(major: string): string[] {
  const skillsMap: { [key: string]: string[] } = {
    "Computer Science": ["JavaScript", "Python", "React", "Node.js", "SQL", "Git", "AWS"],
    "Business Administration": ["Project Management", "Excel", "PowerPoint", "Market Analysis", "Leadership"],
    "Electrical Engineering": ["Circuit Design", "MATLAB", "AutoCAD", "PLC Programming", "Power Systems"],
    Marketing: ["Digital Marketing", "SEO", "Google Analytics", "Social Media", "Content Creation"],
    Biology: ["Laboratory Techniques", "Data Analysis", "Research Methods", "Microscopy", "Statistical Analysis"],
    Psychology: ["Research Methods", "SPSS", "Counseling Techniques", "Data Analysis", "Report Writing"],
    Economics: ["Statistical Analysis", "Econometrics", "Excel", "R Programming", "Financial Modeling"],
    Sociology: ["Research Methods", "Data Collection", "Survey Design", "Statistical Analysis", "Report Writing"],
    "Environmental Science": ["GIS", "Environmental Monitoring", "Data Analysis", "Field Research", "Lab Techniques"],
    "Political Science": ["Research Methods", "Policy Analysis", "Public Speaking", "Writing", "Critical Thinking"],
  }
  return skillsMap[major] || ["Communication", "Problem Solving", "Teamwork", "Leadership", "Time Management"]
}

function getDefaultExperience(
  major: string,
): Array<{ title: string; company: string; duration: string; description: string }> {
  const experienceMap: {
    [key: string]: Array<{ title: string; company: string; duration: string; description: string }>
  } = {
    "Computer Science": [
      {
        title: "Software Development Intern",
        company: "Tech Solutions Inc.",
        duration: "Jun 2023 - Aug 2023",
        description:
          "Developed web applications using React and Node.js, collaborated with senior developers on feature implementation.",
      },
    ],
    "Business Administration": [
      {
        title: "Business Analyst Intern",
        company: "Corporate Dynamics",
        duration: "Jun 2023 - Aug 2023",
        description:
          "Analyzed business processes, created reports and presentations, assisted with project management tasks.",
      },
    ],
  }
  return (
    experienceMap[major] || [
      {
        title: "Intern",
        company: "Professional Services Co.",
        duration: "Jun 2023 - Aug 2023",
        description:
          "Gained hands-on experience in professional environment, contributed to team projects and daily operations.",
      },
    ]
  )
}

function getDefaultAchievements(major: string): string[] {
  return [
    "Dean's List - Fall 2023",
    "Academic Excellence Award",
    "Student Leadership Recognition",
    "Volunteer of the Year - Community Service",
  ]
}
