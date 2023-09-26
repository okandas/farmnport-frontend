"use client"

import * as React from "react"

interface MainNavigationProps {
  children?: React.ReactNode
}

export function MainNavigation({ children }: MainNavigationProps) {
  return <div className="flex gap-4 md:gap-10">{children}</div>
}
