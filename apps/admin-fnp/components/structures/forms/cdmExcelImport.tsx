"use client"

import { useState, useCallback } from "react"
import { UseFormSetValue } from "react-hook-form"
import { useDropzone } from "react-dropzone"
import { CdmPrice, ApplicationUser } from "@/lib/schemas"
import { queryUsers } from "@/lib/query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Icons } from "@/components/icons/lucide"
import { Badge } from "@/components/ui/badge"

type CdmExcelImportProps = {
  setValue: UseFormSetValue<CdmPrice>
  setSelectedClient: (client: string) => void
}

type ParsedCdmData = {
  metadata: {
    effectiveDate: string
    exchangeRate: number
    userId: string
    username: string
  }
  carcassGrades: {
    commercial: { collected_usd: number; delivered_usd: number; collected_zig: number; delivered_zig: number }
    economy: { collected_usd: number; delivered_usd: number; collected_zig: number; delivered_zig: number }
    manufacturing: { collected_usd: number; delivered_usd: number; collected_zig: number; delivered_zig: number }
  }
  liveweight: {
    weight_range: string
    teeth: string
    delivered_usd: number
    delivered_zig: number
    grade_note: string
  }[]
  notes: string[]
  errors: string[]
  warnings: string[]
}

const WEIGHT_RANGES = ["300+", "260-299", "180-259", "160-180"]
const TEETH_CATEGORIES = ["MT", "2T", "4T", "6T"]

