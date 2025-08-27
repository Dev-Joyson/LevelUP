"use client"

import { ApplyButton } from "@/components/InterviewComponents/ApplyButton"

interface ApplyButtonWrapperProps {
  internshipId: string
  title: string
  companyName: string
}

export default function ApplyButtonWrapper({ 
  internshipId, 
  title, 
  companyName 
}: ApplyButtonWrapperProps) {
  return (
    <ApplyButton 
      internshipId={internshipId}
      title={title}
      companyName={companyName}
    />
  )
}
