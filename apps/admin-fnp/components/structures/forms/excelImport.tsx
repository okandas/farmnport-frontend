"use client"

import { useState, useCallback } from "react"
import { UseFormSetValue } from "react-hook-form"
import { useDropzone } from "react-dropzone"
import { ProducerPriceList, FarmProduce, ApplicationUser } from "@/lib/schemas"
import { queryFarmProduce, queryUsers } from "@/lib/query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { cn, dollarsToCents } from "@/lib/utilities"

type ExcelImportProps = {
  setValue: UseFormSetValue<ProducerPriceList>
  setSelectedFarmProduce: (produce: string[]) => void
  setSelectedClient: (client: string) => void
}

type ParsedData = {
  metadata: {
    effectiveDate: string
    exchangeRate: number
    userId: string
    username: string
  }
  livestock: string[]
  prices: Record<string, {
    id?: string
    grades: Record<string, {
      delivered: number | null
      collected: number | null
      deliveredZig: number | null
      collectedZig: number | null
      gradeCode: string
      notes: string
      farmProduceId?: string
    }>
  }>
  notes: string[]
  errors: string[]
  warnings: string[]
}

export function ExcelImport({ setValue, setSelectedFarmProduce, setSelectedClient }: ExcelImportProps) {
  const [open, setOpen] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const parseExcelFile = async (file: File): Promise<ParsedData> => {
    // @ts-ignore - xlsx will be installed separately
    const XLSX = await import("xlsx")

    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: "binary" })

          // Parse the first sheet
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]

          // Convert to 2D array with headers
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            raw: false,
            defval: ""
          }) as string[][]

          console.log("🔍 Raw Excel Data:", jsonData)

          // Extract metadata from rows 1-6 (indices 0-5)
          const metadata = {
            effectiveDate: jsonData[2]?.[1]?.toString().trim() || "",
            exchangeRate: parseFloat(jsonData[3]?.[1] || "35"),
            username: jsonData[4]?.[1]?.toString().trim() || "", // Row 5: Client name (e.g., "Surrey Group")
            userId: jsonData[5]?.[1]?.toString().trim() || "", // Row 6: Client ID/slug (e.g., "surrey-group")
          }

          console.log("📋 Metadata:", metadata)

          const result: ParsedData = {
            metadata,
            livestock: [],
            prices: {},
            notes: [],
            errors: [],
            warnings: [],
          }

          // Row 8 (index 7) contains headers
          const headers = jsonData[7]
          console.log("📑 Headers:", headers)

          // Parse data rows starting from row 9 (index 8)
          let currentCategory = ""

          for (let i = 8; i < jsonData.length; i++) {
            const row = jsonData[i]

            // Skip empty rows
            if (!row || row.every(cell => !cell || cell.toString().trim() === "")) continue

            // Check if this is a note row
            if (row[0]?.toString().toLowerCase().trim() === "note:") {
              const noteText = row[1]?.toString().trim()
              if (noteText) {
                result.notes.push(noteText)
                console.log(`📝 Note at row ${i + 1}:`, noteText)
              }
              continue
            }

            // Column indices based on simplified template:
            // 0: Category, 1: Grade, 2: Grade Code, 3: Collected USD,
            // 4: Delivered USD, 5: Collected ZIG, 6: Delivered ZIG, 7: Notes
            const category = row[0]?.toString().trim()
            const grade = row[1]?.toString().trim()
            const gradeCode = row[2]?.toString().trim() || ""
            const collectedUsd = row[3]?.toString().trim()
            const deliveredUsd = row[4]?.toString().trim()
            const collectedZig = row[5]?.toString().trim()
            const deliveredZig = row[6]?.toString().trim()
            const notes = row[7]?.toString().trim() || ""

            // Skip if no category or grade
            if (!category || !grade) continue

            // Update current category
            if (category) {
              // Normalize category name - map "SERVICE SLAUGHTER" to "slaughter"
              currentCategory = category.toLowerCase()
              if (currentCategory === "service slaughter") {
                currentCategory = "slaughter"
              }

              // Add to livestock list using display name
              const displayCategory = currentCategory === "slaughter" ? "Slaughter" : category.toUpperCase()
              if (!result.livestock.includes(displayCategory)) {
                result.livestock.push(displayCategory)
              }

              if (!result.prices[currentCategory]) {
                result.prices[currentCategory] = { grades: {} }
              }
            }

            // Normalize grade key
            const gradeKey = grade
              .toLowerCase()
              .replace(/\s+/g, "_")
              .replace(/[()/.,-]/g, "_")
              .replace(/_+/g, "_")
              .replace(/^_|_$/g, "")

            // Map grade to schema field names
            const gradeMapping: Record<string, string> = {
              "super": "super",
              "super_premium": "super_premium",
              "choice": "choice",
              "commercial": "commercial",
              "economy": "economy",
              "manufacturing": "manufacturing",
              "condemned": "condemned",
              "detained": "detained",
              "standard": "standard",
              "ordinary": "ordinary",
              "inferior": "inferior",
              // Chicken grades - handle multiple variations
              "a_grade_1_55_1_75kg_average_liveweight": "a_grade_1_55_1_75",
              "a_grade_1_55_1_75kg": "a_grade_1_55_1_75",
              "a_grade_over_1_75_kg_average_liveweight": "a_grade_over_1_75",
              "a_grade_over_1_75kg": "a_grade_over_1_75",
              "a_grade_under_1_55kg_average_liveweight": "a_grade_under_1_55",
              "a_grade_under_1_55kg": "a_grade_under_1_55",
              "off_layers": "off_layers",
              "head": "head",
              // Slaughter services
              "cattle": "cattle",
              "sheep": "sheep",
              "pigs": "pigs",
              "chicken_per_kg_lwt": "chicken",
            }

            const mappedGrade = gradeMapping[gradeKey] || gradeKey

            // Log chicken grades specifically for debugging
            if (currentCategory === "chicken") {
              console.log(`🐔 Chicken grade: "${grade}" -> normalized: "${gradeKey}" -> mapped: "${mappedGrade}"`)
            }

            // Parse prices (convert to numbers, handle empty strings)
            const parsedCollectedUsd = collectedUsd ? parseFloat(collectedUsd) : null
            const parsedDeliveredUsd = deliveredUsd ? parseFloat(deliveredUsd) : null
            const parsedCollectedZig = collectedZig ? parseFloat(collectedZig) : null
            const parsedDeliveredZig = deliveredZig ? parseFloat(deliveredZig) : null

            result.prices[currentCategory].grades[mappedGrade] = {
              delivered: parsedDeliveredUsd && !isNaN(parsedDeliveredUsd) ? parsedDeliveredUsd : null,
              collected: parsedCollectedUsd && !isNaN(parsedCollectedUsd) ? parsedCollectedUsd : null,
              deliveredZig: parsedDeliveredZig && !isNaN(parsedDeliveredZig) ? parsedDeliveredZig : null,
              collectedZig: parsedCollectedZig && !isNaN(parsedCollectedZig) ? parsedCollectedZig : null,
              gradeCode,
              notes,
            }

            console.log(`✅ Parsed ${currentCategory} - ${grade}:`, result.prices[currentCategory].grades[mappedGrade])
          }

          // Log complete parsed structure
          console.log("🎯 Complete Parsed Data:", JSON.stringify({
            metadata,
            livestock: result.livestock,
            prices: result.prices,
          }, null, 2))

          // Validation
          if (result.livestock.length === 0) {
            result.errors.push("No livestock categories found in the Excel file")
          }

          if (Object.keys(result.prices).length === 0) {
            result.errors.push("No price data found in the Excel file")
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
        metadata: {
          effectiveDate: "",
          exchangeRate: 35,
          userId: "",
          username: "",
        },
        livestock: [],
        prices: {},
        errors: [error instanceof Error ? error.message : "Unknown error occurred"],
        warnings: [],
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
      // Search for client by username (which contains the client name like "Surrey Group")
      if (parsedData.metadata.username) {
        console.log("🔍 Searching for client with name:", parsedData.metadata.username)
        try {
          const clientResponse = await queryUsers({ search: parsedData.metadata.username })
          console.log("🔍 Client API response:", clientResponse)
          const users = clientResponse.data.data as ApplicationUser[] | null

          if (users && Array.isArray(users)) {
            console.log(`🔍 Found ${users.length} users:`, users.map(u => u.name))
            const match = users.find((user: ApplicationUser) =>
              user.name.toLowerCase().includes(parsedData.metadata.username.toLowerCase())
            )

            if (match) {
              console.log(`✅ Found matching client: ${match.name} (ID: ${match.id})`)
              setValue("client_id", match.id)
              setValue("client_name", match.name)
              setValue("client_specialization", match.specialization || "livestock")
              setSelectedClient(match.name)
              console.log(`✅ Called setSelectedClient with: "${match.name}"`)
            } else {
              console.log(`⚠️ No client match found. Searching for: "${parsedData.metadata.username}"`)
              console.log(`⚠️ Available users:`, users.map(u => ({ name: u.name, id: u.id })))
            }
          } else {
            console.log("⚠️ No users array returned from API. Response data:", clientResponse.data)
          }
        } catch (error) {
          console.error("❌ Error searching for client:", error)
        }
      } else {
        console.log("⚠️ No username in metadata to search for client")
      }

      // Set effective date if provided
      if (parsedData.metadata.effectiveDate) {
        console.log("📅 Setting effective date:", parsedData.metadata.effectiveDate)
        setValue("effectiveDate", new Date(parsedData.metadata.effectiveDate))
      }

      // Fetch farm produce IDs for each category
      console.log("🔍 Fetching farm produce IDs for categories:", parsedData.livestock)

      // Build list of all items to fetch (including slaughter services if present)
      const itemsToFetch: Array<{ name: string; category: string; service?: string }> = []

      parsedData.livestock.forEach((livestock) => {
        if (livestock.toLowerCase() === "slaughter") {
          // For slaughter, fetch each service type
          const slaughterServices = parsedData.prices.slaughter?.grades
            ? Object.keys(parsedData.prices.slaughter.grades)
            : []

          slaughterServices.forEach((serviceName) => {
            // Map slaughter service names to their corresponding farm produce categories
            const serviceToProduceMapping: Record<string, string> = {
              cattle: "Beef",
              sheep: "Mutton",
              pigs: "Pork",
              chicken: "Chickens (Broilers)"
            }

            const searchTerm = serviceToProduceMapping[serviceName] || serviceName
            itemsToFetch.push({
              name: searchTerm,
              category: "slaughter",
              service: serviceName
            })
          })
        } else {
          // For regular categories, map to specific farm produce names
          const categoryToProduceMapping: Record<string, string> = {
            "chicken": "Chickens (Broilers)",
          }

          const searchTerm = categoryToProduceMapping[livestock.toLowerCase()] || livestock

          itemsToFetch.push({
            name: searchTerm,
            category: livestock.toLowerCase()
          })
        }
      })

      console.log("🔍 Items to fetch:", itemsToFetch)

      const categoryIdPromises = itemsToFetch.map(async ({ name, category, service }) => {
        const response = await queryFarmProduce({ search: name })
        const farmProduceItems = response.data?.data as FarmProduce[] | null

        // Check if data exists
        if (!farmProduceItems || !Array.isArray(farmProduceItems)) {
          console.log(`📋 ${name}: No data returned from API`)
          return {
            category,
            service,
            id: null
          }
        }

        // Find matching farm produce by name
        const match = farmProduceItems.find((item: FarmProduce) =>
          item.name.toLowerCase() === name.toLowerCase() ||
          item.name.toLowerCase().includes(name.toLowerCase())
        )

        console.log(`📋 ${name}:`, match ? `ID = ${match.id}` : "No match found")

        return {
          category,
          service,
          id: match?.id || null
        }
      })

      const categoryIds = await Promise.all(categoryIdPromises)

      // Attach farm produce IDs to parsed data structure
      console.log("📝 Attaching farm produce IDs to price data...")
      categoryIds.forEach(({ category, service, id }) => {
        if (service) {
          // This is a slaughter service - attach ID to the specific service grade
          if (id && parsedData.prices[category]?.grades?.[service]) {
            parsedData.prices[category].grades[service].farmProduceId = id
            console.log(`✅ Attached ID "${id}" to ${category}.${service}`)
          } else if (!id) {
            console.log(`⚠️ No ID found for ${category} service "${service}"`)
          }
        } else {
          // Regular category - attach ID at category level
          if (id && parsedData.prices[category]) {
            parsedData.prices[category].id = id
            console.log(`✅ Attached ID "${id}" to prices["${category}"].id`)
          } else if (!id) {
            console.log(`⚠️ No ID found for category "${category}", skipping ID attachment`)
          }
        }
      })

      console.log("🎯 Final data structure with IDs attached:")
      console.log(JSON.stringify(parsedData.prices, null, 2))

      // Set selected farm produce
      const formattedLivestock = parsedData.livestock.map(l =>
        l.charAt(0).toUpperCase() + l.slice(1).toLowerCase()
      )
      setSelectedFarmProduce(formattedLivestock)
      console.log(`✅ Set selected farm produce to:`, formattedLivestock)

      // Apply prices to form
      Object.entries(parsedData.prices).forEach(([category, categoryData]) => {
        // Special handling for slaughter - each service has its own farm_produce_id
        // We'll handle farm_produce_id per service within the grade loop below

        // For non-slaughter categories, set farm_produce_id at category level
        if (category !== "slaughter" && categoryData.id) {
          setValue(`${category}.farm_produce_id` as any, categoryData.id)
          console.log(`✅ Set ${category}.farm_produce_id = ${categoryData.id}`)
        } else if (category !== "slaughter") {
          console.log(`⚠️ No farm_produce_id for ${category}`)
        }

        // Enable hasPrice flag for this category (required for validation)
        setValue(`${category}.hasPrice` as any, true)
        console.log(`✅ Set ${category}.hasPrice = true`)

        // Check if any grade has collected price
        const hasAnyCollectedPrice = Object.values(categoryData.grades).some(
          prices => prices.collected !== null && prices.collected !== undefined
        )

        // Set hasCollectedPrice checkbox if there are collected prices
        if (hasAnyCollectedPrice) {
          setValue(`${category}.hasCollectedPrice` as any, true)
          console.log(`✅ Enabled ${category} collected price checkbox`)
        }

        // Apply individual grade prices
        Object.entries(categoryData.grades).forEach(([grade, prices]) => {
          const { delivered, collected, gradeCode } = prices

          // Extra logging for chicken to debug
          if (category === "chicken") {
            console.log(`🐔 Processing chicken grade "${grade}":`, { delivered, collected })
            console.log(`🐔 Will set: chicken.${grade}.pricing.delivered`)
          }

          // For slaughter, each service needs farm_produce_id set individually
          if (category === "slaughter") {
            // Set farm_produce_id if available (fetched earlier)
            if (prices.farmProduceId) {
              setValue(`${category}.${grade}.farm_produce_id` as any, prices.farmProduceId)
              console.log(`✅ Set ${category}.${grade}.farm_produce_id = ${prices.farmProduceId}`)
            } else {
              console.log(`⚠️ No farm_produce_id for ${category} service "${grade}"`)
            }
          }

          // Set delivered price
          if (delivered !== null && delivered !== undefined) {
            setValue(`${category}.${grade}.pricing.delivered` as any, delivered)
            console.log(`✅ Set ${category}.${grade}.pricing.delivered = ${delivered}`)
          }

          // Set collected price if exists
          if (collected !== null && collected !== undefined) {
            setValue(`${category}.${grade}.pricing.collected` as any, collected)
            console.log(`✅ Set ${category}.${grade}.pricing.collected = ${collected}`)
          }
        })
      })

      // Set notes on the form
      if (parsedData.notes && parsedData.notes.length > 0) {
        setValue("notes", parsedData.notes)
        console.log(`✅ Set notes array with ${parsedData.notes.length} items`)
      }

      setOpen(false)
      setParsedData(null)
    } catch (error) {
      console.error("❌ Error fetching farm produce IDs:", error)
      setParsedData({
        ...parsedData,
        errors: [...parsedData.errors, "Failed to fetch farm produce IDs from backend"],
      })
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
          <DialogTitle>Import Price List from Excel</DialogTitle>
          <DialogDescription>
            Upload an Excel file (.xlsx or .xls) containing producer price list data
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
                      Drag & drop an Excel file here, or click to select
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
                    {/* Metadata Section */}
                    <div className="rounded-lg border p-3 bg-gray-50">
                      <h4 className="font-medium mb-2 text-sm">Excel Metadata</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Effective Date:</span>{" "}
                          <span className="font-medium">
                            {parsedData.metadata.effectiveDate || "Not set"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Exchange Rate:</span>{" "}
                          <span className="font-medium">
                            {parsedData.metadata.exchangeRate} ZIG
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Username:</span>{" "}
                          <span className="font-medium">
                            {parsedData.metadata.username || "Not set"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">User ID:</span>{" "}
                          <span className="font-medium">
                            {parsedData.metadata.userId || "Not set"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Detected Livestock</h4>
                      <div className="flex flex-wrap gap-2">
                        {parsedData.livestock.map((item) => (
                          <Badge key={item} variant="secondary">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Price Data Preview</h4>
                      <div className="space-y-3">
                        {Object.entries(parsedData.prices).map(([category, categoryData]) => {
                          const statusColors = [
                            "text-green-700 bg-green-50 ring-green-600/20",
                            "text-lime-700 bg-lime-50 ring-lime-600/20",
                            "text-yellow-700 bg-yellow-50 ring-yellow-600/20",
                            "text-amber-700 bg-amber-50 ring-amber-600/20",
                            "text-orange-700 bg-orange-50 ring-orange-600/20",
                            "text-red-700 bg-red-50 ring-red-600/10",
                            "text-stone-600 bg-stone-50 ring-stone-500/10",
                            "text-gray-600 bg-gray-50 ring-gray-500/10",
                          ]

                          return (
                            <Card key={category}>
                              <CardHeader className="py-3 bg-gray-50">
                                <CardTitle className="text-sm uppercase">{category}</CardTitle>
                              </CardHeader>
                              <CardContent className="py-2">
                                <div className="space-y-2 text-xs">
                                  {Object.entries(categoryData.grades).map(([grade, data], index) => (
                                    <div key={grade} className="border-l-2 border-gray-200 pl-3 py-2">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="font-medium text-gray-700">{grade}</span>
                                        {data.gradeCode && (
                                          <div className={cn(
                                            statusColors[index % statusColors.length],
                                            "rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
                                          )}>
                                            {data.gradeCode}
                                          </div>
                                        )}
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        {/* USD Prices */}
                                        <div className="space-y-1">
                                          {data.collected && (
                                            <div className="flex items-center justify-between px-2 py-1 rounded bg-green-50/30">
                                              <span className="text-muted-foreground text-xs">Collected USD:</span>
                                              <span className="font-medium text-gray-900">${data.collected}</span>
                                            </div>
                                          )}
                                          {data.delivered && (
                                            <div className="flex items-center justify-between px-2 py-1 rounded bg-green-50/30">
                                              <span className="text-muted-foreground text-xs">Delivered USD:</span>
                                              <span className="font-medium text-gray-900">${data.delivered}</span>
                                            </div>
                                          )}
                                        </div>
                                        {/* ZIG Prices */}
                                        <div className="space-y-1">
                                          {data.collectedZig && (
                                            <div className="flex items-center justify-between px-2 py-1 rounded bg-blue-50/30">
                                              <span className="text-muted-foreground text-xs">Collected ZIG:</span>
                                              <span className="font-medium text-gray-900">{data.collectedZig}</span>
                                            </div>
                                          )}
                                          {data.deliveredZig && (
                                            <div className="flex items-center justify-between px-2 py-1 rounded bg-blue-50/30">
                                              <span className="text-muted-foreground text-xs">Delivered ZIG:</span>
                                              <span className="font-medium text-gray-900">{data.deliveredZig}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      {data.notes && (
                                        <div className="mt-2 px-2 py-1 text-muted-foreground italic text-xs bg-gray-50 rounded">
                                          {data.notes}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>

                    {/* Notes Section */}
                    {parsedData.notes.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Notes from Excel</h4>
                        <div className="space-y-2">
                          {parsedData.notes.map((note, index) => (
                            <Alert key={index}>
                              <Icons.info className="size-4" />
                              <AlertDescription className="text-xs">
                                {note}
                              </AlertDescription>
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setParsedData(null)}
              >
                Upload Different File
              </Button>
            )}
            {parsedData && parsedData.errors.length === 0 && (
              <Button type="button" onClick={applyParsedData} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Icons.loader className="size-4 mr-2 animate-spin" />
                    Fetching IDs...
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
