"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Icons } from "@/components/icons/lucide"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { queryImportPriceSeries } from "@/lib/query"

// Shape sent to the backend
type SeriesEntry = {
  submission_id: string
  effective_date: string // ISO string
  client_id: string
  client_name: string
  template_type: "cdm" | "lwt"
  code: string
  name: string
  category: string
  type: "cdm" | "lwt" | "breed"
  weight_min_grams?: number
  weight_max_grams?: number
  avg_weight_grams?: number
  price_per_kg?: number // cents
  avg_amount_head?: number // cents
  max_amount_head?: number // cents
  min_amount_head?: number // cents
  pricing: {
    collected?: number // cents
    delivered?: number // cents
  }
  notes?: string
}

type ParsedSeries = {
  templateType: "cdm" | "lwt"
  clientId: string
  clientName: string
  effectiveDate: string
  submissionId: string
  entries: SeriesEntry[]
  countByCategory: Record<string, number>
  errors: string[]
}

// SHA-256 via Web Crypto API
async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

// Parse "260-299 KG" → { min: 260000, max: 299000 }
// Parse "300+ KG"   → { min: 300000, max: undefined }
function parseWeightBand(name: string): { min?: number; max?: number } {
  const rangeMatch = name.match(/(\d+)\s*[-–]\s*(\d+)\s*KG/i)
  if (rangeMatch) {
    return {
      min: parseInt(rangeMatch[1], 10) * 1000,
      max: parseInt(rangeMatch[2], 10) * 1000,
    }
  }
  const plusMatch = name.match(/(\d+)\+\s*KG/i)
  if (plusMatch) {
    return { min: parseInt(plusMatch[1], 10) * 1000 }
  }
  return {}
}

// USD dollars string → cents int
function toCents(val: string | number | null | undefined): number | undefined {
  if (val === null || val === undefined || val === "") return undefined
  const cleaned = typeof val === "string" ? val.replace(/[$,\s]/g, "") : val
  const n = typeof cleaned === "number" ? cleaned : parseFloat(String(cleaned))
  if (isNaN(n)) return undefined
  return Math.round(n * 100)
}

