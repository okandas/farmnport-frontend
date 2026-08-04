"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"

interface LotImage {
  img: { id: string; src: string }
}

interface Props {
  mainImage?: LotImage | null
  images?: LotImage[]
  videoId?: string
}

export function LotImageGallery({ mainImage, images = [], videoId }: Props) {
  const all = [
    ...(mainImage ? [mainImage] : []),
    ...(images ?? []),
  ]

  const [selected, setSelected] = useState(0)
  const videoIndex = videoId ? all.length : -1
  const isVideo = videoId && selected === videoIndex
  const total = videoId ? all.length + 1 : all.length

  if (all.length === 0 && !videoId) return null

  const prev = () => setSelected((s) => (s - 1 + total) % total)
  const next = () => setSelected((s) => (s + 1) % total)

  return (
    <div>
      <div className="flex gap-3">
        {/* Thumbnail strip */}
        {total > 1 && (
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
            {videoId && (
              <button
                type="button"
                onClick={() => setSelected(videoIndex)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors shrink-0 flex items-center justify-center bg-muted/50 ${
                  isVideo ? "border-primary" : "border-border hover:border-muted-foreground"
                }`}
              >
                <Play className="w-5 h-5 fill-current" />
              </button>
            )}
          </div>
        )}

        {/* Main image / video */}
        <div className="relative flex-1 rounded-xl overflow-hidden border bg-muted/10 h-80">
          {isVideo ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?rel=0`}
              title="Lot video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          ) : all[selected] ? (
            <Image
              src={all[selected].img.src}
              alt="Lot photo"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 500px"
            />
          ) : null}

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-border shadow-md flex items-center justify-center hover:bg-white transition-colors z-10"
              >
                <ChevronLeft className="w-5 h-5 text-zinc-800" />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-border shadow-md flex items-center justify-center hover:bg-white transition-colors z-10"
              >
                <ChevronRight className="w-5 h-5 text-zinc-800" />
              </button>
            </>
          )}
        </div>
      </div>
      {videoId && !isVideo && (
        <button
          type="button"
          onClick={() => setSelected(videoIndex)}
          className="flex items-center gap-2 w-full mt-2 py-2.5 px-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors text-sm text-muted-foreground hover:text-foreground"
        >
          <Play className="w-4 h-4 fill-current" />
          Watch Video
        </button>
      )}
    </div>
  )
}
