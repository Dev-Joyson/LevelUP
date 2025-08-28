"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Upload, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

interface ApplyModalProps {
  isOpen: boolean
  onClose: () => void
  internshipId: string
  title: string
  companyName: string
}

export function ApplyModal({ isOpen, onClose, internshipId, title, companyName }: ApplyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasResume, setHasResume] = useState(false)
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const router = useRouter()

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

  // Check if student has already uploaded a resume
  useEffect(() => {
    async function checkResume() {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const res = await fetch(`${API_BASE_URL}/api/student/profile`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (res.ok) {
          const data = await res.json()
          setHasResume(!!data.resumeUrl)
          setResumeUrl(data.resumeUrl || null)
        }
      } catch (err) {
        console.error("Failed to check resume:", err)
      }
    }
    
    if (isOpen) {
      checkResume()
    }
  }, [isOpen, API_BASE_URL])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are allowed")
      setUploadedFile(null)
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB")
      setUploadedFile(null)
      return
    }
    
    setUploadError("")
    setUploadedFile(file)
    setUploading(true)
    
    const formData = new FormData()
    formData.append("resume", file)
    
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setUploading(false)
        toast.error("Please log in to upload your resume")
        return
      }
      
      const res = await fetch(`${API_BASE_URL}/api/student/resume`, {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setResumeUrl(data.resumeUrl)
        setHasResume(true)
        setUploadError("")
        toast.success("Resume uploaded successfully")
      } else {
        setUploadError(data.message || "Failed to upload resume")
        toast.error(data.message || "Failed to upload resume")
      }
    } catch (err) {
      setUploadError("Server error. Please try again later.")
      toast.error("Failed to upload resume. Please try again later.")
    } finally {
      setUploading(false)
    }
  }

  const handleApply = async () => {
    if (!hasResume) {
      toast.error("Please upload your resume first")
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login to apply for internships')
        router.push('/login')
        return
      }

      setIsSubmitting(true)

      const response = await fetch(`${API_BASE_URL}/api/student/apply-internship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          internshipId
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Successfully applied to ${title} at ${companyName}!`)
        onClose()
        // Optionally redirect to applications page
        // router.push('/student/applications')
      } else {
        toast.error(data.message || 'Failed to apply to internship')
      }
    } catch (error) {
      console.error('Apply error:', error)
      toast.error('An error occurred while applying')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply for {title}</DialogTitle>
          <DialogDescription>
            {hasResume 
              ? `Submit your application to ${companyName} for the ${title} position.` 
              : "You need to upload your resume before applying for this internship."}
          </DialogDescription>
        </DialogHeader>
        
        {!hasResume ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-3">Upload your resume (PDF only, max 5MB)</p>
              
              <input
                type="file"
                id="resume-upload"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="resume-upload">
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Choose File"}
                </Button>
              </label>
              
              {uploadedFile && (
                <div className="text-sm mt-2">
                  Selected: {uploadedFile.name}
                </div>
              )}
              
              {uploadError && (
                <div className="flex items-center gap-1 text-sm text-red-500 mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-500">
              Your resume will be used to match you with this and future internship opportunities.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-green-50 text-green-700 p-4 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span>Your resume has been uploaded</span>
            </div>
            
            {resumeUrl && (
              <p className="text-sm text-gray-600">
                You can view or update your resume on your{" "}
                <a href="/student/resume" className="text-blue-600 underline">
                  profile page
                </a>
                .
              </p>
            )}
          </div>
        )}
        
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting || uploading}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!hasResume || isSubmitting || uploading}
            className="bg-primary text-white hover:bg-primary/90"
          >
            {isSubmitting ? "Applying..." : "Apply Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
