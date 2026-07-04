"use client"

import { useState } from "react"
import { Link2, Check, Share2 } from "lucide-react"
import { sendGTMEvent } from "@next/third-parties/google"

interface ShareBarProps {
    name: string
}

export function ShareBar({ name }: ShareBarProps) {
    const [copied, setCopied] = useState(false)

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    setCopied(true)
                    sendGTMEvent({ event: "product_share", product_name: name, method: "copy_link" })
                    setTimeout(() => setCopied(false), 2000)
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Link2 className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy link"}
            </button>
            <button
                onClick={() => {
                    if (navigator.share) {
                        navigator.share({ title: name, url: window.location.href })
                        sendGTMEvent({ event: "product_share", product_name: name, method: "native_share" })
                    } else {
                        navigator.clipboard.writeText(window.location.href)
                        setCopied(true)
                        sendGTMEvent({ event: "product_share", product_name: name, method: "copy_link" })
                        setTimeout(() => setCopied(false), 2000)
                    }
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
                <Share2 className="w-3.5 h-3.5" />
                Share
            </button>
        </div>
    )
}
