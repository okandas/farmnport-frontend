"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"

import { queryProduct } from "@/lib/query"
import { ProductItem } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons/lucide"
import { Placeholder } from "@/components/state/placeholder"
import { EditForm } from "@/components/structures/forms/productEdit"

interface EditProductPageProps {
  params: {
    slug: string
  }
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const id = params.slug
  const url = `/dashboard/products/${id}`

  const { isError, isLoading, isFetching, refetch, data } = useQuery({
    queryKey: ["dashboard-product", id],
    queryFn: () => queryProduct(id),
  })

  const product = data?.data as ProductItem

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
          <Placeholder.Title>Error Fetching User</Placeholder.Title>
          <Placeholder.Description>
            Error Fetching user from the database
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
          <Placeholder.Title>Fetching Product</Placeholder.Title>
          <Placeholder.Description>
            Fetching product from the database
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

      {product !== undefined ? <EditForm product={product} /> : null}
    </>
  )
}
