"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { AxiosError, AxiosResponse, isAxiosError } from "axios"

import { queryUserAsAdmin } from "@/lib/query"
import { ApplicationUser } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons/lucide"
import { Placeholder } from "@/components/state/placeholder"
import { AdminEditForm } from "@/components/structures/forms/adminClientEdit"

interface EditClientPageProps {
  params: {
    slug: string
  }
}

export default function EditClientPage({ params }: EditClientPageProps) {
  const name = params.slug
  const url = `/dashboard/users/${name}`

  const [adminClient, setAdminClient] = useState<ApplicationUser>()

  const { isError, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["dashboard-admin-client", name],
    queryFn: () => queryUserAsAdmin(name),
    onSuccess(data: AxiosResponse) {
      setAdminClient(data?.data)
    },
    onError(error: AxiosError) {
      if (isAxiosError(error)) {
        switch (error.code) {
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
    },
  })

  if (isError) {
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
          <Placeholder.Title>Is Fetching User</Placeholder.Title>
          <Placeholder.Description>
            Fetching user from the database
          </Placeholder.Description>
        </Placeholder>
      </div>
    )
  }

  return (
    <>
      <div className={"absolute right-10 top-96"}>
        <Link href={url} className={cn(buttonVariants({ variant: "link" }))}>
          <>
            <Icons.close className="w-4 h-4 mr-2" />
            Close
          </>
        </Link>
      </div>

      {adminClient !== undefined ? (
        <AdminEditForm client={adminClient} />
      ) : null}
    </>
  )
}
