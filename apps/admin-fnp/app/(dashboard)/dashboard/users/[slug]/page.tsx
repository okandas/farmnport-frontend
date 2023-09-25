"use client"

import { useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"

import { queryUserAsAdmin, queryUserProductPriceListAsAdmin } from "@/lib/query"
import { ApplicationUser, ProducerPriceList } from "@/lib/schemas"
import { centsToDollars, cn, formatDate, ucFirst } from "@/lib/utilities"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { Placeholder } from "@/components/state/placeholder"
import { AdminControlDropDown } from "@/components/structures/control-dropdown"

interface ViewClientPageProps {
  params: {
    slug: string
  }
}

export default function ViewClientPage({ params }: ViewClientPageProps) {
  const name = params.slug

  const { isError, isLoading, isFetching, data, refetch } = useQuery({
    queryKey: ["dashboard-admin-client", name],
    queryFn: () => queryUserAsAdmin(name),
  })

  const adminClient = data?.data as ApplicationUser

  const clientID = adminClient?.id ?? ""

  const { data: priceListData } = useQuery({
    queryKey: ["dashboard-admin-client-price", clientID],
    queryFn: () => queryUserProductPriceListAsAdmin(clientID),
  })

  const latestProducerPriceList = priceListData?.data as ProducerPriceList

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
          <Placeholder.Title>Is Fetching User</Placeholder.Title>
          <Placeholder.Description>
            Fetching user from the database
          </Placeholder.Description>
        </Placeholder>
      </div>
    )
  }

  const statuses = [
    "text-green-700 bg-green-50 ring-green-600/20",
    "text-lime-700 bg-lime-50 ring-lime-600/20",
    "text-yellow-700 bg-yellow-50 ring-yellow-600/20",
    "text-amber-700 bg-amber-50 ring-amber-600/20",
    "text-orange-700 bg-orange-50 ring-orange-600/20",
    "text-red-700 bg-red-50 ring-red-600/10",
    "text-stone-600 bg-stone-50 ring-stone-500/10",
    "text-gray-600 bg-gray-50 ring-gray-500/10",
  ]

  type ProducerPriceListKeys =
    | "beef"
    | "lamb"
    | "mutton"
    | "goat"
    | "chicken"
    | "pork"

  const beef: ProducerPriceListKeys = "beef"
  const lamb: ProducerPriceListKeys = "lamb"
  const mutton: ProducerPriceListKeys = "mutton"
  const goat: ProducerPriceListKeys = "goat"
  const chicken: ProducerPriceListKeys = "chicken"
  const pork: ProducerPriceListKeys = "pork"

  const grades: Record<ProducerPriceListKeys, Record<string, string>> = {
    beef: {
      super: "S",
      choice: "O",
      commercial: "B",
      economy: "X",
      manufacturing: "J",
      condemned: "CD",
    },
    lamb: {
      superPremium: "SL",
      choice: "CL",
      standard: "TL",
      inferior: "IL",
    },
    mutton: {
      super: "SM",
      choice: "CM",
      standard: "TM",
      ordinary: "OM",
      inferior: "IM",
    },
    goat: {
      super: "SG",
      choice: "CG",
      standard: "TG",
      inferior: "IG",
    },
    chicken: {
      grade: "A",
    },
    pork: {
      super: "SP",
      manufacturing: "MP",
    },
  }

  const pricingTypes: Record<string, ProducerPriceListKeys[]> = {
    livestock: [beef, lamb, mutton, goat, chicken, pork],
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
        <aside>
          {adminClient?.specialization !== undefined &&
          latestProducerPriceList != undefined &&
          adminClient?.type === "buyer" ? (
            <Tabs defaultValue="beef" className="w-[500px]">
              <TabsList className="grid w-full grid-cols-6">
                {pricingTypes[adminClient.specialization].map((type, index) => {
                  return (
                    <TabsTrigger key={index} value={type}>
                      {type}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
              {pricingTypes[adminClient.specialization].map(
                (pricingType, index) => {
                  return (
                    <TabsContent key={index} value={pricingType}>
                      <Card>
                        <CardHeader>
                          <CardTitle>
                            {ucFirst(pricingType)} Producer Prices
                          </CardTitle>
                          <CardDescription>
                            This how much you are paying farmers for the{" "}
                            {pricingType} you sell and they buy from you.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 min-h-[305px]">
                          {latestProducerPriceList[pricingType] !==
                          undefined ? (
                            <ul
                              role="list"
                              className="grid grid-cols-1 gap-x-2 gap-y-2 lg:grid-cols-2 xl:gap-x-4 "
                            >
                              {Object.keys(
                                latestProducerPriceList[pricingType]
                              ).map((key, index) => {
                                if (key === "hasPrice") {
                                  return null
                                }
                                const gradePrices =
                                  latestProducerPriceList[pricingType]

                                return (
                                  <li
                                    className="overflow-hidden border border-gray-200 rounded-xl"
                                    key={index}
                                  >
                                    <dl className="px-6 py-4 -my-3 text-sm leading-6 divide-y divide-gray-100">
                                      <div className="flex justify-between py-3 gap-x-4">
                                        <dt className="text-gray-700">
                                          {ucFirst(key)}
                                        </dt>
                                        <dd className="flex items-start gap-x-2">
                                          <div className="font-medium text-gray-900">
                                            {centsToDollars(
                                              gradePrices[
                                                key as keyof typeof gradePrices
                                              ]
                                            )}
                                          </div>

                                          {grades?.[pricingType]?.[key] ? (
                                            <div
                                              className={cn(
                                                statuses[index],
                                                "rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset"
                                              )}
                                            >
                                              {grades[pricingType][key]}
                                            </div>
                                          ) : null}
                                        </dd>
                                      </div>
                                    </dl>
                                  </li>
                                )
                              })}
                            </ul>
                          ) : null}
                        </CardContent>
                        <CardFooter>
                          <Button>Book Now</Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                  )
                }
              )}
            </Tabs>
          ) : null}
        </aside>
      </section>
      <section className="gap-4">
        <header>
          <h4 className="pb-2 mt-10 text-lg font-semibold tracking-tight transition-colors border-b scroll-m-20 first:mt-0">
            Other Specializations
          </h4>
        </header>
        <section className="grid grid-cols-2 gap-2 mb-3 mt-7">
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
          <div className="flex flex-wrap h-8">
            {adminClient?.specializations.map((specialization) => {
              if (specialization.length === 0) {
                return null
              }

              return (
                <div
                  className="h-10 p-2 mb-1 mr-2 tracking-tight border rounded-md"
                  key={specialization}
                >
                  {specialization}
                </div>
              )
            })}
          </div>
        </section>
      </section>
    </>
  )
}
