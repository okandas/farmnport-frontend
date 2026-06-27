"use client"

import { useQuery } from "@tanstack/react-query"
import { querySeriesSummary } from "@/lib/query"
import { ProduceGradeBoard } from "@/components/structures/produce-grade-board"
import { ProduceHeadBoard } from "@/components/structures/produce-head-board"

export function ProduceBoardRouter({
  produce,
  code,
  priceType,
}: {
  produce: string
  code: string
  priceType: string
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["series-summary"],
    queryFn: querySeriesSummary,
    refetchOnWindowFocus: false,
  })

  if (isLoading) return null

  const hasKgData = (data?.data?.data ?? []).some(
    (e: any) => (e.category.charAt(0) + e.category.slice(1).toLowerCase()).toLowerCase() === produce.toLowerCase()
  )

  if (hasKgData) {
    return <ProduceGradeBoard produce={produce} code={code} priceType={priceType} />
  }
  return <ProduceHeadBoard produce={produce} code={code} />
}
