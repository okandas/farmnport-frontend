"use client"

import { formatDate, capitalizeFirstLetter, cn } from "@/lib/utilities"
import { Calendar, Building2 } from "lucide-react"
import { CdmPrice, LiveweightEntry } from "@/lib/schemas"

interface CdmPriceCardProps {
  price: CdmPrice
  hideHeader?: boolean
}

const gradeLabels: Record<string, { name: string; code: string }> = {
  commercial: { name: "Commercial", code: "C" },
  economy: { name: "Economy", code: "X" },
  manufacturing: { name: "Manufacturing", code: "J" },
}

const gradeColors = [
  "text-green-700 bg-green-50 ring-green-600/20 dark:text-green-400 dark:bg-green-950/30 dark:ring-green-500/20",
  "text-yellow-700 bg-yellow-50 ring-yellow-600/20 dark:text-yellow-400 dark:bg-yellow-950/30 dark:ring-yellow-500/20",
  "text-orange-700 bg-orange-50 ring-orange-600/20 dark:text-orange-400 dark:bg-orange-950/30 dark:ring-orange-500/20",
]

const teethInfo: Record<string, { name: string; description: string; color: string }> = {
  MT: {
    name: "Milk Teeth",
    description: "Young cattle, under 2 years",
    color: "text-emerald-700 bg-emerald-50 ring-emerald-600/20 dark:text-emerald-400 dark:bg-emerald-950/30 dark:ring-emerald-500/20",
  },
  "2T": {
    name: "2 Teeth",
    description: "Approx. 2–2.5 years",
    color: "text-blue-700 bg-blue-50 ring-blue-600/20 dark:text-blue-400 dark:bg-blue-950/30 dark:ring-blue-500/20",
  },
  "4T": {
    name: "4 Teeth",
    description: "Approx. 2.5–3 years",
    color: "text-amber-700 bg-amber-50 ring-amber-600/20 dark:text-amber-400 dark:bg-amber-950/30 dark:ring-amber-500/20",
  },
  "6T": {
    name: "6 Teeth",
    description: "Approx. 3–3.5 years",
    color: "text-red-700 bg-red-50 ring-red-600/20 dark:text-red-400 dark:bg-red-950/30 dark:ring-red-500/20",
  },
}

function formatUSD(value: number): string {
  if (!value || value === 0) return "—"
  return `$${value.toFixed(2)}`
}

