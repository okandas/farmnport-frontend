"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { authorizedHTTPClient } from "@/lib/axios"
import { formatDate } from "@/lib/utilities"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { Icons } from "@/components/icons/lucide"

const PAGE_SIZE = 20

export default function ViewedFarmersPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["viewed-farmers", page],
    queryFn: () => authorizedHTTPClient.get(`/v1/views/admin/recent-viewed?page=${page}&limit=${PAGE_SIZE}&type=farmer`),
    select: (res) => res.data,
    refetchOnWindowFocus: false,
  })

  const contacts = data?.contacts ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <DashboardShell>
      <div className="flex items-center gap-3 mb-4">
        <Link href="/dashboard/farmnport/analytics" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Analytics
        </Link>
      </div>
      <DashboardHeader heading="Most Viewed Farmers" text="Farmer profiles being viewed by buyers and other farmers" />

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex justify-center"><Icons.spinner className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : contacts.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">No data yet</p>
        ) : (
          <>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-muted/20 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <th className="px-5 py-2.5 text-left w-10">#</th>
                  <th className="px-5 py-2.5 text-left">Name</th>
                  <th className="px-5 py-2.5 text-left">City</th>
                  <th className="px-5 py-2.5 text-left">Category</th>
                  <th className="px-5 py-2.5 text-left">Produce</th>
                  <th className="px-5 py-2.5 text-left">Last Viewed</th>
                  <th className="px-5 py-2.5 text-right">Views</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {contacts.map((c: any, i: number) => (
                  <tr key={c.viewed_id || i} className="hover:bg-muted/50">
                    <td className="px-5 py-2.5 text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-5 py-2.5">
                      <Link href={`/dashboard/farmnport/contact-views/contact/${c.viewed_id}`} className="font-medium capitalize hover:text-primary transition-colors">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-5 py-2.5 text-muted-foreground capitalize">{c.city || "—"}</td>
                    <td className="px-5 py-2.5 text-muted-foreground capitalize">{c.primary_category || "—"}</td>
                    <td className="px-5 py-2.5 text-muted-foreground capitalize">{c.main_produce || "—"}</td>
                    <td className="px-5 py-2.5 text-muted-foreground">{formatDate(c.last_date) || "—"}</td>
                    <td className="px-5 py-2.5 text-right font-semibold">{c.view_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="text-xs text-primary hover:underline disabled:opacity-40">Previous</button>
                <span className="text-xs text-muted-foreground">Page {page} of {totalPages} ({total} total)</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}
                  className="text-xs text-primary hover:underline disabled:opacity-40">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  )
}
