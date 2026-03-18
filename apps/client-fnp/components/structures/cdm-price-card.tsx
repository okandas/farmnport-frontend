"use client"

import { Fragment } from "react"
import { formatDate, capitalizeFirstLetter } from "@/lib/utilities"
import { Calendar, Building2, Info } from "lucide-react"
import { CdmPrice, LiveweightEntry } from "@/lib/schemas"

interface CdmPriceCardProps {
  price: CdmPrice
}

const gradeLabels: Record<string, { name: string; code: string; description: string }> = {
  commercial: { name: "Commercial", code: "C", description: "Standard commercial grade carcass" },
  economy: { name: "Economy", code: "X", description: "Economy grade - lower quality carcass" },
  manufacturing: { name: "Manufacturing", code: "J", description: "Manufacturing grade - processing meat" },
}

const teethLabels: Record<string, string> = {
  MT: "Milk Teeth (young cattle, under 2 years)",
  "2T": "2 Teeth (approx. 2-2.5 years)",
  "4T": "4 Teeth (approx. 2.5-3 years)",
  "6T": "6 Teeth (approx. 3-3.5 years)",
}

function formatUSD(value: number): string {
  if (!value || value === 0) return "—"
  return `$${value.toFixed(2)}`
}

function formatZIG(value: number): string {
  if (!value || value === 0) return "—"
  return `ZiG ${value.toFixed(2)}`
}

export function CdmPriceCard({ price }: CdmPriceCardProps) {
  const formattedDate = formatDate(price.effectiveDate)

  const weightRanges = [...new Set(price.liveweight.map((e) => e.weight_range))]
  const teethCategories = [...new Set(price.liveweight.map((e) => e.teeth))]

  const getLiveweightEntry = (weightRange: string, teeth: string): LiveweightEntry | undefined => {
    return price.liveweight.find(
      (e) => e.weight_range === weightRange && e.teeth === teeth
    )
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b">
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
          {price.exchange_rate > 0 && (
            <span className="ml-auto">
              Rate: 1 USD = {price.exchange_rate.toFixed(2)} ZiG
            </span>
          )}
        </div>
      </div>

      <div className="divide-y">
        {/* Carcass Grades Table */}
        <div>
          <div className="px-5 py-2.5 bg-muted/30 border-b">
            <h4 className="text-sm font-semibold text-foreground">
              Carcass Grades (per kg)
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Grade
                  </th>
                  <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Code
                  </th>
                  <th className="px-4 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Collected USD
                  </th>
                  <th className="px-4 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Delivered USD
                  </th>
                  <th className="px-4 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Collected ZiG
                  </th>
                  <th className="px-4 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Delivered ZiG
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {(["commercial", "economy", "manufacturing"] as const).map((grade) => {
                  const gradeData = price.carcass_grades[grade]
                  const label = gradeLabels[grade]
                  return (
                    <tr key={grade} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5 text-sm font-medium text-foreground">
                        {label.name}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-semibold bg-muted text-muted-foreground min-w-[32px]">
                          {label.code}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-sm text-muted-foreground">
                        {formatUSD(gradeData.collected_usd)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-sm font-semibold text-foreground">
                        {formatUSD(gradeData.delivered_usd)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-sm text-muted-foreground">
                        {formatZIG(gradeData.collected_zig)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-sm font-semibold text-foreground">
                        {formatZIG(gradeData.delivered_zig)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Liveweight Matrix Table */}
        {price.liveweight && price.liveweight.length > 0 && (
          <div>
            <div className="px-5 py-2.5 bg-muted/30 border-b">
              <h4 className="text-sm font-semibold text-foreground">
                Liveweight Prices (per kg delivered)
              </h4>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Weight (kg)
                      </th>
                      {teethCategories.map((teeth) => (
                        <th key={teeth} className="px-4 py-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground" colSpan={2}>
                          <span className="inline-flex items-center gap-1 cursor-help" title={teethLabels[teeth] || teeth}>
                            {teeth}
                            <Info className="h-3 w-3" />
                          </span>
                        </th>
                      ))}
                    </tr>
                    <tr className="border-b bg-muted/10">
                      <th></th>
                      {teethCategories.map((teeth) => (
                        <Fragment key={`${teeth}-sub`}>
                          <th className="px-2 py-1.5 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            USD
                          </th>
                          <th className="px-2 py-1.5 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            ZiG
                          </th>
                        </Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {weightRanges.map((range) => (
                      <tr key={range} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 text-sm font-medium text-foreground whitespace-nowrap">
                          {range}
                        </td>
                        {teethCategories.map((teeth) => {
                          const entry = getLiveweightEntry(range, teeth)
                          return (
                            <Fragment key={`${range}-${teeth}`}>
                              <td className="px-2 py-2.5 text-center text-sm font-semibold text-foreground">
                                {entry ? formatUSD(entry.delivered_usd) : "—"}
                              </td>
                              <td className="px-2 py-2.5 text-center text-sm text-muted-foreground">
                                {entry ? formatZIG(entry.delivered_zig) : "—"}
                              </td>
                            </Fragment>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>

            {/* Grade notes */}
            {price.liveweight.some((e) => e.grade_note) && (
              <div className="px-5 py-3 border-t bg-muted/10">
                <p className="text-xs text-muted-foreground font-medium mb-1.5">Grade Notes:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[...new Set(price.liveweight.filter((e) => e.grade_note).map((e) => `${e.weight_range} ${e.teeth}: ${e.grade_note}`))].map((note, i) => (
                    <span key={i} className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {price.notes && price.notes.length > 0 && (
          <div>
            <div className="px-5 py-2.5 bg-muted/30 border-b">
              <h4 className="text-sm font-semibold text-foreground">Notes</h4>
            </div>
            <ul className="px-5 py-3 space-y-1">
              {price.notes.map((note, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/60 mt-0.5">•</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
