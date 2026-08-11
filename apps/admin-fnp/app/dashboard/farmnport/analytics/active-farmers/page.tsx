"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { authorizedHTTPClient } from "@/lib/axios"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { Icons } from "@/components/icons/lucide"

const PAGE_SIZE = 20

export default function ActiveFarmersPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["active-farmers", page],
    queryFn: () => authorizedHTTPClient.get(`/v1/views/admin/top-viewers?page=${page}&limit=${PAGE_SIZE}&type=farmer`),
    select: (res) => res.data,
    refetchOnWindowFocus: false,
  })

  const viewers = data?.viewers ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <DashboardShell>
      <div className="flex items-center gap-3 mb-4">
        <Link href="/dashboard/farmnport/analytics" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Analytics
        </Link>
      </div>
      <DashboardHeader heading="Most Active Farmers" text="Farmers actively looking at other profiles" />

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex justify-center"><Icons.spinner className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : viewers.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">No data yet</p>
        ) : (
          <>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-muted/20 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <th className="px-5 py-2.5 text-left w-10">#</th>
                  <th className="px-5 py-2.5 text-left">Name</th>
                  <th className="px-5 py-2.5 text-left">Last Active</th>
                  <th className="px-5 py-2.5 text-right">Contacts Viewed</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {viewers.map((v: any, i: number) => (
                  <tr key={v.user_id || i} className="hover:bg-muted/50">
                    <td className="px-5 py-2.5 text-muted-foreground">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-5 py-2.5">
                      <Link href={`/dashboard/farmnport/contact-views/viewer/${v.user_id}`} className="font-medium capitalize hover:text-primary transition-colors">
                        {v.name}
                      </Link>
                    </td>
                    <td className="px-5 py-2.5 text-muted-foreground">{v.last_date || "—"}</td>
                    <td className="px-5 py-2.5 text-right font-semibold">{v.contacts_viewed}</td>
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
