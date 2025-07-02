"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Briefcase, Clock, CheckCircle } from "lucide-react"

const internships = [
  {
    title: "Software Engineering Intern",
    department: "Engineering",
    location: "Remote",
    applicants: 25,
    status: "Open",
  },
  {
    title: "Marketing Intern",
    department: "Marketing",
    location: "New York, NY",
    applicants: 15,
    status: "Closed",
  },
  {
    title: "Product Management Intern",
    department: "Product",
    location: "San Francisco, CA",
    applicants: 30,
    status: "Open",
  },
]

const applicants = [
  {
    name: "Ethan Carter",
    university: "Stanford University",
    major: "Computer Science",
    skills: "Python, Java, C++",
  },
  {
    name: "Olivia Bennett",
    university: "MIT",
    major: "Electrical Engineering",
    skills: "MATLAB, Simulink",
  },
  {
    name: "Noah Thompson",
    university: "UC Berkeley",
    major: "Data Science",
    skills: "R, SQL, Machine Learning",
  },
  {
    name: "Ava Rodriguez",
    university: "Carnegie Mellon",
    major: "Software Engineering",
    skills: "JavaScript, React, Node.js",
  },
  {
    name: "Liam Walker",
    university: "University of Michigan",
    major: "Computer Engineering",
    skills: "Verilog, VHDL",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's an overview of your internship program.</p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Internships</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Applicants</p>
                <p className="text-2xl font-bold">247</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold">34</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hired This Month</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input id="company-name" placeholder="Enter company name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" placeholder="Enter industry" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Company Description</Label>
            <Textarea id="description" placeholder="Enter company description" className="min-h-[100px]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="Enter location" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" placeholder="Enter website URL" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Internship Posting Management */}
      <Card>
        <CardHeader>
          <CardTitle>Internship Posting Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {internships.map((internship, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{internship.title}</TableCell>
                  <TableCell className="text-muted-foreground">{internship.department}</TableCell>
                  <TableCell className="text-muted-foreground">{internship.location}</TableCell>
                  <TableCell>{internship.applicants}</TableCell>
                  <TableCell>
                    <Badge variant={internship.status === "Open" ? "default" : "secondary"}>{internship.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Applicant Filtering and Viewing */}
      <Card>
        <CardHeader>
          <CardTitle>Applicant Filtering and Viewing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="internship-filter">Internship</Label>
              <Input id="internship-filter" placeholder="Select internship" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Input id="status-filter" placeholder="Select status" />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Major</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Resume</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applicants.map((applicant, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{applicant.name}</TableCell>
                  <TableCell className="text-muted-foreground">{applicant.university}</TableCell>
                  <TableCell className="text-muted-foreground">{applicant.major}</TableCell>
                  <TableCell className="text-muted-foreground">{applicant.skills}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
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
