"use client"

import { useRef, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { ImagePlus, Loader2, X } from "lucide-react"
import Image from "next/image"
import { uploadImages, removeImage } from "@/lib/query"

interface LotImage {
  id: string
  src: string
  localUrl?: string
}

interface Props {
  lotId: string // lot ObjectID hex string
}

export function LotImageUpload({ lotId }: Props) {
  const [mainImage, setMainImage] = useState<LotImage | null>(null)
  const [images, setImages] = useState<LotImage[]>([])

  const mainRef = useRef<HTMLInputElement>(null)
  const extrasRef = useRef<HTMLInputElement>(null)

  const uploadMutation = useMutation({
    mutationFn: (data: FormData) => uploadImages(data),
    onError: () => toast.error("Failed to upload image"),
  })

  const removeMutation = useMutation({
    mutationFn: (img: LotImage) =>
      removeImage({ img: { id: img.id, src: img.src, entity_id: lotId } }),
    onError: () => toast.error("Failed to remove image"),
  })

  const handleMainChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const localUrl = URL.createObjectURL(file)
    const fd = new FormData()
    fd.append("entity_id", lotId)
    fd.append("entity_type", "lot")
    fd.append("field_name", "main_image")
    fd.append("product_image", file)
    const res = await uploadMutation.mutateAsync(fd) as any
    const uploaded = res?.data?.[0]
    if (uploaded) {
      setMainImage({ id: uploaded.img.id, src: uploaded.img.src, localUrl })
    }
    e.target.value = ""
  }

  const handleExtrasChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const toUpload = files.slice(0, 4 - images.length)
    const localPreviews = toUpload.map((f) => URL.createObjectURL(f))
    const fd = new FormData()
    fd.append("entity_id", lotId)
    fd.append("entity_type", "lot")
    fd.append("field_name", "images")
    toUpload.forEach((f) => fd.append("product_image", f))
    const res = await uploadMutation.mutateAsync(fd) as any
    const uploaded = (res?.data as any[]) ?? []
    const newImages: LotImage[] = uploaded.map((u, i) => ({
      id: u.img.id,
      src: u.img.src,
      localUrl: localPreviews[i],
    }))
    setImages((prev) => [...prev, ...newImages])
    e.target.value = ""
  }

  const removeMain = () => {
    if (!mainImage) return
    removeMutation.mutate(mainImage)
    setMainImage(null)
  }

  const removeExtra = (img: LotImage) => {
    removeMutation.mutate(img)
    setImages((prev) => prev.filter((i) => i.id !== img.id))
  }

  const isUploading = uploadMutation.isPending

  return (
    <div className="space-y-6">
      {/* Main image */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Main photo</p>
        <p className="text-xs text-muted-foreground">The primary image shown on the lot card.</p>

        {mainImage ? (
          <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-border">
            <Image
              src={mainImage.localUrl ?? mainImage.src}
              alt="Main lot image"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={removeMain}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => mainRef.current?.click()}
            disabled={isUploading}
            className="flex flex-col items-center justify-center w-48 h-48 border border-dashed border-border rounded-lg hover:bg-muted/40 transition-colors text-muted-foreground disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <ImagePlus className="w-7 h-7" />
                <span className="mt-2 text-xs">Add main photo</span>
              </>
            )}
          </button>
        )}

        <input
          ref={mainRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleMainChange}
        />
      </div>

      {/* Additional images */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">
          Additional photos <span className="text-muted-foreground font-normal">(up to 4)</span>
        </p>

        <div className="flex flex-wrap gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative w-32 h-32 rounded-lg overflow-hidden border border-border">
              <Image
                src={img.localUrl ?? img.src}
                alt="Lot image"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeExtra(img)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}

          {images.length < 4 && (
            <button
              type="button"
              onClick={() => extrasRef.current?.click()}
              disabled={isUploading}
              className="flex flex-col items-center justify-center w-32 h-32 border border-dashed border-border rounded-lg hover:bg-muted/40 transition-colors text-muted-foreground disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ImagePlus className="w-5 h-5" />
                  <span className="mt-1.5 text-xs">Add photo</span>
                </>
              )}
            </button>
          )}
        </div>

        <input
          ref={extrasRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleExtrasChange}
        />
      </div>
    </div>
  )
}
