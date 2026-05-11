"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { queryGradeSummary } from "@/lib/query"

const toDollars = (v: number) => (v / 100).toFixed(2)

type GradeEntry = {
  key: string
  produce: string
  grade: string
  code: string
  price_type: string
  avg: number
  high: number
  low: number
  trend: number[]
}

function AreaChart({ values }: { values: number[] }) {
  const filtered = values.filter(v => v > 0)
  if (filtered.length < 2) return (
    <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">Not enough data</div>
  )
  const w = 800, h = 200
  const min = Math.min(...filtered)
  const max = Math.max(...filtered)
  const range = max - min || 1
  const pad = 8

  const coords = filtered.map((v, i) => ({
    x: (i / (filtered.length - 1)) * w,
    y: h - pad - ((v - min) / range) * (h - pad * 2),
  }))

  const linePts = coords.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
  const areaPts = [
    `0,${h}`,
    ...coords.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`),
    `${w},${h}`,
  ].join(" ")

  const up = filtered[filtered.length - 1] >= filtered[0]
  const stroke = up ? "#16a34a" : "#ef4444"
  const fill = up ? "rgba(22,163,74,0.08)" : "rgba(239,68,68,0.08)"

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full">
      <polygon points={areaPts} fill={fill} />
      <polyline points={linePts} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ProduceGradeBoard({ produce, code }: { produce: string, code: string }) {
  const { data: gradeSummaryData } = useQuery({
    queryKey: ["grade-summary"],
    queryFn: queryGradeSummary,
    refetchOnWindowFocus: false,
  })

  const allEntries: GradeEntry[] = gradeSummaryData?.data ?? []

  const entry = allEntries.find(
    e => e.produce.toLowerCase() === produce.toLowerCase() &&
         e.code.toLowerCase() === code.toLowerCase()
  ) ?? allEntries.find(
    e => e.produce.toLowerCase() === produce.toLowerCase()
  )

  const gradeEntries = allEntries
    .filter(e => e.produce.toLowerCase() === produce.toLowerCase())
    .sort((a, b) => b.avg - a.avg)

  const produceName = produce.charAt(0).toUpperCase() + produce.slice(1)

  return (
    <main className="min-h-screen">

      {/* breadcrumb strip */}
      <div className="border-b bg-muted/30 text-[11px]">
        <div className="px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-1.5 text-muted-foreground">
          <Link href="/prices" className="hover:text-foreground">Prices</Link>
          <span>/</span>
          <Link href={`/prices/${produce.toLowerCase()}`} className="hover:text-foreground capitalize">{produceName}</Link>
          {entry && <><span>/</span><span className="text-foreground">{entry.grade}</span></>}
        </div>
      </div>

      {/* main layout */}
      <div className="flex min-h-[calc(100vh-33px)]">

        {/* ── left price panel (CoinGecko style) ── */}
        <div className="w-72 xl:w-80 shrink-0 border-r px-6 py-8">
          {entry ? (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{entry.code}</span>
                  <span className="text-xs text-muted-foreground italic">{entry.price_type}</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight">{entry.produce}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">{entry.grade}</p>
              </div>

              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-widest mb-1">Avg Price</p>
                <p className="text-4xl font-black tabular-nums">${toDollars(entry.avg)}</p>
                <p className="text-xs text-muted-foreground mt-1">per kg delivered</p>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">High</span>
                  <span className="font-semibold tabular-nums text-green-600">{entry.high ? `$${toDollars(entry.high)}` : "—"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Low</span>
                  <span className="font-semibold tabular-nums text-red-500">{entry.low ? `$${toDollars(entry.low)}` : "—"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Price Type</span>
                  <span className="font-medium">{entry.price_type}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Market</span>
                  <span className="font-medium">Zimbabwe</span>
                </div>
              </div>

              {/* grade switcher */}
              {gradeEntries.length > 1 && (
                <div className="border-t pt-4">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-widest mb-3">All {produceName} Grades</p>
                  <div className="space-y-1">
                    {gradeEntries.map(e => (
                      <Link
                        key={e.key}
                        href={`/prices/${produce.toLowerCase()}?code=${e.code.toLowerCase()}`}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                          e.code.toLowerCase() === (entry?.code ?? "").toLowerCase()
                            ? "bg-foreground text-background"
                            : "hover:bg-muted/60 text-foreground"
                        }`}
                      >
                        <span className="font-medium">{e.grade}</span>
                        <span className="tabular-nums font-semibold">${toDollars(e.avg)}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="h-6 w-24 bg-muted rounded animate-pulse" />
              <div className="h-10 w-32 bg-muted rounded animate-pulse" />
            </div>
          )}
        </div>

        {/* ── center: chart + table ── */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 px-6 lg:px-10 py-8">

            {entry && (
              <div className="mb-2">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Price History</p>
                <p className="text-2xl font-black tabular-nums">${toDollars(entry.avg)}<span className="text-sm font-normal text-muted-foreground ml-1">/kg avg</span></p>
              </div>
            )}

            {/* area chart */}
            <div className="mt-4 mb-2">
              {entry?.trend?.length >= 2 ? (
                <>
                  <AreaChart values={entry.trend} />
                  <div className="flex justify-between text-[11px] text-muted-foreground mt-1 tabular-nums px-1">
                    <span>${toDollars(entry.trend[0])}</span>
                    <span>${toDollars(entry.trend[entry.trend.length - 1])}</span>
                  </div>
                </>
              ) : (
                <div className="h-48 border border-dashed border-border rounded flex items-center justify-center text-sm text-muted-foreground">
                  Not enough history to draw chart
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── right sidebar ── */}
        <aside className="hidden xl:block w-72 shrink-0 border-l">
          <div className="sticky top-6 px-5 pt-6">
            <p className="text-sm mb-3"><span className="font-bold text-foreground">Market</span> <span className="font-normal text-muted-foreground">Insights</span></p>
            <p className="text-sm text-muted-foreground">Headlines coming soon</p>
          </div>
        </aside>

      </div>
    </main>
  )
}
