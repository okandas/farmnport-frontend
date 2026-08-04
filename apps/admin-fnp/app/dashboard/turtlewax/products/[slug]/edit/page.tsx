"use client"

import { use, useEffect, useRef } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"

import { queryTurtlewaxProduct } from "@/lib/query"
import { TurtlewaxProductItem } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { Placeholder } from "@/components/state/placeholder"
import { FormSkeleton } from "@/components/state/skeleton-table"
import { TurtlewaxProductForm } from "@/components/structures/forms/turtlewaxProductForm"
import { handleFetchError } from "@/lib/error-handler"

interface EditProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function EditTurtlewaxProductPage({ params }: EditProductPageProps) {
  const { slug } = use(params)
  const id = slug
  const url = `/dashboard/turtlewax/products/${id}`

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["dashboard-turtlewax-product", id],
    queryFn: () => queryTurtlewaxProduct(id),
    refetchOnWindowFocus: false,
  })

  const product = data?.data as TurtlewaxProductItem

  const hasShownError = useRef(false)
  useEffect(() => {
    if (isError && !hasShownError.current) {
      hasShownError.current = true
      handleFetchError(error, {
        onRetry: () => {
          hasShownError.current = false
          refetch()
        },
        context: "turtlewax product"
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
          <Placeholder.Title>Error Fetching Turtlewax Product</Placeholder.Title>
          <Placeholder.Description>
            Error fetching turtlewax product from the database
          </Placeholder.Description>
        </Placeholder>
      </div>
    )
  }

  if (isLoading || isFetching) {
    return <FormSkeleton />
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

      {product !== undefined ? <TurtlewaxProductForm product={product} mode="edit" /> : null}
    </>
  )
}