export function CdmPriceCard({ price, hideHeader }: CdmPriceCardProps) {
  const formattedDate = formatDate(price.effectiveDate)

  const weightRanges = [...new Set(price.liveweight.map((e) => e.weight_range))]
  const teethCategories = [...new Set(price.liveweight.map((e) => e.teeth))]

  const getLiveweightEntry = (weightRange: string, teeth: string): LiveweightEntry | undefined => {
    return price.liveweight.find(
      (e) => e.weight_range === weightRange && e.teeth === teeth
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {!hideHeader && (
        <div className="rounded-lg border bg-card px-5 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {capitalizeFirstLetter(price.client_name)}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span>Cold Dress Mass Pricing</span>
              </div>
            </div>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider bg-muted px-2 py-1 rounded">
              CDM
            </span>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Effective: {formattedDate}
            </span>
          </div>
        </div>
      )}

      {/* Carcass Grades */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="px-5 py-2.5 bg-muted/30 border-b">
          <h4 className="text-sm font-semibold text-foreground">
            Carcass Grades (per kg)
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">Ex Leakage — prices exclude carcass fluid loss</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Grade</th>
                <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Code</th>
                <th className="px-4 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Collected USD</th>
                <th className="px-4 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Delivered USD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {(["commercial", "economy", "manufacturing"] as const).map((grade, idx) => {
                const gradeData = price.carcass_grades[grade]
                const label = gradeLabels[grade]
                return (
                  <tr key={grade} className={cn("transition-colors", idx % 2 === 1 && "bg-muted/15")}>
                    <td className="px-4 py-2.5 text-sm font-medium text-foreground">{label.name}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn(gradeColors[idx], "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset min-w-[32px]")}>
                        {label.code}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-sm text-muted-foreground">{formatUSD(gradeData.collected_usd)}</td>
                    <td className="px-4 py-2.5 text-right text-sm font-semibold text-foreground">{formatUSD(gradeData.delivered_usd)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Liveweight Section */}
      {price.liveweight && price.liveweight.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Steers + Heifers Liveweight (per kg delivered)
          </h4>

          {teethCategories.map((teeth) => {
            const info = teethInfo[teeth]
            if (!info) return null

            const entries = price.liveweight.filter((e) => e.teeth === teeth)
            const hasAnyPrice = entries.some((e) => e.delivered_usd > 0 || e.delivered_zig > 0)
            const isMeaningfulNote = (note: string) => note && !/^\d*\s*teeth\s+liveweight$/i.test(note) && !/^milk\s+teeth\s+liveweight$/i.test(note)
            const hasAnyNote = entries.some((e) => isMeaningfulNote(e.grade_note))

            // Classification-only (no prices) — table with Weight + Status
            if (!hasAnyPrice && hasAnyNote) {
              return (
                <div key={teeth} className="rounded-lg border bg-card overflow-hidden">
                  <div className="px-5 py-2.5 bg-muted/30 border-b flex items-center gap-3">
                    <h5 className="text-sm font-semibold text-foreground">{info.name}</h5>
                    <span className={cn(info.color, "rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset")}>
                      {teeth}
                    </span>
                    <span className="text-xs text-muted-foreground">{info.description}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Weight (kg)</th>
                          <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {weightRanges.map((range, i) => {
                          const entry = getLiveweightEntry(range, teeth)
                          const note = entry?.grade_note || ""
                          const cleanNote = note.replace(/^\d+\s*teeth\s*-\s*/i, "")
                          const isCondemn = note.toLowerCase().includes("condemn")
                          const isKill = note.toLowerCase().includes("kill") || note.toLowerCase().includes("low grade")

                          return (
                            <tr key={range} className={cn("transition-colors", i % 2 === 1 && "bg-muted/15")}>
                              <td className="px-4 py-2.5 text-sm font-medium text-foreground whitespace-nowrap">{range}</td>
                              <td className="px-4 py-2.5">
                                {cleanNote ? (
                                  <span className={cn(
                                    "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                                    isCondemn
                                      ? "text-red-700 bg-red-50 ring-red-600/20 dark:text-red-400 dark:bg-red-950/30"
                                      : isKill
                                        ? "text-amber-700 bg-amber-50 ring-amber-600/20 dark:text-amber-400 dark:bg-amber-950/30"
                                        : "text-muted-foreground bg-muted ring-border"
                                  )}>
                                    {cleanNote}
                                  </span>
                                ) : "—"}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            }

            // Has prices — full table
            return (
              <div key={teeth} className="rounded-lg border bg-card overflow-hidden">
                <div className="px-5 py-2.5 bg-muted/30 border-b flex items-center gap-3">
                  <h5 className="text-sm font-semibold text-foreground">{info.name}</h5>
                  <span className={cn(info.color, "rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset")}>
                    {teeth}
                  </span>
                  <span className="text-xs text-muted-foreground">{info.description}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Weight (kg)</th>
                        <th className="px-4 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">USD</th>
                        {hasAnyNote && (
                          <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {weightRanges.map((range, i) => {
                        const entry = getLiveweightEntry(range, teeth)
                        const hasPrice = entry && (entry.delivered_usd > 0 || entry.delivered_zig > 0)
                        const note = entry?.grade_note || ""
                        const cleanNote = note.replace(/^\d+\s*teeth\s*-\s*/i, "")
                        const isCondemn = note.toLowerCase().includes("condemn")
                        const isKill = note.toLowerCase().includes("kill") || note.toLowerCase().includes("low grade")

                        return (
                          <tr key={range} className={cn("transition-colors", i % 2 === 1 && "bg-muted/15")}>
                            <td className="px-4 py-2.5 text-sm font-medium text-foreground whitespace-nowrap">{range}</td>
                            <td className="px-4 py-2.5 text-right text-sm font-semibold text-foreground">
                              {hasPrice ? formatUSD(entry!.delivered_usd) : "—"}
                            </td>
                            {hasAnyNote && (
                              <td className="px-4 py-2.5">
                                {cleanNote ? (
                                  <span className={cn(
                                    "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                                    isCondemn
                                      ? "text-red-700 bg-red-50 ring-red-600/20 dark:text-red-400 dark:bg-red-950/30"
                                      : isKill
                                        ? "text-amber-700 bg-amber-50 ring-amber-600/20 dark:text-amber-400 dark:bg-amber-950/30"
                                        : "text-muted-foreground bg-muted ring-border"
                                  )}>
                                    {cleanNote}
                                  </span>
                                ) : hasPrice ? (
                                  <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset text-emerald-700 bg-emerald-50 ring-emerald-600/20 dark:text-emerald-400 dark:bg-emerald-950/30">
                                    Accepted
                                  </span>
                                ) : "—"}
                              </td>
                            )}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Notes */}
      {price.notes && price.notes.length > 0 && (
        <div className="rounded-lg border bg-card px-5 py-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Important Notes</h4>
          <div className="space-y-2">
            {price.notes.map((note, i) => (
              <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                {note}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
