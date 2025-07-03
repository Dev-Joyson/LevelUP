"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CompanySidebar } from "@/components/CompanyComponents/company-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"

const applicants = [
  {
    name: "Sophia Clark",
    education: "B.S. Computer Science, University of Tech",
    skills: "Java, Python, Data Structures",
    status: "Applied",
  },
  {
    name: "Ethan Miller",
    education: "B.S. Software Engineering, State University",
    skills: "C++, Algorithms, Problem Solving",
    status: "Applied",
  },
  {
    name: "Olivia Davis",
    education: "B.S. Information Technology, Tech Institute",
    skills: "JavaScript, React, Web Development",
    status: "Applied",
  },
  {
    name: "Noah Wilson",
    education: "B.S. Computer Engineering, City College",
    skills: "Embedded Systems, C, Microcontrollers",
    status: "Applied",
  },
  {
    name: "Ava Martinez",
    education: "B.S. Software Development, Community College",
    skills: "PHP, MySQL, Database Management",
    status: "Applied",
  },
]

export default function ApplicantsPage() {
  return (
    <>
      
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-8">
            <ApplicantsContent />
          </div>
        </div>
      </SidebarInset>
    </>
  )
}

function ApplicantsContent() {
  return (
    <div className="space-y-8 ">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Applicants for Software Engineering Internship</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Education</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applicants.map((applicant, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{applicant.name}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs">{applicant.education}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs">{applicant.skills}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{applicant.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      View Profile
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
