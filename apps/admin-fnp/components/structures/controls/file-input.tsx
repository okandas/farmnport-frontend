import { useState } from 'react'
import { useDropzone, Accept } from 'react-dropzone';
import { Icons } from "@/components/icons/lucide"
import { useMutation } from "@tanstack/react-query"
import {
    ImageModel
} from "@/lib/schemas"
import { uploadImage, uploadImages, removeImage } from "@/lib/query"
import { handleUploadError, handleDeleteError } from "@/lib/error-handler"
import Image from 'next/image'
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Logtail } from "@logtail/node"

interface FileInputProps {
    value: ImageModel[],
    id?: string,
    fieldName?: string, // "images", "front_label", or "back_label"
    onChange: (value: any) => void
    thumbnailClassName?: string // Custom classes for thumbnail container
    imageClassName?: string // Custom classes for image container
    maxImages?: number // Maximum number of images allowed (default: unlimited for "images", 1 for labels)
    showPlaceholders?: boolean // Show empty state placeholders (default: false)
}



export function FileInput({ id, value, fieldName = "images", onChange, thumbnailClassName, imageClassName, maxImages, showPlaceholders = false }: FileInputProps) {
    const [files, setFiles] = useState<ImageModel[]>(value ?? [])
    const entity_id = id
    const logtail = new Logtail("qBaLFyhMa3oZsq86JuRmfwpo")

    // Use different mutation based on field type
    const isSingleField = fieldName === "front_label" || fieldName === "back_label"
    const effectiveMaxImages = maxImages ?? (isSingleField ? 1 : undefined)

    const mutationUploadImage = useMutation({
        mutationFn: isSingleField ? uploadImage : uploadImages,
        onSuccess: (data) => {

            if (data.data === null) {

                toast({
                    description: "There seems to be an issue with your upload, please wait and try again or contact admin if it persists.",
                    action: <ToastAction altText="Try again">Try again</ToastAction>,
                })

            } else {

                // For single fields, data.data is a single image; for arrays, it's an array
                const newImages = isSingleField ? [data.data] : [...files, ...data.data]
                onChange(newImages)
                setFiles(newImages)

            }
        },
        onSettled: () => {
        },
        onError(error) {

            handleUploadError(error)

            logtail.error("use mutation error line 52 file input", {
                error: error
            })

            logtail.flush()
        },
    })

    const accepts: Accept = {
        'image/jpeg': [],
        'image/png': [],
        'image/webp': []
    }

    const { getRootProps, getInputProps } = useDropzone({
        accept: accepts,
        multiple: !isSingleField,
        disabled: (isSingleField && files.length > 0) || (effectiveMaxImages !== undefined && files.length >= effectiveMaxImages),
        onDrop: (acceptedFiles) => {
            // Prevent upload if single field already has an image
            if (isSingleField && files.length > 0) {
                toast({
                    description: "Please remove the existing image before uploading a new one.",
                    variant: "destructive",
                })
                return
            }

            // Prevent upload if max images limit reached
            if (effectiveMaxImages !== undefined && files.length >= effectiveMaxImages) {
                toast({
                    description: `Maximum ${effectiveMaxImages} images allowed.`,
                    variant: "destructive",
                })
                return
            }

            // Check if new upload would exceed limit
            if (effectiveMaxImages !== undefined && files.length + acceptedFiles.length > effectiveMaxImages) {
                const remaining = effectiveMaxImages - files.length
                toast({
                    description: `You can only upload ${remaining} more image${remaining !== 1 ? 's' : ''}. Maximum ${effectiveMaxImages} images allowed.`,
                    variant: "destructive",
                })
                return
            }

            const formData = new FormData()

            if (entity_id !== undefined) {
                formData.append("entity_id", entity_id)
            }

            // Add field_name to indicate which field to update
            formData.append("field_name", fieldName)

            if (acceptedFiles.length) {

                acceptedFiles.forEach((attachment) => {
                    formData.append('product_image', attachment)
                })

                mutationUploadImage.mutate(formData)
            }
        },
        onError(error) {

            toast({
                description: "There seems to be an issue with your uploads, please wait and try again or contact admin.",
            })


            logtail.error("use dropzone error, line 86", {
                error: error
            })

            logtail.flush()

        }

    })

    const mutationRemoveImage = useMutation({
        mutationFn: removeImage,
        onSettled(_data, error, variables) {
            // Always remove from UI (force delete), even if backend returns error
            const image = variables
            const retainedImages = files.filter((file: ImageModel) => file.img.id !== image?.img.id)
            onChange(retainedImages)
            setFiles(retainedImages)

            // Still log/show error if it occurred
            if (error) {
                handleDeleteError(error, { context: "image" })

                logtail.error("mutation remove - line 110", {
                    error: error
                })

                logtail.flush()
            }
        },
    })

    const deleteImage = (image: ImageModel) => {
        mutationRemoveImage.mutate(image)
    }

    const defaultThumbnailClass = "inline-flex flex-col overflow-hidden border border-gray-200 rounded-lg mt-2 me-2 relative bg-white shadow-sm"
    const defaultImageClass = "flex items-center justify-center w-48 h-48 overflow-hidden bg-gray-50"

    const thumbnails = files.map((file: ImageModel, index) => {
        {
            return file.img.id.length > 0 ? (<div
                className={thumbnailClassName || defaultThumbnailClass}
                key={index}
            >
                <div className={imageClassName || defaultImageClass}>
                    <Image
                        src={file.img.src}
                        width={192}
                        height={192}
                        alt="product preview image"
                        className="object-contain"
                    />
                </div>
                <button
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-red-600 text-white absolute top-2 end-2 shadow-lg outline-none hover:bg-red-700 transition-colors"
                    onClick={(event) => {
                        event.preventDefault()
                        deleteImage(file)
                    }}
                >
                    {mutationRemoveImage.isPending ? <Icons.spinner className="w-3 h-3 animate-spin" /> : <Icons.close className="w-3 h-3" />}
                </button>
            </div>) : null
        }

    })

    const hasImage = files.length > 0 && files[0]?.img?.id?.length > 0
    const isDisabled = (isSingleField && hasImage) || (effectiveMaxImages !== undefined && files.length >= effectiveMaxImages)

    // Generate empty placeholders only if enabled
    const emptyPlaceholders = showPlaceholders && effectiveMaxImages !== undefined && effectiveMaxImages > 1 ? (
        Array.from({ length: effectiveMaxImages - files.length }, (_, index) => (
            <div
                key={`placeholder-${index}`}
                className={thumbnailClassName || "inline-flex flex-col overflow-hidden border border-gray-200 border-dashed rounded-lg mt-2 me-2 relative bg-gray-50"}
            >
                <div className={imageClassName || "flex items-center justify-center w-48 h-48 overflow-hidden bg-gray-50"}>
                    <Icons.image className="w-12 h-12 text-gray-300" />
                </div>
            </div>
        ))
    ) : null

    return (
        <>

            {!isDisabled && (
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file"
                        className="flex flex-col items-center justify-center w-full h-32 border border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex flex-col items-center justify-center pt-3 pb-3" >

                            {mutationUploadImage.isPending ? (
                                <>
                                    <Icons.spinner className="w-6 h-6 animate-spin text-gray-400" />
                                    <p className="mt-2 text-xs text-gray-500">Uploading...</p>
                                </>
                            ) : (
                                <>
                                    <Icons.image className="w-8 h-8 text-gray-400" />
                                    <p className="mt-2 text-xs text-gray-500">Click or drag to upload</p>
                                </>)}
                            <div {...getRootProps()}>
                                <input id="dropzone-file" type="file" className="hidden" {...getInputProps()} />
                            </div>
                        </div>
                    </label>
                </div>
            )}

            <div className='flex flex-wrap mt-2'>

                {
                    thumbnails.length > 0 && thumbnails
                }

                {
                    emptyPlaceholders
                }

            </div>
        </>
    )
}