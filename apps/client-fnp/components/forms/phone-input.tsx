"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

const COUNTRIES = [
  { code: "ZW", label: "Zimbabwe", dialCode: "+263", flag: "\u{1F1FF}\u{1F1FC}", placeholder: "077 123 4567" },
  { code: "ZA", label: "South Africa", dialCode: "+27", flag: "\u{1F1FF}\u{1F1E6}", placeholder: "071 123 4567" },
  { code: "GB", label: "United Kingdom", dialCode: "+44", flag: "\u{1F1EC}\u{1F1E7}", placeholder: "07911 123456" },
  { code: "US", label: "United States", dialCode: "+1", flag: "\u{1F1FA}\u{1F1F8}", placeholder: "202 555 0123" },
]

interface PhoneInputProps {
  value: string
  onChange: (digits: string) => void
  error?: string
}

export function PhoneInput({ value, onChange, error }: PhoneInputProps) {
  const [countryCode, setCountryCode] = useState("ZW")
  const [localNumber, setLocalNumber] = useState(value || "")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const country = COUNTRIES.find((c) => c.code === countryCode)!

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [dropdownOpen])

  function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d\s]/g, "")
    setLocalNumber(raw)

    // Strip leading zero for international format, prepend dial code digits
    const digits = raw.replace(/\s/g, "")
    const stripped = digits.startsWith("0") ? digits.slice(1) : digits
    const full = country.dialCode.replace("+", "") + stripped
    onChange(full)
  }

  function handleCountryChange(code: string) {
    setCountryCode(code)
    setLocalNumber("")
    onChange("")
    setDropdownOpen(false)
  }

  return (
    <div>
      <div className={`flex rounded-md border overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent ${error ? "border-red-400" : "border-border"}`}>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3 h-full border-r border-border bg-muted/50 hover:bg-muted transition-colors text-sm"
          >
            <span>{country.flag}</span>
            <span className="text-muted-foreground font-medium">{country.dialCode}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 top-full mt-1 w-52 rounded-lg border border-border bg-card shadow-lg z-50 py-1 overflow-hidden">
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleCountryChange(c.code)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors ${c.code === countryCode ? "bg-primary/10 text-primary" : "text-foreground"}`}
                >
                  <span className="text-base">{c.flag}</span>
                  <span className="flex-1 text-left">{c.label}</span>
                  <span className="text-muted-foreground text-xs">{c.dialCode}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="tel"
          inputMode="numeric"
          placeholder={country.placeholder}
          value={localNumber}
          onChange={handleNumberChange}
          className="flex-1 px-3 py-2 text-sm placeholder:text-muted-foreground outline-none bg-transparent"
        />
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
