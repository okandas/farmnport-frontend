"use client"

import { sendGTMEvent } from '@next/third-parties/google'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image, { ImageProps } from "next/image"
import Link from 'next/link'
import { Button } from "@/components/ui/button"

import logoInputs from '@/assets/logos/inputs.svg'
import logoGuidance from '@/assets/logos/guidance.svg'
import logoPlanning from '@/assets/logos/planning.svg'
import logoResearch from '@/assets/logos/research.svg'
import logoChicken from '@/assets/logos/chicken.svg'
import logoPig from '@/assets/logos/pig.svg'
import logoCattle from '@/assets/logos/cattle.svg'
import logoGroundNut from '@/assets/logos/groundnut.svg'
import logoTomato from '@/assets/logos/tomato.svg'
import logoOnion from '@/assets/logos/onion.svg'

import { cn } from "@/lib/utilities"
import { Icons } from "@/components/icons/lucide"


export default function LandingPage() {

    return (
        <main>
            <Tabs defaultValue="farmers">
                <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8">
                    <div className="px-9 pt-3 pb-6 lg:col-span-7 lg:px-0 lg:pb-16 lg:pt-7 xl:col-span-6">
                        <div className="mx-auto max-w-2xl lg:mx-0">

                            <div className="mt-12 mb-8 sm:mt-32 sm:flex lg:mt-16">
                                <div className="relative rounded-full px-3 py-1 text-sm leading-6 ring-1 ring-orange-500 hover:ring-900/20 w-44">
                                    See <a href="#" className="whitespace-nowrap font-semibold text-orange-600">What's new!? <span aria-hidden="true">&rarr;</span></a>
                                </div>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight sm:mt-10 sm:text-6xl font-heading">Getting You To Market.</h1>
                            <p className="mt-6 leading-normal text-muted-foreground sm:text-xl sm:leading-8">Its never been easier to pre plan your harvest sales, with fresh farm produce buyers at the tip of your fingers. Farmnport the best pace to find buyers for your agriproduce.</p>
                            <div className="mt-10 flex items-center gap-x-6">
                                <TabsList className="">
                                    <TabsTrigger value="farmers" onClick={() => sendGTMEvent({ event: 'view', value: 'FarmerFaqTab' })}><span className="mr-1">For Farmers</span>  <span aria-hidden="true">&rarr;</span></TabsTrigger>
                                    <TabsTrigger value="buyers" onClick={() => sendGTMEvent({ event: 'view', value: 'BuyerManagementTab' })}><span className="mr-1">Buyer Management</span>  <span aria-hidden="true">&#8644;</span></TabsTrigger>
                                </TabsList>
                            </div>
                        </div>
                    </div>
                    <div className="relative px-6 pb-10 sm:pb-32 lg:col-span-5 lg:-mr-8 lg:px-0 lg:pb-16 lg:pt-7 xl:col-span-5">
                        <TabsContent value="farmers">
                            <FarmerInfo />
                        </TabsContent>
                        <TabsContent value="buyers">
                            <BuyerFaqs />
                        </TabsContent>
                    </div>
                </div>
            </Tabs>
            <FeaturedPopularSection />
            <CTAPrices />
        </main>
    )
}

function BriefcaseIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            {...props}
        >
            <path
                d="M2.75 9.75a3 3 0 0 1 3-3h12.5a3 3 0 0 1 3 3v8.5a3 3 0 0 1-3 3H5.75a3 3 0 0 1-3-3v-8.5Z"
                className="fill-zinc-100 stroke-zinc-400 dark:fill-zinc-100/10 dark:stroke-zinc-500"
            />
            <path
                d="M3 14.25h6.249c.484 0 .952-.002 1.316.319l.777.682a.996.996 0 0 0 1.316 0l.777-.682c.364-.32.832-.319 1.316-.319H21M8.75 6.5V4.75a2 2 0 0 1 2-2h2.5a2 2 0 0 1 2 2V6.5"
                className="stroke-zinc-400 dark:stroke-zinc-500"
            />
        </svg>
    )
}

function ArrowDownIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
    return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
            <path
                d="M4.75 8.75 8 12.25m0 0 3.25-3.5M8 12.25v-8.5"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

interface Info {
    company: string
    title: string
    logo: ImageProps['src']
    activity: string
}

function Info({ info }: { info: Info }) {


    return (
        <li className="flex gap-4">
            <div className="relative mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
                <Image src={info.logo} alt="" className="h-7 w-7" unoptimized />
            </div>
            <dl className="flex flex-auto flex-wrap gap-x-2">
                <dt className="sr-only">Company</dt>
                <dd className="w-full flex-none text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {info.company}
                </dd>
                <dt className="sr-only">Role</dt>
                <dd className="text-xs text-zinc-500 dark:text-zinc-400">
                    {info.title}
                </dd>
                <dt className="sr-only">Date</dt>
                <dd
                    className="ml-auto text-xs text-zinc-400 dark:text-zinc-500"
                >
                    {info.activity}
                </dd>
            </dl>
        </li>
    )
}

function FarmerInfo() {
    let details: Array<Info> = [
        {
            company: 'Planning',
            title: 'Plan, Grow and Sell Produce',
            logo: logoPlanning,
            activity: 'marketing'

        },
        {
            company: 'Inputs',
            title: 'Where, How to source affordable inputs.',
            logo: logoInputs,
            activity: 'strategy'

        },
        {
            company: 'Guidance',
            title: 'Agronomists, Ministry at your disposal.',
            logo: logoGuidance,
            activity: 'guidance'

        },
        {
            company: 'Research',
            title: 'Seed, Breeds, Vaccines available for your use',
            logo: logoResearch,
            activity: 'information'

        },
    ]

    return (
        <div className="rounded-lg border border-zinc-100 p-6 dark:border-zinc-700/40">
            <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                <BriefcaseIcon className="h-6 w-6 flex-none" />
                <span className="ml-3">How we help you succeed.</span>
            </h2>
            <ol className="mt-6 space-y-4">
                {details.map((info, infoIndex) => (
                    <Info key={infoIndex} info={info} />
                ))}
            </ol>
            <Button variant="secondary" className="group mt-6 w-full" onClick={() => sendGTMEvent({ event: 'link', value: 'SignupFaqNavigation' })}>
                Get Started
                <ArrowDownIcon className="h-4 w-4 stroke-zinc-400 transition group-active:stroke-zinc-600 dark:group-hover:stroke-zinc-50 dark:group-active:stroke-zinc-50" />
            </Button>
        </div>
    )
}


