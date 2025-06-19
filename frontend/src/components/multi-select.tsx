"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Check, ChevronDown, X } from "lucide-react"

interface MultiSelectProps {
  options: string[]
  selectedValues: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
}

export function MultiSelect({ options, selectedValues, onChange, placeholder = "Select options" }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((item) => item !== option))
    } else {
      onChange([...selectedValues, option])
    }
  }

  const removeOption = (option: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selectedValues.filter((item) => item !== option))
  }

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-2 border rounded-md bg-white"
      >
        <div className="flex flex-wrap gap-1">
          {selectedValues.length === 0 ? (
            <span className="text-gray-500">{placeholder}</span>
          ) : (
            selectedValues.map((value) => (
              <span key={value} className="bg-gray-100 px-2 py-0.5 rounded-md text-sm flex items-center">
                {value}
                <X className="ml-1 h-3 w-3 cursor-pointer" onClick={(e) => removeOption(value, e)} />
              </span>
            ))
          )}
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => toggleOption(option)}
              className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
            >
              <div className="w-5 h-5 border rounded-sm mr-2 flex items-center justify-center">
                {selectedValues.includes(option) && <Check className="h-3 w-3" />}
              </div>
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
