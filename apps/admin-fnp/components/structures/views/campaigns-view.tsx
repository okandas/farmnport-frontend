"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Icons } from "@/components/icons/lucide"
import { authorizedHTTPClient } from "@/lib/axios"

interface CampaignStats {
  total: number
  queued: number
  sent: number
  delivered: number
  bounced: number
  suppressed: number
  failed: number
  opened: number
  converted: number
}

interface Campaign {
  id: string
  name: string
  channel: string
  template: string
  subject: string
  message: string
  audience: {
    source: string
    type: string
    province: string
    category: string
    produce: string
    verified: string
    uploaded: boolean
  }
  stats: CampaignStats
  status: string
  sent_by: string
  created: string
  sent_at: string | null
}

interface CampaignRecipient {
  id: string
  campaign_id: string
  client_id: string
  name: string
  to: string
  status: string
  error: string
  queued_at: string
  sent_at: string | null
  delivered_at: string | null
  updated_at: string
}

const CHANNEL_BADGE: Record<string, string> = {
  sms: "bg-blue-50 text-blue-700 border-blue-200",
  whatsapp: "bg-green-50 text-green-700 border-green-200",
  email: "bg-orange-50 text-orange-600 border-orange-200",
}

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sending: "bg-amber-50 text-amber-700 border-amber-200",
  sent: "bg-green-50 text-green-700 border-green-200",
  failed: "bg-red-50 text-red-600 border-red-200",
}

