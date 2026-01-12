"use client"

import { use } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"

import { queryAgroChemical } from "@/lib/query"
import { AgroChemicalItem } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons/lucide"
import { Placeholder } from "@/components/state/placeholder"
import { EditAgroChemicalForm } from "@/components/structures/forms/productEdit"

interface EditProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function EditAgroChemicalPage({ params }: EditProductPageProps) {
  const { slug } = use(params)
  const id = slug
  const url = `/dashboard/agrochemicals/${id}`

  const { isError, isLoading, isFetching, refetch, data } = useQuery({
    queryKey: ["dashboard-product", id],
    queryFn: () => queryAgroChemical(id),
    refetchOnWindowFocus: false
  })

  const product = data?.data as AgroChemicalItem

  if (isError) {
    if (isAxiosError(data)) {
      switch (data.code) {
        case "ERR_NETWORK":
          toast({
            description: "There seems to be a network error.",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          })
          break

        default:
          toast({
            title: "Uh oh! Failed to fetch clients.",
            description: "There was a problem with your request.",
            action: (
              <ToastAction altText="Try again" onClick={() => refetch()}>
                Try again
              </ToastAction>
            ),
          })
          break
      }
    }
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

      {product !== undefined ? <EditAgroChemicalForm product={product} /> : null}
    </>
  )
}
