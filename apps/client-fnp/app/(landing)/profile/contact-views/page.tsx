"use client"

import { useQuery } from "@tanstack/react-query"
import { queryViewersList } from "@/lib/query"
import { Mail, Phone } from "lucide-react"
import { capitalizeFirstLetter } from "@/lib/utilities"

type ViewerDetail = {
  user_id: string
  name: string
  client_type: string
  type: string
  date: string
}

export default function ContactViewsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-viewers"],
    queryFn: queryViewersList,
    refetchOnWindowFocus: false,
  })

  const viewers: ViewerDetail[] = data?.data?.viewers || []
  const total: number = data?.data?.total || 0

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-3xl px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight font-heading mb-1">Contact Views</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading..."
              : `${total} ${total === 1 ? "person has" : "people have"} viewed your contact details`}
          </p>
        </div>

        {!isLoading && viewers.length === 0 && (
          <p className="text-sm text-muted-foreground">No contact views yet.</p>
        )}

        {!isLoading && viewers.length > 0 && (
          <div className="rounded-lg border bg-white dark:bg-card divide-y">
            {viewers.map((v, i) => (
              <div
                key={`${v.user_id}-${v.type}-${v.date}-${i}`}
                className="flex items-center justify-between px-4 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      {v.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-snug">{v.name}</p>
                    {v.client_type && (
                      <p className="text-xs text-muted-foreground capitalize">{v.client_type}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    {v.type === "phone" ? (
                      <Phone className="h-3.5 w-3.5" />
                    ) : (
                      <Mail className="h-3.5 w-3.5" />
                    )}
                    <span className="capitalize">{v.type}</span>
                  </span>
                  {v.date && v.date !== "undefined" && (
                    <span>{v.date}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
