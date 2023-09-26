"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"

import { queryUserProductPriceListAsAdmin } from "@/lib/query"
import { ProducerPriceList } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons/lucide"
import { Placeholder } from "@/components/state/placeholder"
import { AdminEditProductPriceForm } from "@/components/structures/forms/adminEditPriceList"

interface EditProductListPriceProps {
  params: {
    slug: string
  }
}

export default function EditProductListPrice({
  params,
}: EditProductListPriceProps) {
  const clientID = params.slug
  const url = `/dashboard/prices`

  const { isError, isLoading, isFetching, refetch, data, isSuccess } = useQuery(
    {
      queryKey: ["dashboard-admin-client-price", clientID],
      queryFn: () => queryUserProductPriceListAsAdmin(clientID),
    }
  )

  if (isLoading || isFetching) {
    return (
      <div className="mt-20">
        <Placeholder>
          <Placeholder.Icon name="search" />
          <Placeholder.Title>Fetching Producer Price</Placeholder.Title>
          <Placeholder.Description>fetching</Placeholder.Description>
        </Placeholder>
      </div>
    )
  }

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
          <Placeholder.Title>Error Producer Price</Placeholder.Title>
          <Placeholder.Description>
            failed to fetch price
          </Placeholder.Description>
        </Placeholder>
      </div>
    )
  }

  const producerPriceList = data?.data as ProducerPriceList

  return (
    <>
      <div className={"absolute right-10 top-96"}>
        <Link href={url} className={cn(buttonVariants({ variant: "link" }))}>
          <>
            <Icons.close className="mr-2 h-4 w-4" />
            Close
          </>
        </Link>
      </div>

      {isSuccess ? (
        <AdminEditProductPriceForm priceList={producerPriceList} />
      ) : null}
    </>
  )
}
