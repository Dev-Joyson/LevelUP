"use client"

import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface TimePickerInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function TimePickerInput({ value, onChange, disabled = false }: TimePickerInputProps) {
  const [open, setOpen] = useState(false)
  const [hours, minutes] = value.split(':').map(Number)
  
  // Generate time options
  const generateTimeOptions = () => {
    const options = []
    
    // Generate hours from 0 to 23
    for (let h = 0; h < 24; h++) {
      // Generate minutes in 30-minute increments
      for (let m = 0; m < 60; m += 30) {
        const hour = h.toString().padStart(2, '0')
        const minute = m.toString().padStart(2, '0')
        options.push(`${hour}:${minute}`)
      }
    }
    
    return options
  }
  
  const timeOptions = generateTimeOptions()
  
  // Format time for display
  const formatTimeForDisplay = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }
  
  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          disabled={disabled}
        >
          {formatTimeForDisplay(value)}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="h-[300px] overflow-auto p-1">
          {timeOptions.map((time) => (
            <div
              key={time}
              className={`px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 ${
                time === value ? 'bg-gray-100 font-medium' : ''
              }`}
              onClick={() => {
                onChange(time)
                setOpen(false)
              }}
            >
              {formatTimeForDisplay(time)}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
