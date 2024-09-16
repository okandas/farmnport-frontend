"use client"

import { useCallback, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { sendGTMEvent } from '@next/third-parties/google'
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

import { queryBuyer } from "@/lib/query"
import { ApplicationUser, AuthenticatedUser } from "@/lib/schemas"
import { slug as createSlug, capitalizeFirstLetter, formatDate, plural } from "@/lib/utilities"
import { Icons } from "@/components/icons/lucide"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface BuyerPageProps {
    slug: string
    user: AuthenticatedUser | null
}

export function Buyer({ slug, user }: BuyerPageProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const createQueryString = useCallback(
        (params: Record<string, string | number | null>) => {
            const newSearchParams = new URLSearchParams(searchParams?.toString())

            for (const [key, value] of Object.entries(params)) {
                if (value === null) {
                    newSearchParams.delete(key)
                } else {
                    newSearchParams.set(key, String(value))
                }
            }

            return newSearchParams.toString()
        },
        [searchParams]
    )
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

    console.log(buyer)


    if (buyer === undefined) {
        return null
    }

    interface Info {
        title: string
        action: string
    }

    function Info({ info, name }: { info: Info, name: string }) {
        const name_slug = createSlug(name)
        const queryString = createQueryString({
            'entity': 'buyer',
            'wantToSee': `${name_slug}`
        })
        return (
            <dd>
                <Button variant="outline" onClick={() => {
                    sendGTMEvent({ event: 'action', value: info.action })
                    router.push(`/login?${queryString}`)
                }
                }>
                    See {info.title}
                </Button>
            </dd>

        )
    }

    const infoPhone: Info = {
        title: "Number",
        action: "LoggedOutViewNumber"
    }

    const infoEmail: Info = {
        title: "Email",
        action: "LoggedOutViewEmail"
    }

    function ShowEmail({ email }: { email: string }) {
        const [showDetail, setShowDetail] = useState(false);

        const showDetailButton = () => {
            setShowDetail(true);
        };

        return (
            <>
                {
                    showDetail ?
                        <dd className="text-sm font-medium leading-6 text-muted-foreground hover:underline">
                            <Link href={`mailto:${email}`}>
                                {email}
                            </Link>
                        </dd>
                        : (
                            <Button className="p-0 h-[22px]" variant="link" onClick={() => {
                                sendGTMEvent({ event: 'action', value: 'LoggedInViewEmail' })
                                showDetailButton()
                            }}>
                                Show email
                            </Button>
                        )
                }
            </>
        )
    }
    function ShowPhone({ phone }: { phone: string }) {
        const [showDetail, setShowDetail] = useState(false);

        const showDetailButton = () => {
            setShowDetail(true);
        };

        return (
            <>
                {
                    showDetail ?
                        <dd className="text-sm font-medium leading-6 text-muted-foreground hover:underline">
                            <Link href={`tel:${phone}`}>
                                {phone}
                            </Link>
                        </dd>
                        : (
                            <Button className="p-0 h-[22px]" variant="link" onClick={() => {
                                sendGTMEvent({ event: 'action', value: 'LoggedInViewPhone' })
                                showDetailButton()
                            }}>
                                Show phone
                            </Button>
                        )
                }
            </>
        )
    }

    return (
        <div className="space-y-8 mt-[21px]">
            <section className="">
                <div className="flex gap-x-4 py-1 px-6">

                    <Image className="h-12 w-12 flex-none rounded-full bg-gray-50" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" unoptimized/>
                    <div className="min-w-0">
                        <h1 className="text-sm font-semibold leading-6 text-gray-900">Leslie Alexander</h1>
                        <p className="truncate text-xs leading-4 text-gray-500">leslie.alexander@example.com</p>
                        <div className="flex gap-x-1 py-1">
                            <div>
                                <dt>
                                    <span className="sr-only">Email</span>
                                    <Icons.phone className="h-6 w-5" aria-hidden="true" color="#1E88E5" />
                                </dt>
                            </div>
                            <div>
                                <dt>
                                    <span className="sr-only">Email</span>
                                    <Icons.mail className="h-6 w-5" aria-hidden="true" />
                                </dt>
                            </div>
                            <div>
                                <dt>
                                    <span className="sr-only">Email</span>
                                    <Icons.linkedin className="h-6 w-5" aria-hidden="true" />
                                </dt>
                            </div>
                            <div>
                                <dt>
                                    <span className="sr-only">Email</span>
                                    <Icons.twitter className="h-6 w-5" aria-hidden="true" />
                                </dt>
                            </div>
                            <div>
                                <dt>
                                    <span className="sr-only">Email</span>
                                    <Icons.facebook className="h-6 w-5" aria-hidden="true" />
                                </dt>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex px-6">
                    <div className="flex-none w-16">
                        <p className="text-sm font-semibold leading-6 text-gray-900">85</p>
                        <p className="truncate text-xs leading-4 text-gray-500">Branches</p>
                    </div>
                    <div className="flex-1 w-60 content-center flex justify-center mt-[6px]">
                        <Button variant="secondary" size={"sm"} className="text-[12px]">
                            <Icons.circleDollarSign className="mr-2 h-4 w-4" /> See Buying Prices
                        </Button>
                    </div>
                    <div className="flex-none w-16">
                        <dt>
                            <span className="sr-only">Unverified</span>
                            <Icons.unverified className="h-6 w-5" aria-hidden="true" color="#FF0000"/>
                        </dt>
                        <dd className="text-[10px] font-medium leading-3 text-muted-foreground">Unverified</dd>
                    </div>
                </div>

                <div className="min-h-[300px] bg-secondary mt-4">

                </div>
            </section>

        </div>
    )
}


