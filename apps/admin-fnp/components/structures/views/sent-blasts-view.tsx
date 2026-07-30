"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Icons } from "@/components/icons/lucide"
import { authorizedHTTPClient } from "@/lib/axios"

interface BlastLog {
  id: string
  channel: string
  template: string
  subject: string
  sent: number
  failed: number
  total: number
  sent_by: string
  created: string
}

const CHANNEL_BADGE: Record<string, string> = {
  sms: "bg-blue-50 text-blue-700 border-blue-200",
  whatsapp: "bg-green-50 text-green-700 border-green-200",
  email: "bg-orange-50 text-orange-600 border-orange-200",
}

const TEMPLATE_LABEL: Record<string, string> = {
  custom: "Custom",
  "verify-reminder": "Verify Reminder",
  "verify-reminder-test": "Verify (test)",
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export function SentBlastsView({ source }: { source?: "farmnport" | "menus" } = {}) {
  const isMenus = source === "menus"
  const { data, isLoading } = useQuery({
    queryKey: ["blast-logs", source],
    queryFn: () => authorizedHTTPClient.get<{ data: BlastLog[]; total: number }>(`/v1/blast/logs${isMenus ? "?source=menus" : ""}`),
    select: (res) => (res.data?.data ?? []) as BlastLog[],
  })

  const logs = data ?? []

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-white">
        <div className="flex items-center gap-3">
          <Icons.messageSquare className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Blast History</span>
          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">{logs.length} records</span>
        </div>
        <Link href={isMenus ? "/dashboard/restaurants/blast" : "/dashboard/farmnport/blast"} className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
          ← Back to Blast
        </Link>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <Icons.spinner className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : logs.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No blasts sent yet</p>
      ) : (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-muted/20 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <th className="px-5 py-2.5 text-left w-10">#</th>
              <th className="px-5 py-2.5 text-left">Date</th>
              <th className="px-5 py-2.5 text-left">Type</th>
              <th className="px-5 py-2.5 text-left">Channel</th>
              <th className="px-5 py-2.5 text-left">Subject</th>
              <th className="px-5 py-2.5 text-right">Sent</th>
              <th className="px-5 py-2.5 text-right">Failed</th>
              <th className="px-5 py-2.5 text-left">Sent By</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((log, i) => (
              <tr key={log.id} className="hover:bg-muted/50">
                <td className="px-5 py-2.5 text-muted-foreground">{i + 1}</td>
                <td className="px-5 py-2.5 text-muted-foreground whitespace-nowrap">{formatDate(log.created)}</td>
                <td className="px-5 py-2.5">
                  <span className="text-xs font-medium">{TEMPLATE_LABEL[log.template] ?? log.template}</span>
                </td>
                <td className="px-5 py-2.5">
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize ${CHANNEL_BADGE[log.channel] ?? "bg-muted"}`}>
                    {log.channel}
                  </span>
                </td>
                <td className="px-5 py-2.5 text-muted-foreground max-w-xs truncate">{log.subject || "—"}</td>
                <td className="px-5 py-2.5 text-right">
                  <span className="text-green-600 font-semibold">{log.sent}</span>
                </td>
                <td className="px-5 py-2.5 text-right">
                  {log.failed > 0 ? <span className="text-red-500 font-semibold">{log.failed}</span> : <span className="text-muted-foreground">0</span>}
                </td>
                <td className="px-5 py-2.5 text-muted-foreground">{log.sent_by || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
