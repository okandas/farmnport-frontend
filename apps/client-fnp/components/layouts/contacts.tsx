"use client"

import { useCallback, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"


import { sendGTMEvent } from '@next/third-parties/google'
import Link from "next/link"



import { ApplicationUser, AuthenticatedUser } from "@/lib/schemas"
import { slug, capitalizeFirstLetter, formatDate, plural } from "@/lib/utilities"
import { Icons } from "@/components/icons/lucide"
import {Button, buttonVariants} from "@/components/ui/button"

interface ContactPageProps {
    user: AuthenticatedUser | null
    client: ApplicationUser
    quickOverview?: Boolean
}

export function Contacts({ user, client, quickOverview }: ContactPageProps) {

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

    interface Info {
        title: string
        action: string
    }

    function Info({ info, name }: { info: Info, name: string }) {
        const name_slug = slug(name)
        const queryString = createQueryString({
            'entity': client.type,
            'wantToSee': `${name_slug}`
        })
        return (
            <dd>
                <Button className="p-0 h-[22px]" variant="link" onClick={() => {
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
        <section className="space-y-8 md:px-6 py-1">
           <div className="px-6 py-4">
                <dl className="grid grid-cols-1 lg:grid-cols-2 text-sm leading-6">
                    <div className="flex gap-x-4 py-2">
                        <dt>
                            <span className="sr-only">Joined</span>
                            <Icons.calender className="h-6 w-5" aria-hidden="true" />
                        </dt>
                        <dd className="text-sm font-medium leading-6 text-muted-foreground">{formatDate(client.created)}</dd>
                    </div>
                    <div className="flex gap-x-4 py-1">
                        <dt>
                            <span className="sr-only">Email</span>
                            <Icons.mail className="h-6 w-5" aria-hidden="true" />
                        </dt>

                        {
                            user !== undefined ? (<ShowEmail email={client.email} />) : (<Info info={infoEmail} name={client.name} />)
                        }
                    </div>
                    <div className="flex gap-x-4 py-1">
                        <dt>
                            <span className="sr-only">Phone</span>
                            <Icons.phone className="h-6 w-5" aria-hidden="true" />
                        </dt>

                        {
                            user !== undefined ? (<ShowPhone phone={client.phone} />) : (<Info info={infoPhone} name={client.name} />)
                        }

                    </div>
                    <div className="flex gap-x-4">
                        <dt>
                            <span className="sr-only">Address</span>
                            <Icons.map className="h-6 w-5" aria-hidden="true" />
                        </dt>
                        <dd className="text-sm font-medium leading-6 text-muted-foreground">{client.address}</dd>
                    </div>

                    <div className="flex gap-x-4 py-1">
                        <dt>
                            <span className="sr-only">City, Province</span>
                            <Icons.landmark className="h-6 w-5" aria-hidden="true" />
                        </dt>
                        <dd className="text-sm font-medium leading-6 text-muted-foreground">{capitalizeFirstLetter(client.city)}, {capitalizeFirstLetter(client.province)}</dd>
                    </div>
                    { quickOverview ?
                            <div className="flex gap-x-4 py-1">
                                <dt>
                                    <span className="sr-only">Quick overview</span>
                                    <Icons.info className="h-6 w-5" aria-hidden="true" />
                                </dt>
                                <div>
                                    <dd className="text-sm font-medium leading-6 text-muted-foreground">{capitalizeFirstLetter(client.type)} primarily specializes in <span className="font-semibold text-foreground">{capitalizeFirstLetter(client.specialization)}</span></dd>
                                    <dd className="text-sm font-medium leading-6 text-muted-foreground">Mainly buying <span className="font-semibold text-foreground">{capitalizeFirstLetter(plural(client.main_activity))}</span></dd>
                                    <dd className="text-sm font-medium leading-6 text-muted-foreground">and {client.type == 'buyer' ? "sources ": "produces "}
                                        <span className="font-semibold text-foreground">{client.specializations.length}</span> other agricultural {plural("product", client.specializations.length)}, see more
                                    </dd>
                                </div>

                            </div>
                        :
                            null
                     }

                </dl>
            </div>
        </section>

    )
}


