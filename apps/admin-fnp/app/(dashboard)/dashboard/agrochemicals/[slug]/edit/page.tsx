"use client"

import { use, useEffect, useRef } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"

import { queryAgroChemical } from "@/lib/query"
import { AgroChemicalItem } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { Placeholder } from "@/components/state/placeholder"
import { AgroChemicalForm } from "@/components/structures/forms/agroChemicalForm"
import { handleFetchError } from "@/lib/error-handler"

interface EditProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function EditAgroChemicalPage({ params }: EditProductPageProps) {
  const { slug } = use(params)
  const id = slug
  const url = `/dashboard/agrochemicals/${id}`

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["dashboard-product", id],
    queryFn: () => queryAgroChemical(id),
    refetchOnWindowFocus: false,
  })

  const agroChemical = data?.data as AgroChemicalItem

  // Show error toast only once when error occurs
  const hasShownError = useRef(false)
  useEffect(() => {
    if (isError && !hasShownError.current) {
      hasShownError.current = true
      handleFetchError(error, {
        onRetry: () => {
          hasShownError.current = false
          refetch()
        },
        context: "agrochemical"
      })
    }
    if (!isError) {
      hasShownError.current = false
    }
  }, [isError, error, refetch])

  if (isError) {
    return (
      <div className="mt-20">
        <Placeholder>
          <Placeholder.Icon name="close" />
          <Placeholder.Title>Error Fetching AgroChemical</Placeholder.Title>
          <Placeholder.Description>
            Error Fetching agrochemical from the database
          </Placeholder.Description>
        </Placeholder>
      </div>
    )
  }

  if (isLoading || isFetching) {
    return (
      <div className="mt-20">
        <Placeholder>
          <Placeholder.Icon name="search" />
          <Placeholder.Title>Fetching AgroChemical</Placeholder.Title>
          <Placeholder.Description>
            Fetching agrochemical from the database
          </Placeholder.Description>
        </Placeholder>
      </div>
    )
  }

  return (
    <>
      <div className={"absolute right-10 top-8"}>
        <Link href={url} className={cn(buttonVariants({ variant: "link" }))}>
          <>
            <Icons.close className="w-4 h-4 mr-2" />
            Close
          </>
        </Link>
      </div>

      {agroChemical !== undefined ? <AgroChemicalForm agroChemical={agroChemical} mode="edit" /> : null}
    </>
  )
}
