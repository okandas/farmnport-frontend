"use client"

import { useRef, useState, useEffect } from "react"
import { select } from "d3-selection"
import "d3-transition"
import { interpolatePath } from "d3-interpolate-path"
import { easeCubicOut } from "d3-ease"

const toDollars = (v: number) => "$" + (v / 100).toFixed(2)

type PriceChartProps = {
  values: number[]
  dates?: string[]
  color?: { stroke: string; fill: string }
  animKey?: number
}

const PAD = { top: 20, right: 64, bottom: 32, left: 0 }
const HEIGHT = 300
const GRID_LINES = 5

function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return ""
  let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[Math.max(0, i - 1)]
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[i + 1]
    const [x3, y3] = pts[Math.min(pts.length - 1, i + 2)]
    const cp1x = x1 + (x2 - x0) / 6
    const cp1y = y1 + (y2 - y0) / 6
    const cp2x = x2 - (x3 - x1) / 6
    const cp2y = y2 - (y3 - y1) / 6
    d += ` C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${x2.toFixed(2)},${y2.toFixed(2)}`
  }
  return d
}

const formatDate = (iso: string) => {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function forwardFill(values: number[], dates: string[]): { values: number[]; dates: string[] } {
  if (values.length === 0) return { values: [], dates: [] }
  if (values.length !== dates.length || dates.length === 0) return { values, dates }

  const MS_PER_DAY = 86400000
  const result: { value: number; date: string }[] = []

  for (let i = 0; i < values.length; i++) {
    const start = new Date(dates[i])
    const end = i < values.length - 1 ? new Date(dates[i + 1]) : new Date()
    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)

    let d = new Date(start)
    while (d <= end) {
      result.push({ value: values[i], date: d.toISOString() })
      d = new Date(d.getTime() + MS_PER_DAY)
    }
  }

  return {
    values: result.map(r => r.value),
    dates: result.map(r => r.date),
  }
}