async function parseSheet(file: File): Promise<ParsedSeries> {
  // @ts-ignore
  const XLSX = await import("xlsx")

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const workbook = XLSX.read(new Uint8Array(e.target?.result as ArrayBuffer), { type: "array" })
        const ws = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, {
          header: 1,
          raw: false,
          defval: "",
        }) as string[][]

        const title = rows[0]?.[0]?.toString().toUpperCase() ?? ""
        const templateType: "cdm" | "lwt" = title.includes("CARCASS DEAD MEAT")
          ? "cdm"
          : title.includes("LIVE WEIGHT")
          ? "lwt"
          : "lwt" // default

        const effectiveDateRaw = rows[1]?.[1]?.toString().trim() ?? ""
        const clientName = rows[3]?.[1]?.toString().trim() ?? ""
        const clientId = rows[4]?.[1]?.toString().trim() ?? ""

        const errors: string[] = []

        if (!effectiveDateRaw) errors.push("Effective date is missing (row 2)")
        if (!clientId) errors.push("UserId is missing (row 5)")

        // Parse date — accept "DD/MM/YYYY", "YYYY-MM-DD", or Excel serial
        let effectiveDate = ""
        if (effectiveDateRaw) {
          // DD/MM/YYYY
          const dmyMatch = effectiveDateRaw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
          if (dmyMatch) {
            effectiveDate = `${dmyMatch[3]}-${dmyMatch[2].padStart(2, "0")}-${dmyMatch[1].padStart(2, "0")}T00:00:00Z`
          } else if (/^\d{4}-\d{2}-\d{2}/.test(effectiveDateRaw)) {
            effectiveDate = new Date(effectiveDateRaw).toISOString()
          } else {
            // Try generic parse
            const d = new Date(effectiveDateRaw)
            if (!isNaN(d.getTime())) {
              effectiveDate = d.toISOString()
            } else {
              errors.push(`Cannot parse effective date: "${effectiveDateRaw}"`)
            }
          }
        }

        const submissionId = await sha256(`${clientId}${effectiveDate}${templateType}`)

        const entries: SeriesEntry[] = []
        const countByCategory: Record<string, number> = {}

        let currentCategory = ""

        // Find the header row dynamically — xlsx skips blank rows so the index shifts
        // Look for the row that starts with "Category"
        const headerRowIndex = rows.findIndex(
          (r) => r[0]?.toString().trim().toLowerCase() === "category"
        )
        const dataStartIndex = headerRowIndex >= 0 ? headerRowIndex + 1 : 9


        // CDM columns: 0=Category, 1=Grade, 2=Code, 3=CollectedUSD, 4=DeliveredUSD, 5=CollectedZIG, 6=DeliveredZIG, 7=Notes
        // LWT columns: 0=Category, 1=Grade, 2=Code, 3=AvgKG, 4=PricePerKg, 5=AvgAmt, 6=MaxAmt, 7=MinAmt, 8=CollectedUSD, 9=DeliveredUSD, 10=CollectedZIG, 11=DeliveredZIG, 12=Notes

        for (let i = dataStartIndex; i < rows.length; i++) {
          const row = rows[i]
          if (!row || row.every((c) => !c || !c.toString().trim())) continue

          const rawCategory = row[0]?.toString().trim()
          const grade = row[1]?.toString().trim()
          const code = row[2]?.toString().trim()

          if (!grade) continue

          if (rawCategory) currentCategory = rawCategory.toUpperCase()
          if (!currentCategory) continue

          let entry: SeriesEntry

          if (templateType === "cdm") {
            const collected = toCents(row[3])
            const delivered = toCents(row[4])
            const notes = row[7]?.toString().trim() || undefined

            if (collected === undefined && delivered === undefined) continue

            entry = {
              submission_id: submissionId,
              effective_date: effectiveDate,
              client_id: clientId,
              client_name: clientName,
              template_type: "cdm",
              code: code,
              name: grade,
              category: currentCategory,
              type: "cdm",
              pricing: {
                collected,
                delivered,
              },
              notes,
            }
          } else {
            // LWT
            const avgKgRaw = row[3]?.toString().trim()
            const pricePerKgRaw = row[4]?.toString().trim()
            const avgAmountHeadRaw = row[5]?.toString().trim()
            const maxAmountHeadRaw = row[6]?.toString().trim()
            const minAmountHeadRaw = row[7]?.toString().trim()
            const collectedRaw = row[8]?.toString().trim()
            const deliveredRaw = row[9]?.toString().trim()
            const notes = row[12]?.toString().trim() || undefined

            const avgKg = avgKgRaw ? parseFloat(avgKgRaw) : null
            const pricePerKgUsd = pricePerKgRaw ? parseFloat(pricePerKgRaw) : null
            const collected = toCents(collectedRaw)
            const delivered = toCents(deliveredRaw)
            const pricePerKgCents = pricePerKgUsd && !isNaN(pricePerKgUsd) ? Math.round(pricePerKgUsd * 100) : undefined
            const avgAmountHead = toCents(avgAmountHeadRaw)
            const maxAmountHead = toCents(maxAmountHeadRaw)
            const minAmountHead = toCents(minAmountHeadRaw)

            if (
              collected === undefined &&
              delivered === undefined &&
              pricePerKgCents === undefined &&
              avgAmountHead === undefined
            )
              continue

            const { min: weightMin, max: weightMax } = parseWeightBand(grade)

            // Classify type: has weight band = "lwt", else check category for breed
            const breedCategories = ["BORAN", "BRAHMAN", "SIMBRA", "TULI", "BREEDING"]
            const entryType: "lwt" | "breed" = breedCategories.includes(currentCategory)
              ? "breed"
              : "lwt"

            entry = {
              submission_id: submissionId,
              effective_date: effectiveDate,
              client_id: clientId,
              client_name: clientName,
              template_type: "lwt",
              code: code,
              name: grade,
              category: currentCategory,
              type: entryType,
              weight_min_grams: weightMin,
              weight_max_grams: weightMax,
              avg_weight_grams: avgKg ? Math.round(avgKg * 1000) : undefined,
              price_per_kg: pricePerKgCents,
              avg_amount_head: avgAmountHead,
              max_amount_head: maxAmountHead,
              min_amount_head: minAmountHead,
              pricing: {
                collected,
                delivered,
              },
              notes,
            }
          }

          if (entry.code && entry.code.includes(" ")) {
            errors.push(`Row ${i + 1}: code "${entry.code}" looks like a full name — use a short code (e.g. BOCIC, ANGCC)`)
          }

          entries.push(entry)
          countByCategory[currentCategory] = (countByCategory[currentCategory] ?? 0) + 1
        }

        resolve({
          templateType,
          clientId,
          clientName,
          effectiveDate,
          submissionId,
          entries,
          countByCategory,
          errors,
        })
      } catch (err) {
        reject(new Error(`Failed to parse file: ${err}`))
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsArrayBuffer(file)
  })
}

