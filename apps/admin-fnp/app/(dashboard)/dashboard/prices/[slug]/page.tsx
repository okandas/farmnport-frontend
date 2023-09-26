"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import { queryUserProductPriceListAsAdmin } from "@/lib/query";
import { ProducerPriceList } from "@/lib/schemas";
import { centsToDollars, cn, formatDate, ucFirst } from "@/lib/utilities";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";
import { Icons } from "@/components/icons/lucide";
import { Placeholder } from "@/components/state/placeholder";

interface ViewClientProductListPageProps {
  params: {
    slug: string;
  };
}

export default function ViewClientProductListPage({
  params,
}: ViewClientProductListPageProps) {
  const clientID = params.slug;

  const { isError, isLoading, isFetching, refetch, data } = useQuery({
    queryKey: ["dashboard-admin-client-price", clientID],
    queryFn: () => queryUserProductPriceListAsAdmin(clientID),
  });

  if (isError) {
    if (isAxiosError(data)) {
      switch (data.code) {
        case "ERR_NETWORK":
          toast({
            description: "There seems to be a network error.",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
          break;

        default:
          toast({
            title: "Uh oh! Failed to fetch client price.",
            description: "There was a problem with your request.",
            action: (
              <ToastAction altText="Try again" onClick={() => refetch()}>
                Try again
              </ToastAction>
            ),
          });
          break;
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
    );
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
    );
  }

  const producerPriceList = data?.data as ProducerPriceList;

  const statuses = [
    "text-green-700 bg-green-50 ring-green-600/20",
    "text-lime-700 bg-lime-50 ring-lime-600/20",
    "text-yellow-700 bg-yellow-50 ring-yellow-600/20",
    "text-amber-700 bg-amber-50 ring-amber-600/20",
    "text-orange-700 bg-orange-50 ring-orange-600/20",
    "text-red-700 bg-red-50 ring-red-600/10",
    "text-stone-600 bg-stone-50 ring-stone-500/10",
    "text-gray-600 bg-gray-50 ring-gray-500/10",
  ];

  type ProducerPriceListKeys =
    | "beef"
    | "lamb"
    | "mutton"
    | "goat"
    | "chicken"
    | "pork";

  const beef: ProducerPriceListKeys = "beef";
  const lamb: ProducerPriceListKeys = "lamb";
  const mutton: ProducerPriceListKeys = "mutton";
  const goat: ProducerPriceListKeys = "goat";
  const chicken: ProducerPriceListKeys = "chicken";
  const pork: ProducerPriceListKeys = "pork";

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
  };

  const pricingTypes: Record<string, ProducerPriceListKeys[]> = {
    livestock: [beef, lamb, mutton, goat, chicken, pork],
  };

  const url = `/dashboard/prices`;

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
      <section className="flex flex-col items-center justify-center min-h-full p-8 text-center">
        <Tabs defaultValue="beef" className="w-[500px]">
          <TabsList className="grid w-full grid-cols-6">
            {pricingTypes[producerPriceList.client_specialization].map(
              (type, index) => {
                return (
                  <TabsTrigger key={index} value={type}>
                    {type}
                  </TabsTrigger>
                );
              },
            )}
          </TabsList>
          {pricingTypes[producerPriceList.client_specialization].map(
            (pricingType, index) => {
              return (
                <TabsContent key={index} value={pricingType}>
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {ucFirst(producerPriceList.client_name)}{" "}
                      </CardTitle>
                      <CardDescription>
                        {ucFirst(pricingType)} producer Price List they are
                        paying farmers for the {pricingType} they buy from
                        clients.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 min-h-[305px]">
                      {producerPriceList[pricingType] !== undefined ? (
                        <ul
                          role="list"
                          className="grid grid-cols-1 gap-x-2 gap-y-2 lg:grid-cols-2 xl:gap-x-4"
                        >
                          {Object.keys(producerPriceList[pricingType]).map(
                            (key, index) => {
                              if (key === "hasPrice") {
                                return null;
                              }
                              const gradePrices =
                                producerPriceList[pricingType];

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
                                            ],
                                          )}
                                        </div>

                                        {grades?.[pricingType]?.[key] ? (
                                          <div
                                            className={cn(
                                              statuses[index],
                                              "rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset",
                                            )}
                                          >
                                            {grades[pricingType][key]}
                                          </div>
                                        ) : null}
                                      </dd>
                                    </div>
                                  </dl>
                                </li>
                              );
                            },
                          )}
                        </ul>
                      ) : null}
                    </CardContent>
                    <CardFooter>
                      <Button>Book Now</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              );
            },
          )}
        </Tabs>
      </section>
    </>
  );
}
