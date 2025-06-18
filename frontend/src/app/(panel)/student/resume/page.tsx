"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export default function StudentResumePage() {
  const [skills, setSkills] = useState([
    "Python",
    "Data Analysis",
    "Machine Learning",
    "Communication",
    "Project Management",
  ])
  const [newSkill, setNewSkill] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleAddSkill()
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Resume & Skills</h1>

        {/* Resume Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Resume</h2>

          <Card>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Left side - Upload section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload your resume</h3>
                  <p className="text-gray-600 mb-6">
                    Upload your resume to showcase your experience and qualifications.
                  </p>

                  <div className="space-y-4">
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Label htmlFor="resume-upload">
                      <Button
                        variant="outline"
                        className="cursor-pointer bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </span>
                      </Button>
                    </Label>

                    {uploadedFile && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Uploaded: {uploadedFile.name}</span>
                        <Button variant="ghost" size="sm" onClick={() => setUploadedFile(null)} className="h-6 w-6 p-0">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side - Resume illustration */}
                <div className="flex justify-center">
                  <div className="relative">
                    {/* Resume pages illustration */}
                    <div className="flex gap-4">
                      {/* First page */}
                      <div className="w-24 h-32 bg-gray-300 rounded shadow-sm transform rotate-[-5deg]"></div>
                      {/* Second page */}
                      <div className="w-24 h-32 bg-white border border-gray-300 rounded shadow-sm relative">
                        <div className="p-2 space-y-1">
                          <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-1 bg-gray-200 rounded w-full"></div>
                          <div className="h-1 bg-gray-200 rounded w-5/6"></div>
                          <div className="h-1 bg-gray-200 rounded w-4/5"></div>
                          <div className="mt-2 space-y-1">
                            <div className="h-1 bg-gray-200 rounded w-full"></div>
                            <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-1 bg-gray-200 rounded w-5/6"></div>
                          </div>
                        </div>
                      </div>
                      {/* Third page */}
                      <div className="w-24 h-32 bg-gray-300 rounded shadow-sm transform rotate-[5deg]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skills Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Skills</h2>

          <Card>
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Add skill input */}
                <div>
                  <Label htmlFor="skill-input" className="text-sm font-medium text-gray-700 mb-2 block">
                    Add a skill
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="skill-input"
                      type="text"
                      placeholder="e.g., Python"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 h-12 bg-gray-50 border-gray-200"
                    />
                    <Button
                      onClick={handleAddSkill}
                      disabled={!newSkill.trim()}
                      className="h-12 px-4 bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Skills list */}
                <div className="flex flex-wrap gap-3">
                  {skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {skills.length === 0 && (
                  <p className="text-gray-500 text-sm">No skills added yet. Add your first skill above.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
