"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { ApplyModal } from "./ApplyModal"

interface ApplyButtonProps {
  internshipId: string
  title: string
  companyName: string
  className?: string
}

export function ApplyButton({ internshipId, title, companyName, className }: ApplyButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  const handleOpenModal = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Please login to apply for internships')
      router.push('/login')
      return
    }
    
    setIsModalOpen(true)
  }
  
  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <Button 
        onClick={handleOpenModal}
        className={`bg-primary text-white hover:bg-white hover:border-1 hover:border-primary hover:text-primary rounded-md px-9 ${className}`}
      >
        Apply
      </Button>
      
      <ApplyModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        internshipId={internshipId}
        title={title}
        companyName={companyName}
      />
    </>
  )
}
