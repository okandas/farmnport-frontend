import { useState } from 'react'
import { useDropzone } from 'react-dropzone';
import { Icons } from "@/components/icons/lucide"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
    ImageModel
} from "@/lib/schemas"
import { uploadImages } from "@/lib/query"

interface FileInputProps {
    value: ImageModel[],
    id?: string,
    onChange: (value: any) => void
}

export function FileInput({ id, value, onChange }: FileInputProps) {
    const [files, setFiles] = useState<ImageModel[]>(value)
    const queryClient = useQueryClient()

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

                mutation.mutate(formData)
            }
        },

    })

    const mutation = useMutation({
        mutationFn: uploadImages,
        onSuccess: (data) => {
            console.log(files, data)
            const newImages = [...files, ...data.data]
            onChange(newImages)
        },
        onSettled: () => {
        }
    })

    return (
        <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-64 border border-gray-300 border-dashed rounded-lg cursor-pointer ">
                <div className="flex flex-col items-center justify-center pt-5 pb-6" >

                    {mutation.isPending ? (
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
    )
}