const RECIPIENT_STATUS: Record<string, { color: string; label: string }> = {
  queued: { color: "text-muted-foreground", label: "Queued" },
  sent: { color: "text-amber-600", label: "Sent" },
  delivered: { color: "text-green-600", label: "Delivered" },
  bounced: { color: "text-red-500", label: "Bounced" },
  suppressed: { color: "text-red-400", label: "Suppressed" },
  failed: { color: "text-red-500", label: "Failed" },
  opened: { color: "text-blue-600", label: "Opened" },
  converted: { color: "text-emerald-600", label: "Converted" },
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function StatBar({ stats }: { stats: CampaignStats }) {
  const total = stats.total || 1
  const segments = [
    { key: "delivered", count: stats.delivered, color: "bg-green-500" },
    { key: "converted", count: stats.converted, color: "bg-emerald-500" },
    { key: "sent", count: stats.sent - stats.delivered - stats.converted, color: "bg-amber-400" },
    { key: "bounced", count: stats.bounced, color: "bg-red-400" },
    { key: "suppressed", count: stats.suppressed, color: "bg-red-300" },
    { key: "failed", count: stats.failed, color: "bg-red-200" },
  ].filter(s => s.count > 0)

  return (
    <div className="space-y-1.5">
      <div className="h-2 rounded-full bg-muted overflow-hidden flex">
        {segments.map(s => (
          <div key={s.key} className={`${s.color} h-full`} style={{ width: `${(s.count / total) * 100}%` }} />
        ))}
      </div>
      <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
        {stats.delivered > 0 && <span className="text-green-600 font-medium">{stats.delivered} delivered</span>}
        {stats.converted > 0 && <span className="text-emerald-600 font-medium">{stats.converted} converted</span>}
        {stats.bounced > 0 && <span className="text-red-500">{stats.bounced} bounced</span>}
        {stats.suppressed > 0 && <span className="text-red-400">{stats.suppressed} suppressed</span>}
        {stats.failed > 0 && <span className="text-red-500">{stats.failed} failed</span>}
        <span>{stats.total} total</span>
      </div>
    </div>
  )
}

function CampaignDetail({ campaignId, onBack }: { campaignId: string; onBack: () => void }) {
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)

  const { data: campaign } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: () => authorizedHTTPClient.get<Campaign>(`/v1/campaigns/${campaignId}`),
    select: (res) => res.data,
  })

  const { data: recipientData, isLoading: recipientsLoading } = useQuery({
    queryKey: ["campaign-recipients", campaignId, statusFilter, page],
    queryFn: () => authorizedHTTPClient.get<{ data: CampaignRecipient[]; total: number; page: number; limit: number }>(
      `/v1/campaigns/${campaignId}/recipients?page=${page}&limit=50${statusFilter ? `&status=${statusFilter}` : ""}`
    ),
    select: (res) => res.data,
  })

  const recipients = recipientData?.data ?? []
  const total = recipientData?.total ?? 0

  if (!campaign) return <div className="py-16 flex justify-center"><Icons.spinner className="w-5 h-5 animate-spin text-muted-foreground" /></div>

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
              <Icons.chevronLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span className="text-sm font-semibold">{campaign.name}</span>
            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize ${CHANNEL_BADGE[campaign.channel] ?? "bg-muted"}`}>
              {campaign.channel}
            </span>
            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize ${STATUS_BADGE[campaign.status] ?? "bg-muted"}`}>
              {campaign.status}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{campaign.sent_at ? formatDate(campaign.sent_at) : formatDate(campaign.created)}</span>
        </div>

        <div className="px-5 py-4">
          <StatBar stats={campaign.stats} />
        </div>

        {campaign.message && (
          <div className="px-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">Message</p>
            <p className="text-sm bg-muted/30 rounded-lg p-3">{campaign.message}</p>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">Recipients</span>
            <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">{total}</span>
          </div>
          <div className="flex gap-1">
            {["", "delivered", "bounced", "failed", "converted", "sent"].map(s => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
                className={`text-xs px-2 py-1 rounded ${statusFilter === s ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}>
                {s || "All"}
              </button>
            ))}
          </div>
        </div>

        {recipientsLoading ? (
          <div className="py-10 flex justify-center"><Icons.spinner className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : recipients.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No recipients</p>
        ) : (
          <>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-muted/20 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <th className="px-5 py-2.5 text-left w-10">#</th>
                  <th className="px-5 py-2.5 text-left">Name</th>
                  <th className="px-5 py-2.5 text-left">To</th>
                  <th className="px-5 py-2.5 text-left">Status</th>
                  <th className="px-5 py-2.5 text-left">Error</th>
                  <th className="px-5 py-2.5 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recipients.map((r, i) => {
                  const st = RECIPIENT_STATUS[r.status] ?? { color: "text-muted-foreground", label: r.status }
                  return (
                    <tr key={r.id} className="hover:bg-muted/50">
                      <td className="px-5 py-2.5 text-muted-foreground">{(page - 1) * 50 + i + 1}</td>
                      <td className="px-5 py-2.5 font-medium capitalize">{r.name}</td>
                      <td className="px-5 py-2.5 text-muted-foreground">{r.to}</td>
                      <td className="px-5 py-2.5"><span className={`font-medium ${st.color}`}>{st.label}</span></td>
                      <td className="px-5 py-2.5 text-muted-foreground text-xs">{r.error || "—"}</td>
                      <td className="px-5 py-2.5 text-muted-foreground text-xs">{r.sent_at ? formatDate(r.sent_at) : "—"}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {total > 50 && (
              <div className="flex items-center justify-between px-5 py-3 border-t">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="text-xs text-primary hover:underline disabled:opacity-40">Previous</button>
                <span className="text-xs text-muted-foreground">Page {page} of {Math.ceil(total / 50)}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page * 50 >= total}
                  className="text-xs text-primary hover:underline disabled:opacity-40">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export function CampaignsView() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => authorizedHTTPClient.get<{ data: Campaign[]; total: number }>("/v1/campaigns"),
    select: (res) => (res.data?.data ?? []) as Campaign[],
  })

  const campaigns = data ?? []

  if (selectedId) {
    return <CampaignDetail campaignId={selectedId} onBack={() => setSelectedId(null)} />
  }

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-white">
        <div className="flex items-center gap-3">
          <Icons.barChart className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold">All Campaigns</span>
          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">{campaigns.length}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center"><Icons.spinner className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : campaigns.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No campaigns yet</p>
      ) : (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-muted/20 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <th className="px-5 py-2.5 text-left w-10">#</th>
              <th className="px-5 py-2.5 text-left">Campaign</th>
              <th className="px-5 py-2.5 text-left">Channel</th>
              <th className="px-5 py-2.5 text-left">Status</th>
              <th className="px-5 py-2.5 text-right">Sent</th>
              <th className="px-5 py-2.5 text-right">Delivered</th>
              <th className="px-5 py-2.5 text-right">Bounced</th>
              <th className="px-5 py-2.5 text-right">Converted</th>
              <th className="px-5 py-2.5 text-left">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {campaigns.map((c, i) => (
              <tr key={c.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedId(c.id)}>
                <td className="px-5 py-2.5 text-muted-foreground">{i + 1}</td>
                <td className="px-5 py-2.5">
                  <p className="font-medium">{c.name}</p>
                  {c.subject && <p className="text-xs text-muted-foreground truncate max-w-xs">{c.subject}</p>}
                </td>
                <td className="px-5 py-2.5">
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize ${CHANNEL_BADGE[c.channel] ?? "bg-muted"}`}>
                    {c.channel}
                  </span>
                </td>
                <td className="px-5 py-2.5">
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize ${STATUS_BADGE[c.status] ?? "bg-muted"}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-2.5 text-right">
                  <span className="text-amber-600 font-semibold">{c.stats.sent}</span>
                </td>
                <td className="px-5 py-2.5 text-right">
                  <span className="text-green-600 font-semibold">{c.stats.delivered}</span>
                </td>
                <td className="px-5 py-2.5 text-right">
                  {c.stats.bounced > 0 ? <span className="text-red-500 font-semibold">{c.stats.bounced}</span> : <span className="text-muted-foreground">0</span>}
                </td>
                <td className="px-5 py-2.5 text-right">
                  {c.stats.converted > 0 ? <span className="text-emerald-600 font-semibold">{c.stats.converted}</span> : <span className="text-muted-foreground">0</span>}
                </td>
                <td className="px-5 py-2.5 text-muted-foreground whitespace-nowrap">{formatDate(c.sent_at || c.created)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