function BuyerFaqs() {

    const activity = [
        { id: 1, type: 'faq', description: { name: 'Do they pay on time ?' } },

        {
            id: 2,
            type: 'commented',
            description: {
                name: 'Guides and Reviews',
                imageUrl:
                    'https://images.unsplash.com/photo-1635850967683-17df1f33e749?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            },
            comment: 'Find out when and how buyers pay their invoices?'
        },
        { id: 3, type: 'faq', description: { name: 'Buyer Standards.' } },
        {
            id: 2,
            type: 'commented',
            description: {
                name: 'Trust and Professionalism',
                imageUrl:
                    'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            },
            comment: 'Are buyers professional in their operations and give fair value for produce purchased..'
        },
        { id: 5, type: 'paid', description: { name: 'Stay ahead and achieve profitability in agriculture!' } },
    ]

    return (
        <>
            <ul role="list" className="space-y-6">
                {activity.map((activityItem, activityItemIdx) => (
                    <li key={activityItem.id} className="relative flex gap-x-4">
                        <div
                            className={cn(
                                activityItemIdx === activity.length - 1 ? 'h-6' : '-bottom-6',
                                'absolute left-0 top-0 flex w-6 justify-center'
                            )}
                        >
                            <div className="w-px bg-gray-200" />
                        </div>
                        {activityItem.type === 'commented' ? (
                            <>
                                <img
                                    src={activityItem.description.imageUrl}
                                    alt=""
                                    className="relative mt-3 h-6 w-6 flex-none rounded-full bg-gray-50"
                                />
                                <div className="flex-auto rounded-md p-3 ring-1 ring-inset ring-orange-500">
                                    <div className="flex justify-between gap-x-4">
                                        <div className="py-0.5 text-xs leading-5">
                                            <span className="font-medium text-muted-foreground">{activityItem.description.name}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm leading-6 text-gray-500">{activityItem.comment}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-background">
                                    {activityItem.type === 'paid' ? (
                                        <Icons.clipboardCheck className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                                    ) : (
                                        <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
                                    )}
                                </div>
                                <p className="flex-auto py-0.5 text-xs leading-5 ">
                                    <span className="font-medium text-muted-foreground">{activityItem.description.name}</span>
                                </p>
                            </>
                        )}
                    </li>
                ))}
            </ul>
            <Link href="/buyers">
                <Button variant="secondary" className="group mt-6 w-full" onClick={() => sendGTMEvent({ event: 'link', value: 'BuyerFaqNavigation' })}>
                    View Buyers
                    <ArrowDownIcon className="h-4 w-4 stroke-zinc-400 transition group-active:stroke-zinc-600 dark:group-hover:stroke-zinc-50 dark:group-active:stroke-zinc-50" />
                </Button>
            </Link>

        </>
    )
}

function CTAPrices() {
    return (
        <div className='mx-auto max-w-7xl'>
            <div className="px-9 lg:flex lg:items-center lg:justify-between">
                <h2 className="text-3xl max-w-2xl font-bold tracking-tight sm:text-4xl font-heading">
                    Prices Anyone?
                    <br />
                    See what prices buyers are buying farm produce for today.
                </h2>
                <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:flex-shrink-0">
                    <Link href="/prices" className="text-sm font-semibold leading-6 text-muted-foreground">
                        See more <span aria-hidden="true">→</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}

function FeaturedPopularSection() {

    const markets = [
        {
            name: 'Chicken',
            message: 'Find Chicken, Broiler Buyers in Zimbabwe, Make Poultry Farming Profitable for You.',
            logo: logoChicken,
        },
        {
            name: 'Pork',
            message: 'Find Pig, Pork, Porker Buyers in Zimbabwe, Make Livestock Farming Profitable for You.',
            logo: logoPig,
        },
        {
            name: 'Onions',
            message: 'Find Onion Buyers in Zimbabwe, Make Horticulture Farming Profitable for You.',
            logo: logoOnion,
        },
        {
            name: 'Cattle',
            message: 'Find Cattle Buyers in Zimbabwe, Make Ranching, Dairy, Livestock Farming Profitable for You.',

            logo: logoCattle,
        },
        {
            name: 'Tomatoes',
            message: 'Find Tomato Buyers in Zimbabwe, Make Horticulture Farming Profitable for You.',
            logo: logoTomato,
        },
        {
            name: 'Ground Nuts',
            message: 'Find Ground Nut Buyers in Zimbabwe, Make Horticulture Farming Profitable for You.',
            logo: logoGroundNut,
        },
    ]


    return (
        <div className="">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0">
                    <h2 className="text-3xl font-bold tracking-tight font-heading sm:text-4xl">
                        Our most popular markets!
                    </h2>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        These agri produce markets are the most searched for by farmers looking to sell, market their fresh produce.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-4 pb-12 lg:pb-20 lg:pt-16">
                    {markets.map((market) => (
                        <div
                            key={market.name}
                            className="relative flex items-center space-x-3 bg-card text-card-foreground shadow-sm rounded-lg  border border-zinc-100 p-6 dark:border-zinc-700/40 px-6 py-5 "
                        >
                            <div className="relative mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
                                <Image src={market.logo} alt="" className="h-7 w-7" unoptimized />
                            </div>
                            <div className="min-w-0 flex-1">
                                <a href="#" className="focus:outline-none">
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    <p className="text-lg font-medium">{market.name}</p>
                                    <p className="text-base text-muted-foreground pt-1">{market.message}</p>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
