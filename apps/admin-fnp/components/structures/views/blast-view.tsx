"use client"

import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Icons } from "@/components/icons/lucide"
import { authorizedHTTPClient } from "@/lib/axios"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// ── Types ─────────────────────────────────────────────────────────────────────

interface ClientRow {
  id: string
  name: string
  phone: string
  email: string
  type: string
  city: string
}

interface BlastRecipient {
  id: string
  name: string
  phone: string
  email: string
  message: string
  email_subject: string
  channel: string
}

interface BlastResult {
  name: string
  to: string
  channel: string
  ok: boolean
  error?: string
}

// ── API ───────────────────────────────────────────────────────────────────────

function fetchBlastClients(params: { type?: string; city?: string; search?: string }) {
  const p = new URLSearchParams()
  if (params.type && params.type !== "all") p.set("type", params.type)
  if (params.city) p.set("city", params.city)
  if (params.search) p.set("search", params.search)
  return authorizedHTTPClient.get<{ data: ClientRow[]; total: number }>(
    `/v1/blast/clients?${p.toString()}`
  )
}

function sendBlast(recipients: BlastRecipient[]) {
  return authorizedHTTPClient.post<{ sent: number; failed: number; results: BlastResult[] }>(
    "/v1/blast/send",
    recipients
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BlastView() {
  // Filters
  const [typeFilter, setTypeFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("")
  const [searchFilter, setSearchFilter] = useState("")
  const [loaded, setLoaded] = useState(false)

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Message
  const [channel, setChannel] = useState("sms")
  const [template, setTemplate] = useState("")
  const [emailSubject, setEmailSubject] = useState("")

  // Per-recipient overrides: id → message
  const [overrides, setOverrides] = useState<Record<string, string>>({})

  // Results
  const [results, setResults] = useState<{ sent: number; failed: number; results: BlastResult[] } | null>(null)

  // ── Queries ────────────────────────────────────────────────────────────────

  const clientsQuery = useQuery({
    queryKey: ["blast-clients", typeFilter, cityFilter, searchFilter, loaded],
    queryFn: () => fetchBlastClients({ type: typeFilter, city: cityFilter, search: searchFilter }),
    enabled: loaded,
    refetchOnWindowFocus: false,
  })

  const clients: ClientRow[] = clientsQuery.data?.data?.data ?? []

  // ── Mutation ───────────────────────────────────────────────────────────────

  const blastMutation = useMutation({
    mutationFn: sendBlast,
    onSuccess: (res) => {
      setResults(res.data)
    },
  })

  // ── Helpers ────────────────────────────────────────────────────────────────

  function applyTemplate() {
    const next: Record<string, string> = {}
    clients.filter((c) => selected.has(c.id)).forEach((c) => {
      next[c.id] = template.replace(/\{name\}/gi, c.name)
    })
    setOverrides(next)
  }

  function toggleAll() {
    if (selected.size === clients.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(clients.map((c) => c.id)))
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSend() {
    const recipients: BlastRecipient[] = clients
      .filter((c) => selected.has(c.id))
      .map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        message: overrides[c.id] ?? template.replace(/\{name\}/gi, c.name),
        email_subject: emailSubject || "Message from farmnport",
        channel,
      }))
    setResults(null)
    blastMutation.mutate(recipients)
  }

  const selectedClients = clients.filter((c) => selected.has(c.id))
  const canSend = selected.size > 0 && !blastMutation.isPending

  // ── Render ─────────────────────────────────────────────────────────────────

  if (results) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Blast Results</h3>
            <button
              onClick={() => { setResults(null); setSelected(new Set()); setOverrides({}) }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              New blast
            </button>
          </div>
          <div className="flex gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Icons.checkCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">{results.sent} sent</span>
            </div>
            {results.failed > 0 && (
              <div className="flex items-center gap-2">
                <Icons.alertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium">{results.failed} failed</span>
              </div>
            )}
          </div>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">To</th>
                <th className="py-2 pr-4">Channel</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.results.map((r, i) => (
                <tr key={i} className="hover:bg-muted/50">
                  <td className="py-2 pr-4 font-medium">{r.name}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{r.to}</td>
                  <td className="py-2 pr-4 capitalize">{r.channel}</td>
                  <td className="py-2">
                    {r.ok ? (
                      <span className="text-green-600 font-medium">Sent</span>
                    ) : (
                      <span className="text-red-500">{r.error ?? "Failed"}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Left: Audience */}
      <div className="space-y-4">
        <div className="rounded-lg border bg-white p-4">
          <h3 className="text-sm font-semibold mb-3">Audience</h3>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="farmer">Farmers</SelectItem>
                  <SelectItem value="buyer">Buyers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">City</label>
              <input
                type="text"
                placeholder="e.g. Harare"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full h-8 px-3 text-sm rounded-md border border-input bg-background"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs text-muted-foreground mb-1">Search name</label>
            <input
              type="text"
              placeholder="Search..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full h-8 px-3 text-sm rounded-md border border-input bg-background"
            />
          </div>

          <button
            onClick={() => { setLoaded(true); clientsQuery.refetch() }}
            className="w-full h-8 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90"
          >
            {clientsQuery.isLoading ? (
              <Icons.spinner className="w-4 h-4 mx-auto animate-spin" />
            ) : "Load Recipients"}
          </button>
        </div>

        {/* Recipient list */}
        {loaded && (
          <div className="rounded-lg border bg-white overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground">
                {clients.length} loaded · {selected.size} selected
              </span>
              <button onClick={toggleAll} className="text-xs text-primary hover:underline">
                {selected.size === clients.length && clients.length > 0 ? "Clear all" : "Select all"}
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {clientsQuery.isLoading ? (
                <div className="py-8 flex justify-center"><Icons.spinner className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : clients.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No recipients found</p>
              ) : (
                clients.map((c) => (
                  <label key={c.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggleOne(c.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.type} · {c.city}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right: Message */}
      <div className="space-y-4">
        <div className="rounded-lg border bg-white p-4 space-y-3">
          <h3 className="text-sm font-semibold">Message</h3>

          <div>
            <label className="block text-xs text-muted-foreground mb-1">Channel</label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {channel === "email" && (
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Subject</label>
              <input
                type="text"
                placeholder="e.g. New prices this week"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full h-8 px-3 text-sm rounded-md border border-input bg-background"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Template — use <code className="bg-muted px-1 rounded text-xs">{"{name}"}</code> for personalization
            </label>
            <textarea
              rows={5}
              placeholder={"Hi {name}, we have new prices this week..."}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background resize-none"
            />
          </div>

          <button
            onClick={applyTemplate}
            disabled={selected.size === 0 || !template}
            className="w-full h-8 rounded-md border border-primary text-primary text-sm font-medium hover:bg-primary/5 disabled:opacity-40"
          >
            Apply template to {selected.size} selected
          </button>
        </div>

        {/* Preview per-recipient */}
        {selectedClients.length > 0 && (
          <div className="rounded-lg border bg-white overflow-hidden">
            <div className="px-4 py-2 border-b bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground">Preview & edit individual messages</span>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y">
              {selectedClients.map((c) => (
                <div key={c.id} className="px-4 py-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">{c.name} · {channel === "email" ? c.email || "no email" : c.phone || "no phone"}</p>
                  <textarea
                    rows={2}
                    value={overrides[c.id] ?? template.replace(/\{name\}/gi, c.name)}
                    onChange={(e) => setOverrides((prev) => ({ ...prev, [c.id]: e.target.value }))}
                    className="w-full px-2 py-1.5 text-sm rounded border border-input bg-background resize-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="w-full h-10 rounded-md bg-primary text-white font-semibold text-sm hover:bg-primary/90 disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {blastMutation.isPending ? (
            <Icons.spinner className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Icons.send className="w-4 h-4" />
              Send blast to {selected.size} recipient{selected.size !== 1 ? "s" : ""}
            </>
          )}
        </button>

        {blastMutation.isError && (
          <p className="text-sm text-red-500 text-center">Failed to send blast. Please try again.</p>
        )}
      </div>
    </div>
  )
}
