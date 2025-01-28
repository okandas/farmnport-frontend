"use client"

import { useCallback, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { sendGTMEvent } from '@next/third-parties/google'
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

import { queryBuyer } from "@/lib/query"
import { ApplicationUser, AuthenticatedUser } from "@/lib/schemas"
import { slug as createSlug, capitalizeFirstLetter, makeAbbveriation, plural } from "@/lib/utilities"
import { Icons } from "@/components/icons/lucide"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Contacts } from "@/components/layouts/contacts"


interface BuyerPageProps {
    slug: string
    user: AuthenticatedUser | null
}

export function Buyer({ slug, user }: BuyerPageProps) {
    const searchParams = useSearchParams()

    const { data, isError, refetch, isFetching } = useQuery({
        queryKey: [`result-buyer-${slug}`, slug],
        queryFn: () => queryBuyer(slug),
        refetchOnWindowFocus: false
    })

    if (isError) {
        return null
    }
    if (isFetching) {
        return null
    }

    const buyer = data?.data as ApplicationUser

    if (buyer === undefined) {
        return null
    }

    return (
        <div className="space-y-8 mt-[21px] md:min-w-[500px]">
            <section className="">
                <div className="flex gap-x-4 py-1 px-6">
                    <Avatar className="h-12 w-12 flex-none rounded-full">
                        <AvatarImage />
                        <AvatarFallback>{makeAbbveriation(buyer.name)}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                        <h1 className="text-sm font-semibold leading-6">{ capitalizeFirstLetter(buyer.name) }</h1>
                        <p className="text-xs leading-4 text-muted-foreground ">{ buyer.short_description ? capitalizeFirstLetter(buyer.short_description) :
                         `${ capitalizeFirstLetter(buyer.scale)} scale ${buyer.type} in the ${buyer.specialization} industry mainly procuring ${plural(buyer.main_activity)}.`}</p>

                        <div className="flex mt-2">
                            <div className="flex-none w-16">
                                <p className="text-sm font-semibold leading-6">{ buyer.branches <= 1 ? 1 : buyer.branches  }</p>
                                <p className="truncate text-xs leading-4 text-muted-foreground">{ buyer.branches <= 1 ? "Branch": "Branches" }</p>
                            </div>
                            <div className="flex-none w-16">
                                { buyer.verified ?      
                                    <>                  
                                        <dt>
                                            <span className="sr-only">Verified</span>
                                            <Icons.unverified className="h-6 w-5" aria-hidden="true" color="#228B22" />
                                        </dt>
                                        <dd className="text-xs font-medium leading-4 text-muted-foreground">Verified</dd> 
                                    </>  
                                :      
                                <>                 
                                    <dt>
                                        <span className="sr-only">Unverified</span>
                                        <Icons.unverified className="h-6 w-5" aria-hidden="true" color="#FF0000" />
                                    </dt>
                                    <dd className="text-xs font-medium leading-4 text-muted-foreground">Unverified</dd>
                                </>
                            }

                            </div>
                        </div>
                    </div>
                </div>

                <div className="py-4 px-6 space-y-4">
                    <ul role="list" className="grid grid-cols-2 gap-3">
                        <li className="col-span-1">
                            <div className="flex-1 truncate">
                                <div className="flex items-center space-x-3">
                                    <h3 className="truncate text-base font-medium"> { capitalizeFirstLetter(buyer.type) }</h3>

                                </div>
                                <p className="mt-1 truncate text-sm text-muted-foreground ">Classification</p>
                            </div>
                        </li>
                        <li className="col-span-1">
                            <div className="flex-1 truncate">
                                <div className="flex items-center space-x-3">
                                    <h3 className="truncate text-base font-medium"> { capitalizeFirstLetter(buyer.specialization) }</h3>
                                </div>
                                <p className="mt-1 truncate text-sm text-muted-foreground">Industry</p>
                            </div>
                        </li>
                    </ul>
                    <ul role="list" className="grid grid-cols-2 gap-3">
                        <li className="col-span-1">
                            <div className="flex-1 truncate">
                                <div className="flex items-center space-x-3">
                                    <h3 className="truncate text-base font-medium">{ capitalizeFirstLetter(buyer.main_activity) }</h3>

                                </div>
                                <p className="mt-1 truncate text-sm text-muted-foreground">Main Item Purchased</p>
                            </div>
                        </li>
                        <li className="col-span-1">
                            <div className="flex-1 truncate">
                                <div className="flex items-center space-x-3">
                                    <h3 className="truncate text-base font-medium">{ buyer.payment_terms ? capitalizeFirstLetter(buyer.payment_terms) : "Has not listed payment terms!"}</h3>
                                </div>
                                <p className="mt-1 truncate text-sm text-muted-foreground">Payment Terms</p>
                            </div>
                        </li>
                    </ul>
                    <div className="flex-1 truncate">
                        <div className="flex items-center space-x-3">
                            <h3 className="truncate text-sm font-medium">{ capitalizeFirstLetter(buyer.scale) }</h3>
                        </div>
                        <p className="mt-1 truncate text-sm text-muted-foreground">Scale</p>
                    </div>
                </div>

                <div className="min-h-[100px] bg-secondary">
                    <div className="px-6 py-4 space-y-4">
                        <div className="space-y-2">
                            <h3 className="text-sm text-foreground">Secondary Procurement Activites</h3>
                            <ul className="grid grid-cols-4 gap-1">
                                {
                                    buyer.specializations.map((specialization, index) => (
                                        
                                        <li className="col-span-1 flex justify-center" key={index}>
                                            <span className="flex justify-center  items-center rounded-md bg-white px-2 py-2 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-400/20 w-full text-center">{ capitalizeFirstLetter(specialization) }</span>
                                        </li>
                                    
                                    ))
                                }
                             </ul>
                        </div>

                    </div>
                </div>

                <Contacts user={user} buyer={buyer} />
            </section>

            <section>


            </section>

        </div>
    )
}


