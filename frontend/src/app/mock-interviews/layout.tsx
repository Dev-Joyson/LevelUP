import { ReactNode } from 'react'

export default function MockInterviewsLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}
