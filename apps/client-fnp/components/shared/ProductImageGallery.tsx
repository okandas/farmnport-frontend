"use client"

import { useState, ReactNode } from "react"
import Image from "next/image"

function FpPlaceholder({ size = "lg" }: { size?: "sm" | "lg" }) {
    return (
        <div className={`flex items-center justify-center bg-muted/30 w-full h-full text-muted-foreground/30 font-semibold tracking-wide ${size === "lg" ? "text-4xl" : "text-xs"}`}>
            fp
        </div>
    )
}

interface ProductImageGalleryProps {
    images: Array<{ img: { src: string } }>
    name: string
    height?: number
    fallback?: React.ReactNode
}

export function ProductImageGallery({ images, name, height = 520, fallback }: ProductImageGalleryProps) {
    const [selected, setSelected] = useState(0)

    return (
        <div className="flex gap-2">
            {images.length > 1 && (
                <div className="flex flex-col gap-2 shrink-0">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelected(idx)}
                            className={`relative w-16 h-16 rounded-lg border-2 overflow-hidden bg-white transition-colors ${
                                selected === idx ? "border-primary" : "border-border hover:border-primary/50"
                            }`}
                        >
                            {img.img?.src ? (
                                <Image src={img.img.src} alt={`${name} ${idx + 1}`} fill sizes="64px" className="object-contain p-1" />
                            ) : (
                                <FpPlaceholder size="sm" />
                            )}
                        </button>
                    ))}
                </div>
            )}
            <div className="relative flex-1 bg-white rounded-xl border overflow-hidden" style={{ height }}>
                {images[selected]?.img?.src ? (
                    <Image
                        src={images[selected].img.src}
                        alt={name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 480px"
                        className="object-contain p-10"
                        priority
                    />
                ) : (
                    <FpPlaceholder />
                )}
            </div>
        </div>
    )
}
