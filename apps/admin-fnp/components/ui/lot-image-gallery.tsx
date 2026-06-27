"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface LotImage {
  img: { id: string; src: string }
}

interface Props {
  mainImage?: LotImage | null
  images?: LotImage[]
}

export function LotImageGallery({ mainImage, images = [] }: Props) {
  const all = [
    ...(mainImage ? [mainImage] : []),
    ...images,
  ]

  const [selected, setSelected] = useState(0)

  if (all.length === 0) return null

  const prev = () => setSelected((s) => (s - 1 + all.length) % all.length)
  const next = () => setSelected((s) => (s + 1) % all.length)

  return (
    <div className="flex gap-3">
      {/* Thumbnail strip */}
      {all.length > 1 && (
        <div className="flex flex-col gap-2 shrink-0">
          {all.map((img, i) => (
            <button
              key={img.img.id}
              type="button"
              onClick={() => setSelected(i)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors shrink-0 ${
                selected === i ? "border-primary" : "border-border hover:border-muted-foreground"
              }`}
            >
              <Image
                src={img.img.src}
                alt={`Photo ${i + 1}`}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative flex-1 rounded-xl overflow-hidden border bg-muted/10 h-80">
        <Image
          src={all[selected].img.src}
          alt="Lot photo"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 500px"
        />

        {all.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-border shadow-md flex items-center justify-center hover:bg-white transition-colors z-10"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-border shadow-md flex items-center justify-center hover:bg-white transition-colors z-10"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
