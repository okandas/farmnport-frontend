"use client"

import { Share2 } from "lucide-react"

interface ShareButtonProps {
  url: string
  title: string
}

export function ShareButton({ url, title }: ShareButtonProps) {
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title, url })
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <button onClick={handleShare} className="flex items-start gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
      <Share2 className="w-3 h-3 shrink-0 mt-0.5" />
      <span>Share this product with someone who needs it</span>
    </button>
  )
}
