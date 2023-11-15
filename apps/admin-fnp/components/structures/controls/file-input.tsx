import { useState } from 'react'
import { useDropzone } from 'react-dropzone';
import { Icons } from "@/components/icons/lucide"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
    ImageModel
} from "@/lib/schemas"
import { uploadImages, removeImage } from "@/lib/query"
import Image from 'next/image'
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

interface FileInputProps {
    value: ImageModel[],
    id?: string,
    onChange: (value: any) => void
}

export function FileInput({ id, value, onChange }: FileInputProps) {
    const [files, setFiles] = useState<ImageModel[]>(value)
    const queryClient = useQueryClient()

    const mutationUploadImage = useMutation({
        mutationFn: uploadImages,
        onSuccess: (data) => {

            if (data.data === null) {

                toast({
                    description: "There seems to be an issue with your upload, please wait and try again or contact admin if it persists.",
                    action: <ToastAction altText="Try again">Try again</ToastAction>,
                })

            } else {

                const newImages = [...files, ...data.data]
                onChange(newImages)
                setFiles(newImages)

            }

        },
        onSettled: () => {
        },
        onError(error, variables, context) {

        },
    })

    const { getRootProps, getInputProps } = useDropzone({
        multiple: true,
        onDrop: (acceptedFiles) => {

            const formData = new FormData()

            if (id !== undefined) {
                formData.append("entity_id", id)
            }

            if (acceptedFiles.length) {

                acceptedFiles.forEach((attachment) => {
                    formData.append('product_image', attachment)
                })

                mutationUploadImage.mutate(formData)
            }
        },
        onError(err) {

            toast({
                description: "There seems to be an issue with your uploads, please wait and try again or contact admin.",
                action: <ToastAction altText="Try again">Try again</ToastAction>,
            })

            // TODO: add logstash
            console.log(err)

            mutationUploadImage.reset()

        },

    })

    const mutationRemoveImage = useMutation({
        mutationFn: removeImage
    })


    const deleteImage = (image: ImageModel) => {

        mutationRemoveImage.mutate(image)

        if (mutationRemoveImage.isSuccess) {
            const retainedImages = files.filter((file: ImageModel) => file.img.id !== image.img.id)
            setFiles(retainedImages)
            onChange(retainedImages)
        }

    }


    const thumbnails = files.map((file: ImageModel, index) => {
        {
            return file.img.id.length > 0 ? (<div
                className="inline-flex flex-col overflow-hidden border border-border-200 rounded mt-2 me-2 relative"
                key={index}
            >
                <div className="flex items-center justify-center min-w-0 w-16 h-16 overflow-hidden">
                    <Image
                        src={file.img.src}
                        width={64}
                        height={64}
                        alt="product preview image"
                    />
                </div>
                <button
                    className="w-4 h-4 flex items-center justify-center rounded-full bg-red-600 text-xs text-light text-white absolute top-1 end-1 shadow-xl outline-none"
                    onClick={() => deleteImage(file)}
                >
                    {mutationRemoveImage.isPending ? <Icons.spinner width={10} height={10} /> : <Icons.close width={10} height={10} />}
                </button>
            </div>) : null
        }

    })

    return (
        <>

            <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-64 border border-gray-300 border-dashed rounded-lg cursor-pointer ">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6" >

                        {mutationUploadImage.isPending ? (
                            <>
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">Uploading Image ...</h3>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-center w-30 h-30">
                                    <Icons.image />
                                </div>

                                <h3 className="mt-2 text-sm font-semibold text-gray-900">Upload</h3>
                                <p className="mt-1 text-sm text-gray-500">Upload product images here</p>
                                <div className="mt-6 inline-flex items-center rounded-md  px-3 py-2 text-sm font-semibold  shadow-sm hover:bg-gray-100">
                                    <Icons.add className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                                    New Image

                                </div>
                            </>)}
                        <div {...getRootProps()}>
                            <input id="dropzone-file" type="file" className="hidden" {...getInputProps()} />
                        </div>
                    </div>
                </label>
            </div>

            <div className='flex flex-wrap mt-2'>

                {
                    thumbnails.length > 0 && thumbnails
                }

            </div>
        </>
    )
}