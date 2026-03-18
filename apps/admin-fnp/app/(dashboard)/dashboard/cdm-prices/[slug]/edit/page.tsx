"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"

import { queryCdmPrice } from "@/lib/query"
import { CdmPrice } from "@/lib/schemas"
import { Placeholder } from "@/components/state/placeholder"
import { CdmPriceForm } from "@/components/structures/forms/cdmPriceForm"

export default function EditCdmPricePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const priceId = slug

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cdm-price", priceId],
    queryFn: () => queryCdmPrice(priceId),
  })

  const price = data?.data as CdmPrice

  if (isLoading) {
    return (
      <Placeholder>
        <Placeholder.Title>Loading CDM Price...</Placeholder.Title>
      </Placeholder>
    )
  }

  if (isError || !price) {
    return (
      <Placeholder>
        <Placeholder.Icon name="close" />
        <Placeholder.Title>Error Loading CDM Price</Placeholder.Title>
        <Placeholder.Description>
          Could not load the CDM price. It may have been deleted.
        </Placeholder.Description>
      </Placeholder>
    )
  }

  return <CdmPriceForm price={price} mode="edit" />
}
