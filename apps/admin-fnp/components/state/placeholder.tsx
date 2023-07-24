import * as React from "react"

import { cn } from "@/lib/utilities"
import { Icons } from "@/components/icons/lucide"

interface PlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Placeholder({
  className,
  children,
  ...props
}: PlaceholderProps) {
  return (
    <div
      className={cn(
        "flex min-h-full flex-col items-center justify-center rounded-md border shadow-sm p-8 text-center",
        className
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  )
}

interface PlaceholderIconProps extends Partial<React.SVGProps<SVGSVGElement>> {
  name: keyof typeof Icons
}

Placeholder.Icon = function PlaceHolderIcon({
  name,
  className,
  ...props
}: PlaceholderIconProps) {
  const Icon = Icons[name]

  if (!Icon) {
    return null
  }

  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full border">
      <Icon className={cn("h-10 w-10", className)} {...props} />
    </div>
  )
}

interface PlacholderTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

Placeholder.Title = function PlaceholderTitle({
  className,
  ...props
}: PlacholderTitleProps) {
  return (
    <h2 className={cn("mt-6 text-xl font-semibold", className)} {...props} />
  )
}

interface PlacholderDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

Placeholder.Description = function PlacholderDescriptionProps({
  className,
  ...props
}: PlacholderDescriptionProps) {
  return (
    <p
      className={cn(
        "mb-8 mt-2 text-center text-sm font-normal leading-6 text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
