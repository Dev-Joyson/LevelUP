import InternshipSidebar from '@/components/InterviewComponents/InternshipSidebar'
import React from 'react'

const internshipLayout = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="flex min-h-screen">
        <InternshipSidebar />
        <main className="flex-1 p-6 bg-white">{children}</main>
      </div>
    )
  }
  
  export default internshipLayout