"use client"

import { useState, useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { ImagePlus, Loader2, X } from "lucide-react"
import Image from "next/image"
import { uploadImages, removeImage } from "@/lib/query"

interface UploadedImage {
  id: string
  src: string
  localUrl?: string
}

interface Props {
  entityId?: string
  entityType?: string
  maxImages?: number
  mainOnly?: boolean
  initialMainImage?: { img: { id: string; src: string } } | null
  initialImages?: { img: { id: string; src: string } }[]
  onMainImageChange?: (img: { img: { id: string; src: string } } | null) => void
  onImagesChange?: (imgs: { img: { id: string; src: string } }[]) => void
  onDelete?: () => void
}

export function ImageUpload({ entityId, entityType, maxImages = 5, mainOnly = false, initialMainImage, initialImages, onMainImageChange, onImagesChange, onDelete }: Props) {
  const [mainImage, setMainImage] = useState<UploadedImage | null>(
    initialMainImage ? { id: initialMainImage.img.id, src: initialMainImage.img.src } : null
  )
  const [images, setImages] = useState<UploadedImage[]>(
    initialImages ? initialImages.map((i) => ({ id: i.img.id, src: i.img.src })) : []
  )

  useEffect(() => {
    if (initialMainImage) setMainImage({ id: initialMainImage.img.id, src: initialMainImage.img.src })
  }, [initialMainImage?.img?.id])

  useEffect(() => {
    if (initialImages?.length) setImages(initialImages.map((i) => ({ id: i.img.id, src: i.img.src })))
  }, [initialImages?.length])

  const uploadMutation = useMutation({
    mutationFn: (data: FormData) => uploadImages(data),
    onError: () => toast.error("Failed to upload image"),
  })

  const removeMutation = useMutation({
    mutationFn: (img: UploadedImage) =>
      removeImage({ img: { id: img.id, src: img.src, entity_id: entityId ?? "" } }),
    onError: () => toast.error("Failed to remove image"),
  })

  const buildFormData = (fieldName: string, files: File[]) => {
    const fd = new FormData()
    fd.append("field_name", fieldName)
    if (entityId) fd.append("entity_id", entityId)
    if (entityType) fd.append("entity_type", entityType)
    files.forEach((f) => fd.append("product_image", f))
    return fd
  }

  const handleMainChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const localUrl = URL.createObjectURL(file)
    const res = await uploadMutation.mutateAsync(buildFormData("main_image", [file])) as any
    const uploaded = res?.data?.[0]
    if (uploaded) {
      const img = { id: uploaded.img.id, src: uploaded.img.src, localUrl }
      setMainImage(img)
      onMainImageChange?.({ img: { id: uploaded.img.id, src: uploaded.img.src } })
    }
    e.target.value = ""
  }

  const handleExtrasChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const toUpload = files.slice(0, maxImages - images.length)
    const localPreviews = toUpload.map((f) => URL.createObjectURL(f))
    const res = await uploadMutation.mutateAsync(buildFormData("images", toUpload)) as any
    const uploaded = (res?.data as any[]) ?? []
    const newImages: UploadedImage[] = uploaded.map((u, i) => ({
      id: u.img.id,
      src: u.img.src,
      localUrl: localPreviews[i],
    }))
    const next = [...images, ...newImages]
    setImages(next)
    onImagesChange?.(next.map((i) => ({ img: { id: i.id, src: i.src } })))
    e.target.value = ""
  }

  const removeMain = () => {
    if (!mainImage) return
    removeMutation.mutate(mainImage)
    setMainImage(null)
    onMainImageChange?.(null)
    if (!images.length) onDelete?.()
  }

  const removeExtra = (img: UploadedImage) => {
    removeMutation.mutate(img)
    const next = images.filter((i) => i.id !== img.id)
    setImages(next)
    onImagesChange?.(next.map((i) => ({ img: { id: i.id, src: i.src } })))
    if (!mainImage && next.length === 0) onDelete?.()
  }

  const isUploading = uploadMutation.isPending

  return (
    <div className="space-y-6">
      {/* Main image */}
      <div>
        <label className="block text-sm/6 font-medium text-gray-900 dark:text-white mb-2">Main photo</label>
        <div className="space-y-2">
          {!mainImage && (
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-main_image" className="flex flex-col items-center justify-center w-full h-32 border border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-3 pb-3">
                  {isUploading ? <Loader2 className="w-8 h-8 animate-spin text-gray-400" /> : (
                    <>
                      <ImagePlus className="w-8 h-8 text-gray-400" />
                      <p className="mt-2 text-xs text-gray-500">Click to upload</p>
                    </>
                  )}
                  <input id="dropzone-main_image" type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleMainChange} />
                </div>
              </label>
            </div>
          )}
          <div className="mt-2">
            {mainImage && (
              <div className="relative w-full h-48 overflow-hidden border border-gray-200 rounded-lg bg-white shadow-sm">
                <Image src={mainImage.localUrl ?? mainImage.src} alt="Main image" fill className="object-contain" />
                <button type="button" onClick={removeMain} className="w-6 h-6 flex items-center justify-center rounded-full bg-red-600 text-white absolute top-2 end-2 shadow-lg hover:bg-red-700 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional images */}
      {!mainOnly && <div>
        <label className="block text-sm/6 font-medium text-gray-900 dark:text-white mb-2">Additional photos <span className="text-gray-400 font-normal">(up to {maxImages})</span></label>
        <div className="space-y-2">
          {images.length < maxImages && (
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-images" className="flex flex-col items-center justify-center w-full h-32 border border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-3 pb-3">
                  {isUploading ? <Loader2 className="w-8 h-8 animate-spin text-gray-400" /> : (
                    <>
                      <ImagePlus className="w-8 h-8 text-gray-400" />
                      <p className="mt-2 text-xs text-gray-500">Click to upload</p>
                    </>
                  )}
                  <input id="dropzone-images" type="file" className="hidden" accept="image/jpeg,image/png,image/webp" multiple onChange={handleExtrasChange} />
                </div>
              </label>
            </div>
          )}
          <div className="flex flex-wrap mt-2">
            {images.map((img) => (
              <div key={img.id} className="inline-flex flex-col overflow-hidden border border-gray-200 rounded-lg mt-2 me-2 relative bg-white shadow-sm">
                <div className="flex items-center justify-center w-24 h-24 overflow-hidden bg-gray-50">
                  <Image src={img.localUrl ?? img.src} alt="Image" width={96} height={96} className="object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => removeExtra(img)}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-red-600 text-white absolute top-2 end-2 shadow-lg hover:bg-red-700 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {Array.from({ length: maxImages - images.length }).map((_, i) => (
              <div key={`ph-${i}`} className="inline-flex flex-col overflow-hidden border border-gray-200 rounded-lg mt-2 me-2 relative bg-white shadow-sm">
                <div className="flex items-center justify-center w-24 h-24 overflow-hidden bg-gray-50">
                  <ImagePlus className="w-8 h-8 text-gray-300" />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">Upload up to {maxImages} images.</p>
        </div>
      </div>}
    </div>
  )
}