export function PriceChart({ values, dates = [], color, animKey }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const lineRef = useRef<SVGPathElement>(null)
  const areaRef = useRef<SVGPathElement>(null)
  const prevLinePathRef = useRef<string>("")
  const prevAreaPathRef = useRef<string>("")
  const prevValuesKeyRef = useRef<string>("")
  const [width, setWidth] = useState(600)
  const [hover, setHover] = useState<{ x: number; y: number; price: number; idx: number } | null>(null)

  // Responsive width — outer div always renders so this fires reliably
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(entries => {
      setWidth(Math.round(entries[0].contentRect.width))
    })
    observer.observe(el)
    setWidth(Math.round(el.getBoundingClientRect().width))
    return () => observer.disconnect()
  }, [])

  // Compute geometry
  const hasData = values.length >= 2
  const filled = hasData ? forwardFill(values, dates) : { values: [], dates: [] }
  const filledValues = filled.values
  const filledDates = filled.dates

  const chartW = width - PAD.left - PAD.right
  const chartH = HEIGHT - PAD.top - PAD.bottom

  const min = filledValues.length ? Math.min(...filledValues) : 0
  const max = filledValues.length ? Math.max(...filledValues) : 1
  const padded = (max - min || 1) * 0.05
  const lo = min - padded
  const hi = max + padded
  const span = hi - lo

  const sx = (i: number) =>
    filledValues.length > 1 ? PAD.left + (i / (filledValues.length - 1)) * chartW : PAD.left

  const sy = (v: number) => PAD.top + (1 - (v - lo) / span) * chartH

  const pts: [number, number][] = filledValues.map((v, i) => [sx(i), sy(v)])
  const linePath = smoothPath(pts)
  const areaPath = pts.length >= 2
    ? linePath
      + ` L${pts[pts.length - 1][0].toFixed(2)},${(PAD.top + chartH).toFixed(2)}`
      + ` L${pts[0][0].toFixed(2)},${(PAD.top + chartH).toFixed(2)} Z`
    : ""

  const isUp = filledValues.length >= 2
    ? filledValues[filledValues.length - 1] >= filledValues[0]
    : true
  const stroke = color?.stroke ?? (isUp ? "#00A83E" : "#FF3A33")

  // Single animation effect — fires when linePath or animKey changes.
  // Uses a values fingerprint to skip width-only re-renders (same data, different coords).
  // When animKey changes before data arrives (loading), linePath="" so we skip;
  // when data then arrives linePath changes, we re-run and animate correctly.
  useEffect(() => {
    const lineEl = lineRef.current
    const areaEl = areaRef.current
    if (!lineEl || !areaEl || !linePath) return

    // Skip if only the chart width changed (same underlying values)
    const valuesKey = values.join(",")
    if (valuesKey === prevValuesKeyRef.current) return
    prevValuesKeyRef.current = valuesKey

    const prevLine = prevLinePathRef.current

    if (!prevLine) {
      // First load: fade in
      select(lineEl).style("opacity", "0")
        .transition().duration(500).ease(easeCubicOut)
        .style("opacity", "1")
      select(areaEl).style("opacity", "0")
        .transition().duration(500).ease(easeCubicOut)
        .style("opacity", "1")
    } else {
      // Grade / time-range switch: D3 path morph
      lineEl.style.strokeDasharray = ""
      lineEl.style.strokeDashoffset = ""
      select(lineEl).interrupt()
        .transition().duration(500).ease(easeCubicOut)
        .attrTween("d", () => interpolatePath(prevLine, linePath))
      select(areaEl).interrupt()
        .transition().duration(500).ease(easeCubicOut)
        .attrTween("d", () => interpolatePath(prevAreaPathRef.current, areaPath))
    }

    prevLinePathRef.current = linePath
    prevAreaPathRef.current = areaPath
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linePath, animKey])

  // Always render outer div so ResizeObserver mounts immediately
  if (!hasData) {
    return <div ref={containerRef} className="w-full" style={{ height: HEIGHT }} />
  }

  const ticks = Array.from({ length: GRID_LINES }, (_, i) => {
    const frac = i / (GRID_LINES - 1)
    return { y: PAD.top + frac * chartH, label: toDollars(hi - frac * span) }
  })

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const mouseX = e.clientX - rect.left - PAD.left
    const idx = Math.max(0, Math.min(filledValues.length - 1, Math.round((mouseX / chartW) * (filledValues.length - 1))))
    setHover({ x: pts[idx][0], y: pts[idx][1], price: filledValues[idx], idx })
  }

  const activePts = hover ?? {
    x: pts[pts.length - 1][0],
    y: pts[pts.length - 1][1],
    price: filledValues[filledValues.length - 1],
  }
  const badgeY = Math.max(PAD.top + 12, Math.min(PAD.top + chartH - 12, activePts.y))

  const CARD_W = 160
  const tooltipX = hover
    ? (hover.x + 16 + CARD_W > chartW ? hover.x - CARD_W - 16 : hover.x + 16)
    : 0
  const tooltipY = hover ? Math.max(PAD.top, hover.y - 36) : 0

  return (
    <div ref={containerRef} className="w-full select-none" style={{ position: "relative" }}>
      {hover && (
        <div
          style={{
            position: "absolute",
            left: tooltipX + PAD.left,
            top: tooltipY,
            width: CARD_W,
            pointerEvents: "none",
            zIndex: 20,
            background: "hsl(var(--background, 0 0% 100%))",
            border: "1px solid hsl(var(--border, 220 13% 91%))",
            opacity: 1,
            borderRadius: 8,
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            padding: "10px 14px",
          }}
        >
          <p style={{ fontSize: 11, color: "var(--muted-foreground, #6b7280)", marginBottom: 4 }}>
            {filledDates[hover.idx] ? formatDate(filledDates[hover.idx]) : `Submission #${hover.idx + 1}`}
          </p>
          <p style={{ fontSize: 13, fontWeight: 700, color: stroke }}>
            {toDollars(hover.price)}
          </p>
        </div>
      )}
      <svg
        ref={svgRef}
        width={width}
        height={HEIGHT}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHover(null)}
        style={{ cursor: "crosshair", display: "block", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="pcGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.4} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
          <clipPath id="pcClip">
            <rect x={PAD.left} y={PAD.top} width={chartW} height={chartH} />
          </clipPath>
        </defs>

        {ticks.map((t, i) => (
          <line key={i} x1={PAD.left} x2={PAD.left + chartW} y1={t.y} y2={t.y}
            stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} className="text-foreground" />
        ))}

        <g clipPath="url(#pcClip)">
          <path ref={areaRef} d={areaPath} fill="url(#pcGrad)" stroke="none" />
          <path ref={lineRef} d={linePath} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {ticks.map((t, i) => (
          <text key={i} x={PAD.left + chartW + 8} y={t.y + 4}
            fontSize={11} fill="currentColor" fillOpacity={0.45} className="text-foreground">
            {t.label}
          </text>
        ))}

        {!hover && (
          <>
            <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={4} fill={stroke} fillOpacity={0.2}>
              <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" />
              <animate attributeName="fill-opacity" values="0.25;0;0.25" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={3} fill={stroke} />
          </>
        )}

        {hover && (
          <>
            <line x1={hover.x} x2={hover.x} y1={PAD.top} y2={PAD.top + chartH}
              stroke="currentColor" strokeOpacity={0.3} strokeWidth={1} className="text-foreground" />
            <circle cx={hover.x} cy={hover.y} r={5} fill="white" stroke={stroke} strokeWidth={2} />
          </>
        )}

        <rect x={PAD.left + chartW + 10} y={badgeY - 11} width={PAD.right - 12} height={22} rx={4} fill={stroke} />
        <text x={PAD.left + chartW + 10 + (PAD.right - 12) / 2} y={badgeY + 4}
          textAnchor="middle" fontSize={11} fill="white" fontWeight={600}>
          {toDollars(activePts.price)}
        </text>

        <line x1={PAD.left} x2={PAD.left + chartW} y1={PAD.top + chartH} y2={PAD.top + chartH}
          stroke="currentColor" strokeOpacity={0.12} strokeWidth={1} className="text-foreground" />

        {[0, Math.floor((filledValues.length - 1) / 2), filledValues.length - 1].map((idx, i) => (
          <text key={i} x={sx(idx)} y={PAD.top + chartH + 18}
            textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"}
            fontSize={11} fill="currentColor" fillOpacity={0.45} className="text-foreground">
            {filledDates[idx] ? formatDate(filledDates[idx]) : `#${idx + 1}`}
          </text>
        ))}
      </svg>
    </div>
  )
}
