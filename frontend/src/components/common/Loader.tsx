import React from "react"

export function Loader() {
  return (
    <div className="flex items-center justify-center w-full h-full py-8">
      <div className="h-6 w-6 border-2 border-primary/50 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}