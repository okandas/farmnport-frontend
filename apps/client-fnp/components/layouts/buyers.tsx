"use client"

import { useCallback, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

// @ts-expect-error package creators need to fix this.
import { sendGTMEvent } from '@next/third-parties/google'
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

import { Pagination } from "@/components/generic/pagination"
import { queryBuyers } from "@/lib/query"
import { ApplicationUser, AuthenticatedUser } from "@/lib/schemas"
import { slug, capitalizeFirstLetter, formatDate } from "@/lib/utilities"
import { Icons } from "@/components/icons/lucide"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface BuyerPageProps {
    user: AuthenticatedUser | null
}

export function Buyers({ user }: BuyerPageProps) {

    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Create query string
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

    console.log(user)


    // Search params
    const page = Number(searchParams?.get("page")) ?? 1

    const { data, isError, refetch, isFetching } = useQuery({
        queryKey: ["results-buyers", { p: page }],
        queryFn: () => queryBuyers({ p: page }),
        refetchOnWindowFocus: false
    })

    if (isError) {
        return null
    }

    if (isFetching) {
        return null
    }

    const buyers = data?.data?.data as ApplicationUser[]
    const total = data?.data?.total as number

    const pageCount = Math.ceil(total / 10)

    if (buyers === undefined) {
        return null
    }

    interface Info {
        title: string
        action: string
    }

    function Info({ info, name }: { info: Info, name: string }) {
        const name_slug = slug(name)
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
                            <Button className="p-0 h-4" variant="link" onClick={() => {
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
                            <Button className="p-0 h-4" variant="link" onClick={() => {
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
        <section className="space-y-8 mt-[21px]">
            <ul role="list" className="divide-y">
                {buyers.map((buyer, buyerIndex) => (
                    <li key={buyerIndex} className="py-4">

                        <div>
                            <h4 className="text-lg">{capitalizeFirstLetter(buyer.name)}</h4>
                            {buyer.short_description.length > 0 ? <h4 className="text-muted-foreground text-sm">{capitalizeFirstLetter(buyer.short_description)}</h4> : null}
                            <div className="grid grid-cols-1 lg:grid-cols-2">
                                <div>
                                    <dl className="-my-3 py-4 text-sm leading-6">
                                        <div className="flex justify-between gap-x-4 py-2">
                                            <dt>
                                                <span className="sr-only">Joined</span>
                                                <Icons.calender className="h-6 w-5" aria-hidden="true" />
                                            </dt>
                                            <dd className="text-sm font-medium leading-6 text-muted-foreground">{formatDate(buyer.created)}</dd>
                                        </div>
                                        <div className="flex justify-between gap-x-4 py-1">
                                            <dt>
                                                <span className="sr-only">Email</span>
                                                <Icons.mail className="h-6 w-5" aria-hidden="true" />
                                            </dt>

                                            {
                                                user !== undefined ? (<ShowEmail email={buyer.email} />) : (<Info info={infoEmail} name={buyer.name} />)
                                            }
                                        </div>
                                        <div className="flex justify-between gap-x-4 py-1">
                                            <dt>
                                                <span className="sr-only">Phone</span>
                                                <Icons.phone className="h-6 w-5" aria-hidden="true" />
                                            </dt>

                                            {
                                                user !== undefined ? (<ShowPhone phone={buyer.phone} />) : (<Info info={infoPhone} name={buyer.name} />)
                                            }

                                        </div>
                                        <div className="flex justify-between gap-x-4 py-1">
                                            <dt>
                                                <span className="sr-only">Address</span>
                                                <Icons.map className="h-6 w-5" aria-hidden="true" />
                                            </dt>
                                            <dd className="text-sm font-medium leading-6 text-muted-foreground">{buyer.address}</dd>
                                        </div>
                                        <div className="flex justify-between gap-x-4 py-1">
                                            <dt>
                                                <span className="sr-only">City, Province</span>
                                                <Icons.landmark className="h-6 w-5" aria-hidden="true" />
                                            </dt>
                                            <dd className="text-sm font-medium leading-6 text-muted-foreground">{capitalizeFirstLetter(buyer.city)}, {capitalizeFirstLetter(buyer.province)}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>

                    </li>
                ))}
            </ul>

            <div>
                <Pagination
                    pageCount={pageCount}
                    page={page}
                    createQueryString={createQueryString}
                />
            </div>
        </section>

    )
}