type SeriesImportProps = {
  onImportSuccess?: () => void
}

export function SeriesImport({ onImportSuccess }: SeriesImportProps) {
  const [open, setOpen] = useState(false)
  const [parsed, setParsed] = useState<ParsedSeries | null>(null)
  const [overwrite, setOverwrite] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ inserted: number; updated: number } | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const onDrop = useCallback(async (files: File[]) => {
    if (!files.length) return
    setLoading(true)
    setParsed(null)
    setResult(null)
    setSubmitError(null)
    try {
      const data = await parseSheet(files[0])
      setParsed(data)
    } catch (err) {
      setParsed({
        templateType: "lwt",
        clientId: "",
        clientName: "",
        effectiveDate: "",
        submissionId: "",
        entries: [],
        countByCategory: {},
        errors: [err instanceof Error ? err.message : "Unknown error"],
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxFiles: 1,
  })

  const handleSubmit = async () => {
    if (!parsed || parsed.entries.length === 0) return
    setLoading(true)
    setSubmitError(null)
    try {
      const res = await queryImportPriceSeries({ entries: parsed.entries, overwrite })
      setResult(res.data)
      onImportSuccess?.()
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message ?? "Import failed")
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setParsed(null)
    setResult(null)
    setSubmitError(null)
    setOverwrite(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2">
          <Icons.fileSpreadsheet className="size-4" />
          Import Price Series
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Livestock Price Series</DialogTitle>
          <DialogDescription>
            Upload a Farmnport CDM or LWT master price template (.xlsx)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!parsed && !result && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <Icons.upload className="size-12 text-muted-foreground" />
                {loading ? (
                  <p className="text-sm text-muted-foreground">Parsing file...</p>
                ) : isDragActive ? (
                  <p className="text-sm text-muted-foreground">Drop here</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Drag & drop .xlsx or click to select
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-3">
              <Alert>
                <Icons.check className="size-4" />
                <AlertTitle>Import complete</AlertTitle>
                <AlertDescription>
                  {result.inserted} inserted &nbsp;·&nbsp; {result.updated} updated
                </AlertDescription>
              </Alert>
              <Button variant="outline" onClick={reset}>Import another file</Button>
            </div>
          )}

          {/* Preview */}
          {parsed && !result && (
            <div className="space-y-4">
              {parsed.errors.length > 0 && (
                <Alert variant="destructive">
                  <Icons.alertCircle className="size-4" />
                  <AlertTitle>Errors</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-4 space-y-1">
                      {parsed.errors.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {submitError && (
                <Alert variant="destructive">
                  <Icons.alertCircle className="size-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              <div className="rounded-md border p-3 text-sm space-y-1">
                <div className="flex gap-4 flex-wrap">
                  <span><span className="text-muted-foreground">Template:</span> <Badge variant="secondary">{parsed.templateType.toUpperCase()}</Badge></span>
                  <span><span className="text-muted-foreground">Client:</span> {parsed.clientName || parsed.clientId}</span>
                  <span><span className="text-muted-foreground">Date:</span> {parsed.effectiveDate ? new Date(parsed.effectiveDate).toLocaleDateString("en-GB") : "—"}</span>
                  <span><span className="text-muted-foreground">Entries with prices:</span> <strong>{parsed.entries.length}</strong></span>
                </div>
              </div>

              {Object.keys(parsed.countByCategory).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(parsed.countByCategory).map(([cat, count]) => (
                    <Badge key={cat} variant="outline">{cat}: {count}</Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Checkbox
                  id="overwrite"
                  checked={overwrite}
                  onCheckedChange={(v) => setOverwrite(v === true)}
                />
                <Label htmlFor="overwrite" className="text-sm">
                  Force update existing entries
                </Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={reset} disabled={loading}>
                  Clear
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || parsed.entries.length === 0 || parsed.errors.length > 0}
                >
                  {loading ? (
                    <><Icons.loader className="size-4 mr-2 animate-spin" />Importing...</>
                  ) : (
                    <>Import {parsed.entries.length} entries</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
