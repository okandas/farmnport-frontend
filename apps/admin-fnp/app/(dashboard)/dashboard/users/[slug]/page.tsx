"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AxiosError, AxiosResponse, isAxiosError } from "axios"

import { queryUserAsAdmin } from "@/lib/query"
import { ApplicationUser } from "@/lib/schemas"
import { formatDate } from "@/lib/utilities"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { Placeholder } from "@/components/state/placeholder"
import { AdminControlDropDown } from "@/components/structures/components/control-dropdown"

interface ViewClientPageProps {
  params: {
    slug: string
  }
}

export default function ViewClientPage({ params }: ViewClientPageProps) {
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
    staleTime: 10000,
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
      <div className={"absolute right-10 top-64"}>
        <AdminControlDropDown client={adminClient} />
      </div>

      <section className="grid grid-cols-2 gap-2 mb-3">
        <aside className="max-w-sm lg:max-w-md">
          <div className="flex justify-start [&:not(:first-child)]:my-3">
            <div className="w-40 leading-7">ID</div>
            <div className="leading-7">
              <p className="text-base font-semibold tracking-tight">
                {adminClient?.id}
              </p>
            </div>
          </div>
          <div className="flex justify-start [&:not(:first-child)]:my-3">
            <div className="w-40 leading-7">Email</div>
            <div className="leading-7">
              <p className="text-base font-semibold tracking-tight">
                {adminClient?.email}
              </p>
            </div>
          </div>
          <div className="flex justify-start [&:not(:first-child)]:my-3">
            <div className="w-40 leading-7">Phone</div>
            <div className="leading-7">
              <p className="text-base font-semibold tracking-tight">
                {adminClient?.phone}
              </p>
            </div>
          </div>
          <div className="flex justify-start [&:not(:first-child)]:my-3">
            <div className="w-40 leading-7">Joined</div>
            <div className="leading-7">
              <p className="text-base font-semibold tracking-tight">
                {formatDate(adminClient?.created)}
              </p>
            </div>
          </div>
          <div className="flex justify-start [&:not(:first-child)]:my-3">
            <div className="w-40 leading-7">Address</div>
            <div className="leading-7">
              <p className="text-base font-semibold tracking-tight">
                {adminClient?.address}
              </p>
            </div>
          </div>
          <div className="flex justify-start [&:not(:first-child)]:my-3">
            <div className="w-40 leading-7">City/Province</div>
            <div className="leading-7">
              <p className="text-base font-semibold tracking-tight">
                {adminClient?.city}, {adminClient?.province}
              </p>
            </div>
          </div>
        </aside>
        <aside className="max-w-sm lg:max-w-md">
          <div className="grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-2">
            <div className="relative p-2 overflow-hidden border rounded-lg bg-background">
              <div className="flex h-[80px] flex-col justify-between rounded-md p-2">
                <div className="space-y-2">
                  <h3 className="font-bold">Branches</h3>
                  <p className="text-sm text-muted-foreground">
                    {adminClient?.branches}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative p-2 overflow-hidden border rounded-lg bg-background">
              <div className="flex h-[80px] flex-col justify-between rounded-md p-2">
                <div className="space-y-2">
                  <h3 className="font-bold">Specilization</h3>
                  <p className="text-sm">{adminClient?.specialization}</p>
                </div>
              </div>
            </div>
            <div className="relative p-2 overflow-hidden border rounded-lg bg-background">
              <div className="flex h-[80px] flex-col justify-between rounded-md p-2">
                <div className="space-y-2">
                  <h3 className="font-bold">Main Activity</h3>
                  <p className="text-sm text-muted-foreground">
                    {adminClient?.main_activity}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative p-2 overflow-hidden border rounded-lg bg-background">
              <div className="flex h-[80px] flex-col justify-between rounded-md p-2">
                <div className="space-y-2">
                  <h3 className="font-bold">Scale</h3>
                  <p className="text-sm">{adminClient?.scale}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>
      <section className="gap-4">
        <header>
          <h4 className="pb-2 mt-10 text-lg font-semibold tracking-tight transition-colors border-b scroll-m-20 first:mt-0">
            Other Specializations
          </h4>
        </header>
        <div className="flex flex-wrap justify-start w-3/4 my-7">
          {adminClient?.specializations.map((specialization) => {
            return (
              <div
                className="p-2 mt-2 mr-2 tracking-tight border rounded-md"
                key={specialization}
              >
                {specialization}
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
