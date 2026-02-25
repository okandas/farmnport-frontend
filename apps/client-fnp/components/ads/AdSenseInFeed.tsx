"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"

declare global {
    interface Window {
        adsbygoogle: any[]
    }
}

export function AdSenseInFeed() {
    const adRef = useRef<HTMLModElement>(null)
    const [adFilled, setAdFilled] = useState(false)

    useEffect(() => {
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
    }, [])

    return (
        <div className="my-4">
            <Script
                async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9685248262342396"
                crossOrigin="anonymous"
                strategy="afterInteractive"
            />
            <ins className="adsbygoogle"
                ref={adRef}
                style={{ display: adFilled ? "block" : "none" }}
                data-ad-format="fluid"
                data-ad-layout-key="-gw-3+1f-3d+2z"
                data-ad-client="ca-pub-9685248262342396"
                data-ad-slot="1965423288"
            />
            {!adFilled && (
                <div className="p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
                    <p className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Sponsored</p>
                    <a href="#" onClick={(e) => e.preventDefault()} className="group block">
                        <h4 className="text-base font-medium text-blue-700 dark:text-blue-400 group-hover:underline leading-snug">
                            Premium Crop Protection Solutions — Shop Now
                        </h4>
                        <p className="text-xs text-green-700 dark:text-green-500 mt-1">www.example-agristore.com/crop-protection</p>
                        <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1 leading-relaxed">
                            Trusted fungicides, insecticides &amp; herbicides for every season. Free delivery on orders over KSh 5,000. PCPB-registered products only.
                        </p>
                    </a>
                </div>
            )}
        </div>
    )
}
