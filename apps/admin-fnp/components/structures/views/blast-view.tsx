"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Icons } from "@/components/icons/lucide"
import { authorizedHTTPClient } from "@/lib/axios"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchSelect } from "@/components/ui/search-select"
import { queryFarmProduce, queryFarmProduceCategories, queryFarmProduceByCategory } from "@/lib/query"

// ── Types ─────────────────────────────────────────────────────────────────────

interface ClientRow {
  id: string
  name: string
  phone: string
  email: string
  type: string
  category: string
  produce: string
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

// ── Constants ─────────────────────────────────────────────────────────────────

const ZIMBABWE_PROVINCES = [
  "Harare", "Bulawayo", "Manicaland", "Mashonaland Central",
  "Mashonaland East", "Mashonaland West", "Masvingo",
  "Matabeleland North", "Matabeleland South", "Midlands",
]

const CHANNEL_CONFIG = {
  sms:      { label: "SMS",       color: "bg-blue-600 text-white",    idle: "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200" },
  whatsapp: { label: "WhatsApp",  color: "bg-green-600 text-white",   idle: "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200" },
  email:    { label: "Email",     color: "bg-orange-500 text-white",  idle: "bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200" },
} as const

// ── Component ─────────────────────────────────────────────────────────────────

export function BlastView() {
  // Filters
  const [typeFilter, setTypeFilter] = useState("all")
  const [provinceFilter, setProvinceFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [produceFilter, setProduceFilter] = useState("all")
  const [searchFilter, setSearchFilter] = useState("")

  // Debounced filters for auto-query
  const [debouncedFilters, setDebouncedFilters] = useState({ typeFilter, provinceFilter, categoryFilter, produceFilter, searchFilter })

  useEffect(() => {
    const t = setTimeout(() => setDebouncedFilters({ typeFilter, provinceFilter, categoryFilter, produceFilter, searchFilter }), 400)
    return () => clearTimeout(t)
  }, [typeFilter, provinceFilter, categoryFilter, produceFilter, searchFilter])

  // Clients
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [recipientSearch, setRecipientSearch] = useState("")

  // Message
  const [channel, setChannel] = useState<"sms" | "whatsapp" | "email">("sms")
  const [template, setTemplate] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = useState(false)

  // Results
  const [results, setResults] = useState<{ sent: number; failed: number; results: BlastResult[] } | null>(null)

  // ── Clients query — auto-runs on debounced filter change ───────────────────

  const clientsQuery = useQuery({
    queryKey: ["blast-clients", debouncedFilters],
    queryFn: () => {
      const p = new URLSearchParams()
      if (debouncedFilters.typeFilter !== "all") p.set("type", debouncedFilters.typeFilter)
      if (debouncedFilters.provinceFilter !== "all") p.set("province", debouncedFilters.provinceFilter)
      if (debouncedFilters.produceFilter !== "all") p.set("produce", debouncedFilters.produceFilter)
      else if (debouncedFilters.categoryFilter !== "all") p.set("category", debouncedFilters.categoryFilter)
      if (debouncedFilters.searchFilter) p.set("search", debouncedFilters.searchFilter)
      return authorizedHTTPClient.get<{ data: ClientRow[]; total: number }>(`/v1/blast/clients?${p.toString()}`)
    },
    select: (res) => (res.data?.data ?? []) as ClientRow[],
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  })

  const clients: ClientRow[] = clientsQuery.data ?? []
  const visibleClients = recipientSearch.trim()
    ? clients.filter((c) => c.name.toLowerCase().includes(recipientSearch.toLowerCase()) || c.produce.toLowerCase().includes(recipientSearch.toLowerCase()))
    : clients
  const selectedClients = clients.filter((c) => selected.has(c.id))

  // Reset selection when results change
  useEffect(() => { setSelected(new Set()) }, [debouncedFilters])

  // ── Blast mutation ─────────────────────────────────────────────────────────

  const blastMutation = useMutation({
    mutationFn: (recipients: BlastRecipient[]) =>
      authorizedHTTPClient.post<{ sent: number; failed: number; results: BlastResult[] }>("/v1/blast/send", recipients),
    onSuccess: (res) => setResults(res.data),
  })

  // ── Helpers ────────────────────────────────────────────────────────────────

  function toggleAll() {
    if (selected.size === clients.length) setSelected(new Set())
    else setSelected(new Set(clients.map((c) => c.id)))
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function applyTemplate() {
    const next: Record<string, string> = {}
    selectedClients.forEach((c) => { next[c.id] = template.replace(/\{name\}/gi, c.name) })
    setOverrides(next)
  }

  function handleSend() {
    const recipients: BlastRecipient[] = selectedClients.map((c) => ({
      id: c.id, name: c.name, phone: c.phone, email: c.email,
      message: overrides[c.id] ?? template.replace(/\{name\}/gi, c.name),
      email_subject: emailSubject || "Message from farmnport",
      channel,
    }))
    blastMutation.mutate(recipients)
  }

  function handleReset() {
    setTypeFilter("all"); setProvinceFilter("all"); setCategoryFilter("all")
    setProduceFilter("all"); setSearchFilter(""); setSelected(new Set())
    setChannel("sms"); setTemplate(""); setEmailSubject(""); setOverrides({}); setResults(null)
  }

  const canSend = selected.size > 0 && template.trim().length > 0

  // ── Results view ───────────────────────────────────────────────────────────

  if (results) {
    return (
      <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-3.5 border-b bg-white">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">Blast sent</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">{results.sent} sent</span>
            {results.failed > 0 && <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold">{results.failed} failed</span>}
          </div>
          <button onClick={handleReset} className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
            <Icons.add className="w-3.5 h-3.5" /> New blast
          </button>
        </div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-muted/20 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <th className="px-5 py-2.5 text-left w-10">#</th>
              <th className="px-5 py-2.5 text-left">Name</th>
              <th className="px-5 py-2.5 text-left">To</th>
              <th className="px-5 py-2.5 text-left">Channel</th>
              <th className="px-5 py-2.5 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {results.results.map((r, i) => (
              <tr key={i} className="hover:bg-muted/50">
                <td className="px-5 py-2.5 text-muted-foreground">{i + 1}</td>
                <td className="px-5 py-2.5 font-medium">{r.name}</td>
                <td className="px-5 py-2.5 text-muted-foreground">{r.to}</td>
                <td className="px-5 py-2.5 capitalize">{r.channel}</td>
                <td className="px-5 py-2.5">
                  {r.ok
                    ? <span className="text-green-600 font-medium">Sent</span>
                    : <span className="text-red-500">{r.error ?? "Failed"}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // ── Compose view ───────────────────────────────────────────────────────────

  const previewClient = selectedClients[0] ?? null
  const previewMessage = previewClient
    ? (overrides[previewClient.id] ?? template.replace(/\{name\}/gi, previewClient.name))
    : template

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden flex flex-col">

        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b bg-white shrink-0">
          <div className="flex items-center gap-3">
            <Icons.messageSquare className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">New Blast</span>
            {clientsQuery.isFetching
              ? <span className="text-xs text-muted-foreground flex items-center gap-1"><Icons.spinner className="w-3 h-3 animate-spin" /> loading…</span>
              : clients.length > 0
                ? <div className="flex items-center gap-1.5">
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">{clients.length} matched</span>
                    {selected.size > 0 && <span className="text-xs px-2 py-0.5 rounded bg-primary text-white font-semibold">{selected.size} will receive</span>}
                  </div>
                : null}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowPreview((v) => !v)} disabled={!template.trim()}
              className="h-8 px-3 rounded-md border text-xs font-medium text-muted-foreground hover:bg-muted/50 disabled:opacity-40 flex items-center gap-1.5">
              <Icons.eye className="w-3.5 h-3.5" />
              {showPreview ? "Hide preview" : "Preview"}
            </button>
            <button onClick={handleSend} disabled={!canSend || blastMutation.isPending}
              className="h-8 px-4 rounded-md bg-primary text-white text-xs font-bold hover:bg-primary/90 disabled:opacity-40 flex items-center gap-1.5 shadow-sm">
              {blastMutation.isPending
                ? <><Icons.spinner className="w-3.5 h-3.5 animate-spin" /> Sending…</>
                : <><Icons.send className="w-3.5 h-3.5" /> Send to {selected.size || "…"}</>}
            </button>
          </div>
        </div>

        {/* ── Filters row (full width) ── */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-muted/10 shrink-0 flex-wrap">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 text-xs w-28 bg-white shadow-none"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="farmer">Farmers</SelectItem>
              <SelectItem value="buyer">Buyers</SelectItem>
            </SelectContent>
          </Select>
          <Select value={provinceFilter} onValueChange={setProvinceFilter}>
            <SelectTrigger className="h-8 text-xs w-40 bg-white shadow-none"><SelectValue placeholder="All provinces" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All provinces</SelectItem>
              {ZIMBABWE_PROVINCES.map((p) => <SelectItem key={p} value={p.toLowerCase()}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <SearchSelect
            queryKey="blast-category-filter"
            queryFn={(params) => queryFarmProduceCategories(params)}
            getItems={(page) => page?.data?.data ?? []}
            value={categoryFilter === "all" ? "" : categoryFilter}
            onValueChange={(v) => { setCategoryFilter(v || "all"); setProduceFilter("all") }}
            getLabel={(c) => c.name}
            getValue={(c) => c.slug}
            placeholder="All categories"
            clearable
            capitalize
            className="h-8 text-xs w-40"
          />
          <SearchSelect
            key={categoryFilter}
            queryKey={["blast-produce-filter", categoryFilter]}
            queryFn={(params) => categoryFilter !== "all" ? queryFarmProduceByCategory(categoryFilter) : queryFarmProduce(params)}
            getItems={(page) => page?.data?.data ?? []}
            value={produceFilter === "all" ? "" : produceFilter}
            onValueChange={(v) => setProduceFilter(v || "all")}
            getLabel={(p) => p.name}
            getValue={(p) => p.slug}
            placeholder="All produce"
            clearable
            capitalize
            className="h-8 text-xs w-36"
          />
        </div>

        {/* ── Body: left recipients + right compose ── */}
        <div className="flex min-h-0 h-[560px]">

          {/* Left: recipient list */}
          <div className="w-72 shrink-0 border-r flex flex-col">

            {/* Search + count bar */}
            <div className="px-3 py-2 border-b shrink-0 flex items-center gap-2">
              <div className="relative flex-1">
                <Icons.search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <input type="text" placeholder="Search…" value={recipientSearch}
                  onChange={(e) => setRecipientSearch(e.target.value)}
                  className="w-full h-7 pl-7 pr-2 text-xs rounded-md bg-background border border-input outline-none placeholder:text-muted-foreground/50" />
              </div>
              <button onClick={toggleAll} className="text-xs text-muted-foreground hover:text-foreground hover:underline shrink-0">
                {selected.size === clients.length && clients.length > 0 ? "Clear" : "All"}
              </button>
            </div>

            {/* Recipient list */}
            <div className="flex-1 overflow-y-auto">
              {clientsQuery.isFetching ? (
                <div className="py-10 flex justify-center">
                  <Icons.spinner className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : visibleClients.length === 0 ? (
                <p className="py-10 text-center text-xs text-muted-foreground">No recipients found</p>
              ) : (
                <div className="divide-y">
                  {visibleClients.map((c) => (
                    <label key={c.id}
                      className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors ${
                        selected.has(c.id) ? "bg-primary/5" : "hover:bg-muted/40"
                      }`}>
                      <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleOne(c.id)}
                        className="h-3.5 w-3.5 rounded border-gray-300 accent-primary shrink-0" />
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate capitalize ${selected.has(c.id) ? "text-primary" : ""}`}>{c.name}</p>
                        <p className="text-xs text-muted-foreground capitalize truncate">{c.type}{c.category ? ` · ${c.category}` : ""}{c.produce ? ` · ${c.produce}` : ""}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: compose */}
          <div className="flex-1 flex flex-col min-w-0">

            {/* Via */}
            <div className="flex items-center gap-3 px-5 py-2.5 border-b shrink-0">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide w-14 shrink-0">Via</span>
              <div className="flex gap-2">
                {(Object.keys(CHANNEL_CONFIG) as Array<keyof typeof CHANNEL_CONFIG>).map((ch) => (
                  <button key={ch} onClick={() => setChannel(ch)}
                    className={`h-7 px-4 rounded-md text-xs font-semibold transition-all ${
                      channel === ch ? CHANNEL_CONFIG[ch].color + " shadow-sm" : CHANNEL_CONFIG[ch].idle
                    }`}>
                    {CHANNEL_CONFIG[ch].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject (email only) */}
            {channel === "email" && (
              <div className="flex items-center gap-3 px-5 border-b shrink-0">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide w-14 shrink-0">Subject</span>
                <input type="text" placeholder="e.g. New prices this week"
                  value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)}
                  className="flex-1 h-10 text-sm bg-transparent outline-none placeholder:text-muted-foreground/40" />
              </div>
            )}

            {/* Body or Preview */}
            <div className="flex-1 overflow-y-auto">
              {showPreview && template.trim() ? (
                <div className="p-6">
                  <p className="text-[11px] text-muted-foreground mb-3">
                    {previewClient ? `Previewing as: ${previewClient.name}` : "No recipient selected — showing raw template"}
                  </p>
                  {channel === "email" ? (
                    <div className="max-w-lg border rounded-lg p-5 space-y-3">
                      {emailSubject && <p className="text-sm font-semibold">{emailSubject}</p>}
                      <p className="text-sm text-muted-foreground">Hi {previewClient?.name ?? "{name}"},</p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{previewMessage}</p>
                      <p className="text-xs text-muted-foreground pt-3 border-t">— The farmnport team</p>
                    </div>
                  ) : (
                    <div>
                      <div className="inline-block max-w-sm bg-muted/40 rounded-2xl rounded-tl-sm px-4 py-3">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{previewMessage}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5 ml-1">
                        {channel === "whatsapp" ? "WhatsApp" : "SMS"} · {previewClient?.phone || "no phone"}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  placeholder={"Hi {name}, we have new prices this week on farmnport.com…"}
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full h-full px-5 pt-4 text-sm bg-transparent outline-none resize-none leading-relaxed placeholder:text-muted-foreground/30" />
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-2.5 border-t bg-muted/10 shrink-0">
              <span className="text-xs text-muted-foreground">
                Use <code className="bg-muted px-1 py-0.5 rounded text-[11px] font-mono">{"{name}"}</code> to personalise
              </span>
              <button onClick={applyTemplate} disabled={selected.size === 0 || !template.trim()}
                className="text-xs font-medium text-primary hover:underline disabled:opacity-40 disabled:no-underline">
                Apply to {selected.size} selected
              </button>
            </div>

            {blastMutation.isError && (
              <p className="px-5 py-2 text-xs text-red-500 border-t bg-red-50 shrink-0">Failed to send. Please try again.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Per-recipient message overrides ── */}
      {selectedClients.length > 0 && template.trim() && (
        <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-2.5 border-b bg-muted/20">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Individual messages — edit any</span>
            <button onClick={applyTemplate} className="text-xs text-primary hover:underline">Re-apply template</button>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y">
            {selectedClients.map((c) => (
              <div key={c.id} className="px-5 py-3">
                <p className="text-xs font-semibold mb-1.5">
                  {c.name}
                  <span className="font-normal text-muted-foreground"> · {channel === "email" ? c.email || "no email" : c.phone || "no phone"}</span>
                </p>
                <textarea rows={2}
                  value={overrides[c.id] ?? template.replace(/\{name\}/gi, c.name)}
                  onChange={(e) => setOverrides((prev) => ({ ...prev, [c.id]: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-sm rounded-md border border-input bg-background resize-none" />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
