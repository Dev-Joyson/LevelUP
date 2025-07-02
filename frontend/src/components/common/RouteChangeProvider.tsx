"use client"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { GlobalLoader } from "./GlobalLoader"

export function RouteChangeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <>
      <GlobalLoader show={loading} />
      {children}
    </>
  )
} 