export function CdmExcelImport({ setValue, setSelectedClient }: CdmExcelImportProps) {
  const [open, setOpen] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedCdmData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const parseExcelFile = async (file: File): Promise<ParsedCdmData> => {
    // @ts-ignore - xlsx will be installed separately
    const XLSX = await import("xlsx")

    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: "binary" })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]

          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            raw: false,
            defval: ""
          }) as string[][]

          // Extract metadata from rows 2-5 (indices 2-5)
          const metadata = {
            effectiveDate: jsonData[2]?.[1]?.toString().trim() || "",
            exchangeRate: parseFloat(jsonData[3]?.[1] || "35"),
            username: jsonData[4]?.[1]?.toString().trim() || "",
            userId: jsonData[5]?.[1]?.toString().trim() || "",
          }

          const result: ParsedCdmData = {
            metadata,
            carcassGrades: {
              commercial: { collected_usd: 0, delivered_usd: 0, collected_zig: 0, delivered_zig: 0 },
              economy: { collected_usd: 0, delivered_usd: 0, collected_zig: 0, delivered_zig: 0 },
              manufacturing: { collected_usd: 0, delivered_usd: 0, collected_zig: 0, delivered_zig: 0 },
            },
            liveweight: [],
            notes: [],
            errors: [],
            warnings: [],
          }

          // Parse data rows starting from row 9 (index 8)
          for (let i = 8; i < jsonData.length; i++) {
            const row = jsonData[i]
            if (!row || row.every(cell => !cell || cell.toString().trim() === "")) continue

            // Check for note rows
            if (row[0]?.toString().toLowerCase().trim() === "note:") {
              const noteText = row[1]?.toString().trim()
              if (noteText) result.notes.push(noteText)
              continue
            }

            const category = row[0]?.toString().trim()
            const grade = row[1]?.toString().trim()
            const gradeCode = row[2]?.toString().trim() || ""
            const collectedUsd = parseFloat(row[3]?.toString().trim() || "0") || 0
            const deliveredUsd = parseFloat(row[4]?.toString().trim() || "0") || 0
            const collectedZig = parseFloat(row[5]?.toString().trim() || "0") || 0
            const deliveredZig = parseFloat(row[6]?.toString().trim() || "0") || 0
            const notes = row[7]?.toString().trim() || ""

            if (!category || !grade) continue

            if (category === "CATTLE") {
              // Carcass grades
              const gradeLower = grade.toLowerCase()
              if (gradeLower.includes("commercial")) {
                result.carcassGrades.commercial = { collected_usd: collectedUsd, delivered_usd: deliveredUsd, collected_zig: collectedZig, delivered_zig: deliveredZig }
              } else if (gradeLower.includes("economy")) {
                result.carcassGrades.economy = { collected_usd: collectedUsd, delivered_usd: deliveredUsd, collected_zig: collectedZig, delivered_zig: deliveredZig }
              } else if (gradeLower.includes("manufacturing")) {
                result.carcassGrades.manufacturing = { collected_usd: collectedUsd, delivered_usd: deliveredUsd, collected_zig: collectedZig, delivered_zig: deliveredZig }
              }
            } else if (category === "CATTLE LWT") {
              // Liveweight entries - extract weight range from grade name
              let weightRange = ""
              for (const range of WEIGHT_RANGES) {
                if (grade.startsWith(range)) {
                  weightRange = range
                  break
                }
              }

              if (weightRange && TEETH_CATEGORIES.includes(gradeCode)) {
                // Some 6T entries have prices in the notes column (e.g. "6 Teeth - 1.5" means $1.50 USD)
                let finalDeliveredUsd = deliveredUsd
                let finalDeliveredZig = deliveredZig
                let finalNote = notes

                if (!finalDeliveredUsd && notes) {
                  const priceMatch = notes.match(/(\d+(?:\.\d+)?)$/)
                  if (priceMatch) {
                    finalDeliveredUsd = parseFloat(priceMatch[1])
                    finalNote = ""
                  }
                }

                result.liveweight.push({
                  weight_range: weightRange,
                  teeth: gradeCode,
                  delivered_usd: finalDeliveredUsd,
                  delivered_zig: finalDeliveredZig,
                  grade_note: finalNote,
                })
              }
            }
          }

          // Validation
          const hasAnyCarcassPrice = Object.values(result.carcassGrades).some(
            g => g.collected_usd > 0 || g.delivered_usd > 0
          )
          if (!hasAnyCarcassPrice) {
            result.warnings.push("No carcass grade prices found")
          }
          if (result.liveweight.length === 0) {
            result.warnings.push("No liveweight entries found")
          }

          resolve(result)
        } catch (error) {
          reject(new Error(`Failed to parse Excel file: ${error}`))
        }
      }

      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsBinaryString(file)
    })
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setIsLoading(true)
    try {
      const file = acceptedFiles[0]
      const data = await parseExcelFile(file)
      setParsedData(data)
    } catch (error) {
      setParsedData({
        metadata: { effectiveDate: "", exchangeRate: 35, userId: "", username: "" },
        carcassGrades: {
          commercial: { collected_usd: 0, delivered_usd: 0, collected_zig: 0, delivered_zig: 0 },
          economy: { collected_usd: 0, delivered_usd: 0, collected_zig: 0, delivered_zig: 0 },
          manufacturing: { collected_usd: 0, delivered_usd: 0, collected_zig: 0, delivered_zig: 0 },
        },
        liveweight: [],
        errors: [error instanceof Error ? error.message : "Unknown error occurred"],
        warnings: [],
        notes: [],
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
  })

  const applyParsedData = async () => {
    if (!parsedData || parsedData.errors.length > 0) return

    setIsLoading(true)

    try {
      // Search for client by username
      if (parsedData.metadata.username) {
        try {
          const clientResponse = await queryUsers({ search: parsedData.metadata.username })
          const users = clientResponse.data.data as ApplicationUser[] | null

          if (users && Array.isArray(users)) {
            const match = users.find((user: ApplicationUser) =>
              user.name.toLowerCase().includes(parsedData.metadata.username.toLowerCase())
            )

            if (match) {
              setValue("client_id", match.id)
              setValue("client_name", match.name)
              setValue("verified", match.verified)
              setSelectedClient(match.name)
            }
          }
        } catch (error) {
          console.error("Error searching for client:", error)
        }
      }

      // Set effective date
      if (parsedData.metadata.effectiveDate) {
        setValue("effectiveDate", new Date(parsedData.metadata.effectiveDate) as any)
      }

      // Set exchange rate
      if (parsedData.metadata.exchangeRate) {
        setValue("exchange_rate", parsedData.metadata.exchangeRate)
      }

      // Set carcass grades
      setValue("carcass_grades.commercial", parsedData.carcassGrades.commercial)
      setValue("carcass_grades.economy", parsedData.carcassGrades.economy)
      setValue("carcass_grades.manufacturing", parsedData.carcassGrades.manufacturing)

      // Build full 16-entry liveweight array (4 weight ranges × 4 teeth categories)
      const liveweightArray = WEIGHT_RANGES.flatMap((range) =>
        TEETH_CATEGORIES.map((teeth) => {
          const match = parsedData.liveweight.find(
            (lw) => lw.weight_range === range && lw.teeth === teeth
          )
          return {
            weight_range: range,
            teeth,
            delivered_usd: match?.delivered_usd || 0,
            delivered_zig: match?.delivered_zig || 0,
            grade_note: match?.grade_note || "",
          }
        })
      )
      setValue("liveweight", liveweightArray)

      // Set notes
      if (parsedData.notes.length > 0) {
        setValue("notes", parsedData.notes)
      }

      setOpen(false)
      setParsedData(null)
    } catch (error) {
      console.error("Error applying parsed data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2">
          <Icons.fileSpreadsheet className="size-4" />
          Import from Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Import CDM Price List from Excel</DialogTitle>
          <DialogDescription>
            Upload an Excel file (.xlsx) containing Cold Dress Mass pricing data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!parsedData ? (
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
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Parsing Excel file...</p>
                ) : isDragActive ? (
                  <p className="text-sm text-muted-foreground">Drop the file here</p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Drag & drop a CDM Excel file here, or click to select
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: .xlsx, .xls
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <div className="space-y-4">
                {/* Errors */}
                {parsedData.errors.length > 0 && (
                  <Alert variant="destructive">
                    <Icons.alertCircle className="size-4" />
                    <AlertTitle>Errors Found</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-4 space-y-1">
                        {parsedData.errors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Warnings */}
                {parsedData.warnings.length > 0 && (
                  <Alert>
                    <Icons.alertTriangle className="size-4" />
                    <AlertTitle>Warnings</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-4 space-y-1">
                        {parsedData.warnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Preview */}
                {parsedData.errors.length === 0 && (
                  <div className="space-y-4">
                    {/* Metadata */}
                    <div className="rounded-lg border p-3 bg-gray-50">
                      <h4 className="font-medium mb-2 text-sm">Excel Metadata</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Effective Date:</span>{" "}
                          <span className="font-medium">{parsedData.metadata.effectiveDate || "Not set"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Exchange Rate:</span>{" "}
                          <span className="font-medium">{parsedData.metadata.exchangeRate} ZIG</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Client:</span>{" "}
                          <span className="font-medium">{parsedData.metadata.username || "Not set"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">User ID:</span>{" "}
                          <span className="font-medium">{parsedData.metadata.userId || "Not set"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Carcass Grades Preview */}
                    <Card>
                      <CardHeader className="py-3 bg-gray-50">
                        <CardTitle className="text-sm">Carcass Grades (per kg)</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b">
                              <th className="py-1 text-left">Grade</th>
                              <th className="py-1 text-right">Col. USD</th>
                              <th className="py-1 text-right">Del. USD</th>
                              <th className="py-1 text-right">Col. ZIG</th>
                              <th className="py-1 text-right">Del. ZIG</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(["commercial", "economy", "manufacturing"] as const).map((grade) => {
                              const data = parsedData.carcassGrades[grade]
                              return (
                                <tr key={grade} className="border-b">
                                  <td className="py-1 font-medium capitalize">{grade}</td>
                                  <td className="py-1 text-right">${data.collected_usd.toFixed(2)}</td>
                                  <td className="py-1 text-right">${data.delivered_usd.toFixed(2)}</td>
                                  <td className="py-1 text-right">{data.collected_zig.toFixed(2)}</td>
                                  <td className="py-1 text-right">{data.delivered_zig.toFixed(2)}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>

                    {/* Liveweight Preview */}
                    <Card>
                      <CardHeader className="py-3 bg-gray-50">
                        <CardTitle className="text-sm">Liveweight Entries ({parsedData.liveweight.length})</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b">
                              <th className="py-1 text-left">Weight</th>
                              <th className="py-1 text-left">Teeth</th>
                              <th className="py-1 text-right">Del. USD</th>
                              <th className="py-1 text-right">Del. ZIG</th>
                              <th className="py-1 text-left">Note</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parsedData.liveweight.map((lw, i) => (
                              <tr key={i} className="border-b">
                                <td className="py-1">{lw.weight_range}</td>
                                <td className="py-1">
                                  <Badge variant="secondary" className="text-[10px] px-1 py-0">{lw.teeth}</Badge>
                                </td>
                                <td className="py-1 text-right">{lw.delivered_usd ? `$${lw.delivered_usd.toFixed(2)}` : "-"}</td>
                                <td className="py-1 text-right">{lw.delivered_zig ? lw.delivered_zig.toFixed(2) : "-"}</td>
                                <td className="py-1 text-muted-foreground truncate max-w-[150px]">{lw.grade_note || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>

                    {/* Notes Preview */}
                    {parsedData.notes.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-sm">Notes ({parsedData.notes.length})</h4>
                        <div className="space-y-1">
                          {parsedData.notes.map((note, i) => (
                            <Alert key={i}>
                              <Icons.info className="size-4" />
                              <AlertDescription className="text-xs">{note}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            {parsedData && (
              <Button type="button" variant="outline" onClick={() => setParsedData(null)}>
                Upload Different File
              </Button>
            )}
            {parsedData && parsedData.errors.length === 0 && (
              <Button type="button" onClick={applyParsedData} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Icons.loader className="size-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Icons.check className="size-4 mr-2" />
                    Apply to Form
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
