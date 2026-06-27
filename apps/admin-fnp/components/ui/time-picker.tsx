"use client"

import { Input } from "@/components/ui/input"

interface TimePickerProps {
  value: string
  onChange: (value: string) => void
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  return (
    <Input
      type="time"
      step="60"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
    />
  )
}
