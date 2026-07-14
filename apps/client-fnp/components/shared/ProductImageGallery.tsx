"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Expand, Share2, Link2, Check } from "lucide-react"
import { sendGTMEvent } from "@next/third-parties/google"
import { Dialog, DialogContent } from "@/components/ui/dialog"

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
    const [open, setOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    return (
        <>
            <div className="flex gap-2">
                {images.length > 1 && (
                    <div className="flex flex-col gap-2 shrink-0">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelected(idx)}
                                onMouseEnter={() => setSelected(idx)}
                                className={`relative w-16 h-16 rounded-lg overflow-hidden bg-background transition-colors ${
                                    selected === idx ? "ring-2 ring-primary" : "opacity-60 hover:opacity-100"
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
                <button
                    className="relative flex-1 bg-background rounded-xl overflow-hidden cursor-pointer group"
                    style={{ height }}
                    onClick={() => images[selected]?.img?.src && setOpen(true)}
                >
                    {images[selected]?.img?.src ? (
                        <Image
                            src={images[selected].img.src}
                            alt={name}
                            fill
                            sizes="(max-width: 1024px) 100vw, 480px"
                            className="object-contain"
                            priority
                        />
                    ) : (
                        <FpPlaceholder />
                    )}
                    {images[selected]?.img?.src && (
                        <span className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-background text-foreground shadow-sm">
                            <Expand className="w-4 h-4" />
                        </span>
                    )}
                </button>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-[95vw] w-full h-[92vh] p-0 bg-background">

                    <div className="flex h-full">
                        {images.length > 1 && (
                            <div className="flex flex-col gap-1.5 p-3 overflow-y-auto shrink-0 w-20">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelected(idx)}
                                        onMouseEnter={() => setSelected(idx)}
                                        className={`relative w-14 h-14 rounded-lg overflow-hidden bg-background shrink-0 transition-colors ${
                                            selected === idx ? "ring-2 ring-primary" : "opacity-60 hover:opacity-100"
                                        }`}
                                    >
                                        {img.img?.src ? (
                                            <Image src={img.img.src} alt={`${name} ${idx + 1}`} fill sizes="56px" className="object-contain p-0.5" />
                                        ) : (
                                            <FpPlaceholder size="sm" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="relative flex-1 flex items-center justify-center">
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setSelected((selected - 1 + images.length) % images.length)}
                                        className="absolute left-3 z-50 w-9 h-9 flex items-center justify-center rounded-full bg-background/80 hover:bg-muted text-foreground transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setSelected((selected + 1) % images.length)}
                                        className="absolute right-3 z-50 w-9 h-9 flex items-center justify-center rounded-full bg-background/80 hover:bg-muted text-foreground transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}

                            <div className="relative w-[60%] h-[70%]">
                                {images[selected]?.img?.src && (
                                    <Image
                                        src={images[selected].img.src}
                                        alt={name}
                                        fill
                                        sizes="60vw"
                                        className="object-contain"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 p-3 pt-12 shrink-0">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href)
                                    setCopied(true)
                                    sendGTMEvent({ event: "product_share", product_name: name })
                                    setTimeout(() => setCopied(false), 2000)
                                }}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-foreground transition-colors"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
                                {copied ? "Copied!" : "Copy link"}
                            </button>
                            <button
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({ title: name, url: window.location.href })
                                        sendGTMEvent({ event: "product_share", product_name: name })
                                    }
                                }}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm text-foreground transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
