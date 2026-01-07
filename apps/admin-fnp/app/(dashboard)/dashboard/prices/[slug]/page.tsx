"use client"

import { use } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"

import { queryPriceList } from "@/lib/query"
import { ProducerPriceList } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons/lucide"
import { Placeholder } from "@/components/state/placeholder"
import { PriceListTableView } from "@/components/structures/tables/priceListTableView"

interface ViewClientProductListPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function ViewClientProductListPage({
  params,
}: ViewClientProductListPageProps) {
  const { slug } = use(params)
  const clientID = slug

  const { isError, isLoading, isFetching, refetch, data } = useQuery({
    queryKey: ["dashboard-client-price", clientID],
    queryFn: () => queryPriceList(clientID),
  })

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
            title: "Uh oh! Failed to fetch client price.",
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
          <Placeholder.Title>
            Error Fetching Product List Price
          </Placeholder.Title>
          <Placeholder.Description>Error Fetching</Placeholder.Description>
        </Placeholder>
      </div>
    )
  }

  if (isLoading || isFetching) {
    return (
      <div className="mt-20">
        <Placeholder>
          <Placeholder.Icon name="search" />
          <Placeholder.Title>Is Fetching Producer Price</Placeholder.Title>
          <Placeholder.Description>fetching</Placeholder.Description>
        </Placeholder>
      </div>
    )
  }

  const producerPriceList = data?.data as ProducerPriceList
  const url = `/dashboard/prices`
  const editUrl = `/dashboard/prices/${clientID}/edit`

  return (
    <>
      <div className={"absolute right-10 top-20 flex gap-2"}>
        <Link href={editUrl} className={cn(buttonVariants({ variant: "default" }))}>
          <>
            <Icons.edit className="mr-2 size-4" />
            Edit
          </>
        </Link>
        <Link href={url} className={cn(buttonVariants({ variant: "outline" }))}>
          <>
            <Icons.close className="mr-2 size-4" />
            Close
          </>
        </Link>
      </div>
      <section className="flex min-h-full flex-col p-8">
        <PriceListTableView producerPriceList={producerPriceList} />
      </section>
    </>
  )
}
