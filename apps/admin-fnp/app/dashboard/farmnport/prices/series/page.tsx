"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { SeriesImport } from "@/components/structures/forms/seriesImport"
import { PriceSeriesTable } from "@/components/structures/tables/priceSeriesTable"

export default function PriceSeriesPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Livestock Price Series"
        text="Import buyer price submissions from Farmnport CDM or LWT master templates."
      >
        <SeriesImport onImportSuccess={() => setRefreshKey((k) => k + 1)} />
      </DashboardHeader>
      <PriceSeriesTable refreshKey={refreshKey} />
    </DashboardShell>
  )
}
