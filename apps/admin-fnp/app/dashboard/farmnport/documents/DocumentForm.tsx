"use client"

import Link from "next/link"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import { adminUploadPDF, adminCreateDocument, adminUpdateDocument, queryBrands } from "@/lib/query"
import { ImageModel } from "@/lib/schemas"
import { buttonVariants } from "@/components/ui/button"
import { SearchSelect } from "@/components/ui/search-select"
import { FileInput } from "@/components/structures/controls/file-input"
import { toast } from "@/components/ui/use-toast"
import { handleApiError, handleFormErrors } from "@/lib/error-handler"
import { cn } from "@/lib/utilities"
import { Icons } from "@/components/icons/lucide"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const inputClass = "block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500"

const CATEGORIES = [
    { value: "plans", label: "Plans" },
    { value: "spray-program", label: "Spray Program" },
    { value: "guide", label: "Guide" },
    { value: "datasheet", label: "Datasheet" },
    { value: "catalogue", label: "Catalogue" },
]

interface DocumentFormValues {
    title: string
    slug: string
    description: string
    category: string
    tags: string
    file_key: string
    file_type: string
    file_size_bytes: number
    price_cents: number
    is_test: string
    active: string
    main_image: ImageModel[]
    other_images: ImageModel[]
    brand_id: string
}

interface DocumentFormProps {
    mode: "new" | "edit"
    documentId?: string
    defaultValues?: Partial<DocumentFormValues>
}

