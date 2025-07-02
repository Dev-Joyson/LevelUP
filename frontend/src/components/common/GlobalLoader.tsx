import React from "react"
import { Loader } from "./Loader"

export function GlobalLoader({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 pointer-events-none">
      <Loader />
    </div>
  )
} 