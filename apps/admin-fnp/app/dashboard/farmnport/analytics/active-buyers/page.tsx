"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { queryContactViewsStats } from "@/lib/query"
import { FullViewTable } from "../page"

export default function ActiveBuyersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["contact-views-stats"],
    queryFn: () => queryContactViewsStats(),
    refetchOnWindowFocus: false,
  })

  const items = (data?.data?.top_viewers ?? []).filter((v: any) => v.type === "buyer")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/farmnport/analytics" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Analytics
        </Link>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground py-16 text-center">Loading...</p>
      ) : (
        <FullViewTable title="Most Active Buyers" subtitle="Buyers actively sourcing from the platform" items={items} countLabel="Viewed" idKey="user_id" linkPrefix="viewer" />
      )}
    </div>
  )
}
