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

const STEPS = [
  "Set audience filters",
  "Load recipients",
  "Select recipients",
  "Compose message",
  "Review & personalise",
  "Send blast",
  "Results",
]

// ── API ───────────────────────────────────────────────────────────────────────

// ── Component ─────────────────────────────────────────────────────────────────

export function BlastView() {
  const [step, setStep] = useState(1)

  // Step 1 — filters
  const [typeFilter, setTypeFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("")
  const [searchFilter, setSearchFilter] = useState("")

  // Step 2 — load
  const [loadEnabled, setLoadEnabled] = useState(false)

  // Step 3 — select
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Step 4 — compose
  const [channel, setChannel] = useState("sms")
  const [template, setTemplate] = useState("")
  const [emailSubject, setEmailSubject] = useState("")

  // Step 5 — overrides
  const [overrides, setOverrides] = useState<Record<string, string>>({})

  // Step 7 — results
  const [results, setResults] = useState<{ sent: number; failed: number; results: BlastResult[] } | null>(null)

  const clientsQuery = useQuery({
    queryKey: ["blast-clients", typeFilter, cityFilter, searchFilter, loadEnabled],
    queryFn: () => {
      const p = new URLSearchParams()
      if (typeFilter !== "all") p.set("type", typeFilter)
      if (cityFilter) p.set("city", cityFilter)
      if (searchFilter) p.set("search", searchFilter)
      return authorizedHTTPClient.get<{ data: ClientRow[]; total: number }>(`/v1/blast/clients?${p.toString()}`)
    },
    enabled: loadEnabled,
    refetchOnWindowFocus: false,
  })

  const clients: ClientRow[] = clientsQuery.data?.data?.data ?? []
  const selectedClients = clients.filter((c) => selected.has(c.id))

  const blastMutation = useMutation({
    mutationFn: (recipients: BlastRecipient[]) =>
      authorizedHTTPClient.post<{ sent: number; failed: number; results: BlastResult[] }>("/v1/blast/send", recipients),
    onSuccess: (res) => {
      setResults(res.data)
      setStep(7)
    },
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
    selectedClients.forEach((c) => {
      next[c.id] = template.replace(/\{name\}/gi, c.name)
    })
    setOverrides(next)
  }

  function handleSend() {
    const recipients: BlastRecipient[] = selectedClients.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      message: overrides[c.id] ?? template.replace(/\{name\}/gi, c.name),
      email_subject: emailSubject || "Message from farmnport",
      channel,
    }))
    blastMutation.mutate(recipients)
  }

  function handleReset() {
    setStep(1)
    setTypeFilter("all")
    setCityFilter("")
    setSearchFilter("")
    setLoadEnabled(false)
    setSelected(new Set())
    setChannel("sms")
    setTemplate("")
    setEmailSubject("")
    setOverrides({})
    setResults(null)
  }

  function statusIcon(n: number) {
    if (n < step) return "✅"
    if (n === step) return "👈"
    return "⬜"
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Progress table */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2.5 text-left w-10">#</th>
              <th className="px-4 py-2.5 text-left">Step</th>
              <th className="px-4 py-2.5 text-left w-16">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {STEPS.map((label, i) => {
              const n = i + 1
              return (
                <tr key={n} className={n === step ? "bg-orange-50/60" : ""}>
                  <td className="px-4 py-2.5 text-muted-foreground font-medium">{n}</td>
                  <td className="px-4 py-2.5 font-medium">{label}</td>
                  <td className="px-4 py-2.5 text-base leading-none">{statusIcon(n)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Step panels */}

      {/* Step 1 — Set audience filters */}
      {step === 1 && (
        <div className="rounded-lg border bg-white p-5 space-y-4">
          <h3 className="text-sm font-semibold">Step 1 — Set audience filters</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="farmer">Farmers</SelectItem>
                  <SelectItem value="buyer">Buyers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">City</label>
              <input type="text" placeholder="e.g. Harare" value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full h-8 px-3 text-sm rounded-md border border-input bg-background" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Search name</label>
            <input type="text" placeholder="Search..." value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full h-8 px-3 text-sm rounded-md border border-input bg-background" />
          </div>
          <div className="flex justify-end">
            <button onClick={() => setStep(2)}
              className="px-4 h-8 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90">
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Load recipients */}
      {step === 2 && (
        <div className="rounded-lg border bg-white p-5 space-y-4">
          <h3 className="text-sm font-semibold">Step 2 — Load recipients</h3>
          <p className="text-sm text-muted-foreground">
            Filters: <span className="font-medium capitalize">{typeFilter}</span>
            {cityFilter && <> · <span className="font-medium">{cityFilter}</span></>}
            {searchFilter && <> · <span className="font-medium">"{searchFilter}"</span></>}
          </p>
          <button
            onClick={() => { setLoadEnabled(true); clientsQuery.refetch() }}
            disabled={clientsQuery.isLoading}
            className="w-full h-9 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 flex items-center justify-center">
            {clientsQuery.isLoading
              ? <Icons.spinner className="w-4 h-4 animate-spin" />
              : loadEnabled ? `Reload (${clients.length} found)` : "Load Recipients"}
          </button>
          {loadEnabled && !clientsQuery.isLoading && clients.length === 0 && (
            <p className="text-sm text-red-500">No recipients found. Go back and adjust filters.</p>
          )}
          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="px-4 h-8 rounded-md border text-sm hover:bg-muted/50">← Back</button>
            <button onClick={() => setStep(3)} disabled={clients.length === 0}
              className="px-4 h-8 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-40">
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Select recipients */}
      {step === 3 && (
        <div className="rounded-lg border bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30">
            <h3 className="text-sm font-semibold">Step 3 — Select recipients</h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{selected.size} of {clients.length} selected</span>
              <button onClick={toggleAll} className="text-xs text-primary hover:underline">
                {selected.size === clients.length && clients.length > 0 ? "Clear all" : "Select all"}
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y">
            {clients.map((c) => (
              <label key={c.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 cursor-pointer">
                <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleOne(c.id)}
                  className="h-4 w-4 rounded border-gray-300" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{c.type} · {c.city}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="flex justify-between px-4 py-3 border-t bg-muted/10">
            <button onClick={() => setStep(2)} className="px-4 h-8 rounded-md border text-sm hover:bg-muted/50">← Back</button>
            <button onClick={() => setStep(4)} disabled={selected.size === 0}
              className="px-4 h-8 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-40">
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 4 — Compose message */}
      {step === 4 && (
        <div className="rounded-lg border bg-white p-5 space-y-4">
          <h3 className="text-sm font-semibold">Step 4 — Compose message</h3>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Channel</label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
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
              <input type="text" placeholder="e.g. New prices this week" value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full h-8 px-3 text-sm rounded-md border border-input bg-background" />
            </div>
          )}
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Message — use <code className="bg-muted px-1 rounded text-xs">{"{name}"}</code> to personalise
            </label>
            <textarea rows={5} placeholder="Hi {name}, we have new prices this week..."
              value={template} onChange={(e) => setTemplate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background resize-none" />
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(3)} className="px-4 h-8 rounded-md border text-sm hover:bg-muted/50">← Back</button>
            <button onClick={() => { applyTemplate(); setStep(5) }} disabled={!template.trim()}
              className="px-4 h-8 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-40">
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 5 — Review & personalise */}
      {step === 5 && (
        <div className="rounded-lg border bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30">
            <h3 className="text-sm font-semibold">Step 5 — Review & personalise</h3>
            <button onClick={applyTemplate} className="text-xs text-primary hover:underline">Re-apply template</button>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y">
            {selectedClients.map((c) => (
              <div key={c.id} className="px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {c.name} · {channel === "email" ? c.email || "no email" : c.phone || "no phone"}
                </p>
                <textarea rows={2}
                  value={overrides[c.id] ?? template.replace(/\{name\}/gi, c.name)}
                  onChange={(e) => setOverrides((prev) => ({ ...prev, [c.id]: e.target.value }))}
                  className="w-full px-2 py-1.5 text-sm rounded border border-input bg-background resize-none" />
              </div>
            ))}
          </div>
          <div className="flex justify-between px-4 py-3 border-t bg-muted/10">
            <button onClick={() => setStep(4)} className="px-4 h-8 rounded-md border text-sm hover:bg-muted/50">← Back</button>
            <button onClick={() => setStep(6)}
              className="px-4 h-8 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90">
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 6 — Send blast */}
      {step === 6 && (
        <div className="rounded-lg border bg-white p-5 space-y-4">
          <h3 className="text-sm font-semibold">Step 6 — Send blast</h3>
          <div className="rounded-md bg-muted/30 p-4 space-y-1 text-sm">
            <p><span className="text-muted-foreground">Recipients:</span> <strong>{selected.size}</strong></p>
            <p><span className="text-muted-foreground">Channel:</span> <strong className="capitalize">{channel}</strong></p>
            {channel === "email" && emailSubject && (
              <p><span className="text-muted-foreground">Subject:</span> <strong>{emailSubject}</strong></p>
            )}
            <p><span className="text-muted-foreground">Message preview:</span> {template.replace(/\{name\}/gi, selectedClients[0]?.name ?? "…").slice(0, 80)}{template.length > 80 ? "…" : ""}</p>
          </div>
          {blastMutation.isError && (
            <p className="text-sm text-red-500">Failed to send. Please try again.</p>
          )}
          <div className="flex justify-between">
            <button onClick={() => setStep(5)} className="px-4 h-8 rounded-md border text-sm hover:bg-muted/50">← Back</button>
            <button onClick={handleSend} disabled={blastMutation.isPending}
              className="px-5 h-9 rounded-md bg-primary text-white font-semibold text-sm hover:bg-primary/90 disabled:opacity-40 flex items-center gap-2">
              {blastMutation.isPending
                ? <><Icons.spinner className="w-4 h-4 animate-spin" /> Sending…</>
                : <><Icons.send className="w-4 h-4" /> Send to {selected.size} recipient{selected.size !== 1 ? "s" : ""}</>}
            </button>
          </div>
        </div>
      )}

      {/* Step 7 — Results */}
      {step === 7 && results && (
        <div className="rounded-lg border bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-semibold">Step 7 — Results</h3>
              <span className="text-sm text-green-600 font-medium">✅ {results.sent} sent</span>
              {results.failed > 0 && <span className="text-sm text-red-500 font-medium">⚠️ {results.failed} failed</span>}
            </div>
            <button onClick={handleReset} className="text-xs text-primary hover:underline">New blast</button>
          </div>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-muted/20 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-2 text-left w-10">#</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">To</th>
                <th className="px-4 py-2 text-left">Channel</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {results.results.map((r, i) => (
                <tr key={i} className="hover:bg-muted/50">
                  <td className="px-4 py-2.5 text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-2.5 font-medium">{r.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.to}</td>
                  <td className="px-4 py-2.5 capitalize">{r.channel}</td>
                  <td className="px-4 py-2.5">
                    {r.ok
                      ? <span className="text-green-600 font-medium">✅ Sent</span>
                      : <span className="text-red-500">⚠️ {r.error ?? "Failed"}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}