function slugify(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export default function DocumentForm({ mode, documentId, defaultValues }: DocumentFormProps) {
    const router = useRouter()
    const [uploadingPDF, setUploadingPDF] = useState(false)
    const [uploadedFilename, setUploadedFilename] = useState("")

    const form = useForm<DocumentFormValues>({
        defaultValues: {
            title: "",
            slug: "",
            description: "",
            category: "",
            tags: "",
            file_key: "",
            file_type: "pdf",
            file_size_bytes: 0,
            price_cents: 0,
            is_test: "false",
            active: "true",
            main_image: [],
            other_images: [],
            brand_id: "",
            ...defaultValues,
        },
    })


    async function handlePDFUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setUploadingPDF(true)
        try {
            const res = await adminUploadPDF(file)
            const { file_key, file_size_bytes, original_name } = res.data
            form.setValue("file_key", file_key)
            form.setValue("file_size_bytes", file_size_bytes)
            form.setValue("file_type", "pdf")
            setUploadedFilename(original_name)
            toast({ description: "PDF uploaded successfully" })
        } catch (err) {
            handleApiError(err, { context: "PDF upload" })
        } finally {
            setUploadingPDF(false)
        }
    }

    const { mutate, isPending } = useMutation({
        mutationFn: (data: DocumentFormValues) => {
            const payload = {
                title: data.title,
                slug: data.slug,
                brand_id: data.brand_id || undefined,
                description: data.description || undefined,
                category: data.category || undefined,
                tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
                file_key: data.file_key,
                file_type: data.file_type || undefined,
                file_size_bytes: Number(data.file_size_bytes) || undefined,
                price_cents: Math.round(Number(data.price_cents) * 100),
                is_test: data.is_test === "true",
                active: data.active === "true",
                main_image: data.main_image?.[0]?.img.src ?? undefined,
                other_images: (data.other_images ?? []).map((img) => img.img.src),
            }
            if (mode === "edit" && documentId) {
                return adminUpdateDocument(documentId, payload)
            }
            return adminCreateDocument(payload)
        },
        onSuccess: () => {
            toast({ description: mode === "edit" ? "Document updated" : "Document created" })
            router.push("/dashboard/farmnport/documents")
        },
        onError: (error) => handleApiError(error, { context: mode === "edit" ? "update document" : "create document" }),
    })

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {mode === "edit" ? "Edit Document" : "New Document"}
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {mode === "edit" ? "Update document details and file." : "Upload a PDF and create a document listing."}
                    </p>
                </div>
                <Link href="/dashboard/farmnport/documents" className={cn(buttonVariants({ variant: "ghost" }))}>
                    <Icons.close className="w-4 h-4 mr-2" />Close
                </Link>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => mutate(data), (errors) => handleFormErrors(errors))}>
                    <div className="space-y-12">

                        {/* File Upload */}
                        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                            <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
                                <div>
                                    <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">PDF File</h2>
                                    <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Upload the PDF buyers will receive after purchase. Max 50 MB.</p>
                                </div>
                                <div className="md:col-span-2 space-y-4">
                                    <div>
                                        <label className="block text-sm/6 font-medium text-gray-900 dark:text-white mb-2">Upload PDF</label>
                                        <input
                                            type="file"
                                            accept="application/pdf,.pdf"
                                            onChange={handlePDFUpload}
                                            disabled={uploadingPDF}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 disabled:opacity-50"
                                        />
                                        {uploadingPDF && (
                                            <p className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                                                <Icons.spinner className="w-4 h-4 animate-spin" /> Uploading…
                                            </p>
                                        )}
                                        {uploadedFilename && !uploadingPDF && (
                                            <p className="mt-2 text-sm text-green-600">✓ {uploadedFilename}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm/6 font-medium text-gray-900 dark:text-white mb-2">File Key <span className="text-gray-400 font-normal">(auto-filled on upload)</span></label>
                                        <FormField control={form.control} name="file_key" render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="e.g. abc123.pdf" className={inputClass} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                            <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
                                <div>
                                    <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Images</h2>
                                    <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Main cover image and up to 5 preview images.</p>
                                </div>
                                <div className="md:col-span-2 space-y-6">
                                    <div>
                                        <label className="block text-sm/6 font-medium text-gray-900 dark:text-white mb-2">Main image</label>
                                        <FormField control={form.control} name="main_image" render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <FileInput
                                                        id={documentId}
                                                        fieldName="main_image"
                                                        value={field.value || []}
                                                        onChange={field.onChange}
                                                        maxImages={1}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    <div>
                                        <label className="block text-sm/6 font-medium text-gray-900 dark:text-white mb-2">Preview images <span className="text-gray-400 font-normal">(up to 5)</span></label>
                                        <FormField control={form.control} name="other_images" render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <FileInput
                                                        id=""
                                                        fieldName="other_images"
                                                        value={field.value || []}
                                                        onChange={field.onChange}
                                                        maxImages={5}
                                                        showPlaceholders
                                                        thumbnailClassName="inline-flex flex-col overflow-hidden border border-gray-200 rounded-lg mt-2 me-2 relative bg-white shadow-sm"
                                                        imageClassName="flex items-center justify-center w-32 h-32 overflow-hidden bg-gray-50"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                            <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
                                <div>
                                    <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Document Details</h2>
                                    <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Title, category, description and pricing.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">

                                        <div className="sm:col-span-4">
                                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Title</label>
                                            <div className="mt-2">
                                                <FormField control={form.control} name="title" render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="e.g. Tomato Spray Program 2026"
                                                                className={inputClass}
                                                                {...field}
                                                                onChange={(e) => {
                                                                    field.onChange(e)
                                                                    if (mode === "new") {
                                                                        form.setValue("slug", slugify(e.target.value))
                                                                    }
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-4">
                                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Brand <span className="text-gray-400 font-normal">(optional)</span></label>
                                            <div className="mt-2">
                                                <FormField control={form.control} name="brand_id" render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <SearchSelect
                                                                queryKey="document-brands"
                                                                queryFn={(params) => queryBrands(params)}
                                                                getItems={(page) => page?.data?.brands ?? []}
                                                                value={field.value}
                                                                onValueChange={field.onChange}
                                                                getLabel={(b) => b.name}
                                                                getValue={(b) => b.id}
                                                                placeholder="Select brand"
                                                                clearable
                                                                capitalize
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-4">
                                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Slug</label>
                                            <div className="mt-2">
                                                <FormField control={form.control} name="slug" render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="e.g. tomato-spray-program-2026" className={inputClass} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Category</label>
                                            <div className="mt-2">
                                                <FormField control={form.control} name="category" render={({ field }) => (
                                                    <FormItem>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Price ($)</label>
                                            <div className="mt-2">
                                                <FormField control={form.control} name="price_cents" render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input type="number" step="0.01" min="0" placeholder="0.00" className={inputClass} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-6">
                                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                                            <div className="mt-2">
                                                <FormField control={form.control} name="description" render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Textarea rows={4} placeholder="What's included, who it's for, key contents…" className={inputClass} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-6">
                                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Tags <span className="text-gray-400 font-normal">(comma-separated, optional)</span></label>
                                            <div className="mt-2">
                                                <FormField control={form.control} name="tags" render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="e.g. tomato, spray, agrochemical" className={inputClass} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Status</label>
                                            <div className="mt-2">
                                                <FormField control={form.control} name="active" render={({ field }) => (
                                                    <FormItem>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="true">Active</SelectItem>
                                                                <SelectItem value="false">Inactive</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Test item</label>
                                            <div className="mt-2">
                                                <FormField control={form.control} name="is_test" render={({ field }) => (
                                                    <FormItem>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Test item?" /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="false">No</SelectItem>
                                                                <SelectItem value="true">Yes — test only</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/farmnport/documents")}
                            className="text-sm/6 font-semibold text-gray-900 dark:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}
                            {mode === "edit" ? "Save Changes" : "Create Document"}
                        </button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
