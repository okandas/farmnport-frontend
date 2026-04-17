"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"
import { useTheme } from "next-themes"

declare global {
    interface Window {
        adsbygoogle: any[]
    }
}

export function AdSenseInFeed() {
    const adRef = useRef<HTMLModElement>(null)
    const hasPushed = useRef(false)
    const [adFilled, setAdFilled] = useState(false)
    const { resolvedTheme } = useTheme()

    const isProduction = process.env.NODE_ENV === "production"

    useEffect(() => {
        if (!isProduction) return
        if (hasPushed.current) return
        hasPushed.current = true

        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({})
        } catch (e) {
            console.error("AdSense error:", e)
        }

        const observer = new MutationObserver(() => {
            if (adRef.current && adRef.current.getAttribute("data-ad-status") === "filled") {
                setAdFilled(true)
            }
        })

        if (adRef.current) {
            observer.observe(adRef.current, { attributes: true })
        }

        return () => observer.disconnect()
    }, [isProduction])

    const isDark = resolvedTheme === "dark"

    if (!isProduction) return null

    return (
        <div className={`my-4 min-h-[100px] ${isDark ? "rounded-lg overflow-hidden bg-white p-1" : ""}`}>
            <Script
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9685248262342396"
                crossOrigin="anonymous"
                strategy="afterInteractive"
            />
            <ins className="adsbygoogle"
                ref={adRef}
                style={{ display: "block" }}
                data-ad-format="fluid"
                data-ad-layout-key="-gw-3+1f-3d+2z"
                data-ad-client="ca-pub-9685248262342396"
                data-ad-slot="1965423288"
            />
        </div>
    )
}
