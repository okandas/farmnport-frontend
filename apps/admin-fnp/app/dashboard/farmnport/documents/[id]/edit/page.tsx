"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { adminGetDocument } from "@/lib/query"
import DocumentForm from "../../DocumentForm"

export default function EditDocumentPage() {
    const { id } = useParams<{ id: string }>()

    const { data, isLoading } = useQuery({
        queryKey: ["admin-document", id],
        queryFn: () => adminGetDocument(id).then(r => r.data),
        enabled: !!id,
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    const doc = data?.document
    if (!doc) return null

    return (
        <DocumentForm
            mode="edit"
            documentId={id}
            defaultValues={{
                title: doc.title,
                slug: doc.slug,
                description: doc.description ?? "",
                category: doc.category ?? "",
                tags: (doc.tags ?? []).join(", "),
                file_key: doc.file_key ?? "",
                file_type: doc.file_type ?? "pdf",
                file_size_bytes: doc.file_size_bytes ?? 0,
                price_cents: doc.price_cents ? doc.price_cents / 100 : 0,
                active: doc.active ? "true" : "false",
            }}
        />
    )
}
