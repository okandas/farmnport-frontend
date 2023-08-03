"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AxiosError, AxiosResponse, isAxiosError } from "axios"

import { queryUserAsAdmin } from "@/lib/query"
import { ApplicationUser } from "@/lib/schemas"
import { makeAbbveriation } from "@/lib/utilities"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons/lucide"

interface ViewClientHeaderProps {
  params: {
    slug: string
  }
}

export default function ViewClientHeader({ params }: ViewClientHeaderProps) {
  const name = params.slug

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
    refetchOnWindowFocus: false,
  })

  if (isError) {
    return null
  }

  if (isLoading || isFetching) {
    return null
  }

  return (
    <header className="gap-2 pb-2 border-b">
      <div className="flex justify-between max-w-2xl">
        <Avatar className="w-32 h-32 mb-1 mr-4">
          <AvatarImage />
          <AvatarFallback>{makeAbbveriation(adminClient?.name)}</AvatarFallback>
        </Avatar>
        <p className="leading-7 [&:not(:first-child)]:mt-5">
          {adminClient?.short_description}
        </p>
        <div>
          <Icons.badgeCheck className="w-6 h-6 mt-6 stroke-red-500" />
        </div>
      </div>
      <h2 className="text-3xl font-semibold tracking-tight transition-colors scroll-m-20 first:mt-4">
        {name}
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-2 mb-4">
        <Badge variant="outline">{adminClient?.type}</Badge>
      </p>
    </header>
  )
}
