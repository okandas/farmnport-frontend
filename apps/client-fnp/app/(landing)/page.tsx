"use client"

import { sendGTMEvent } from "@next/third-parties/google"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

import logoInputs from "@/assets/logos/inputs.svg"
import logoGuidance from "@/assets/logos/guidance.svg"
import logoPlanning from "@/assets/logos/planning.svg"
import logoResearch from "@/assets/logos/research.svg"
import logoChicken from "@/assets/logos/chicken.svg"
import logoPig from "@/assets/logos/pig.svg"
import logoCattle from "@/assets/logos/cattle.svg"
import logoChilli from "@/assets/logos/chilli.svg"
import logoTomato from "@/assets/logos/tomato.svg"
import logoOnion from "@/assets/logos/onion.svg"

export default function LandingPage() {

    return (
        <main>
            <div className="py-12 lg:py-16">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <div className="mb-6 inline-flex">
                            <Link href="/prices" onClick={() => sendGTMEvent({ event: "click", value: "PricingCTAHero" })}>
                                <div className="relative rounded-full px-3 py-1 text-sm leading-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white ring-2 ring-green-500/50 hover:ring-green-600 transition-all animate-pulse hover:animate-none hover:scale-105 shadow-lg hover:shadow-green-500/50">
                                    New! <span className="whitespace-nowrap font-semibold">Check Market Prices <span aria-hidden="true">&rarr;</span></span>
                                </div>
                            </Link>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl font-heading">Getting You To Market.</h1>
                        <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-8">
                            Its never been easier to pre plan your harvest sales, with fresh farm produce buyers at the tip of your fingers. Farmnport the best place to find buyers for your agriproduce.
                        </p>
                    </div>

                    {/* Bento Grid */}
                    <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
                        {/* For Farmers - Large Card */}
                        <div className="flex p-px lg:col-span-4">
                            <div className="w-full overflow-hidden rounded-lg bg-card shadow outline outline-1 outline-black/5 max-lg:rounded-t-[2rem] lg:rounded-tl-[2rem] dark:shadow-none dark:outline-white/15">
                                <div className="p-10">
                                    <h3 className="text-sm/4 font-semibold text-muted-foreground">For Farmers</h3>
                                    <p className="mt-2 text-lg font-medium tracking-tight">Everything you need to succeed</p>
                                    <p className="mt-2 max-w-lg text-sm/6 text-muted-foreground">
                                        Plan your harvest, source affordable inputs, get expert agronomist support, and access the latest seeds, breeds and vaccines.
                                    </p>
                                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {[
                                            { company: "Planning", title: "Plan, Grow and Sell Produce", logo: logoPlanning },
                                            { company: "Inputs", title: "Source affordable inputs", logo: logoInputs },
                                            { company: "Guidance", title: "Expert agronomist support", logo: logoGuidance },
                                            { company: "Research", title: "Latest seeds, breeds & vaccines", logo: logoResearch },
                                        ].map((info, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <div className="relative mt-1 flex h-8 w-8 flex-none items-center justify-center rounded-full shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
                                                    <Image src={info.logo} alt="" className="h-5 w-5" unoptimized />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium">{info.company}</p>
                                                    <p className="text-xs text-muted-foreground">{info.title}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Buyer Trust - Small Card */}
                        <div className="flex p-px lg:col-span-2">
                            <div className="w-full overflow-hidden rounded-lg bg-card shadow outline outline-1 outline-black/5 lg:rounded-tr-[2rem] dark:shadow-none dark:outline-white/15">
                                <div className="p-10">
                                    <h3 className="text-sm/4 font-semibold text-muted-foreground">Buyer Trust</h3>
                                    <p className="mt-2 text-lg font-medium tracking-tight">Verified buyers only</p>
                                    <p className="mt-2 max-w-lg text-sm/6 text-muted-foreground">
                                        Transparent payment histories, professional standards and fair value for your produce.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Market Prices - Small Card */}
                        <div className="flex p-px lg:col-span-2">
                            <div className="w-full overflow-hidden rounded-lg bg-card shadow outline outline-1 outline-black/5 lg:rounded-bl-[2rem] dark:shadow-none dark:outline-white/15">
                                <div className="p-10">
                                    <h3 className="text-sm/4 font-semibold text-muted-foreground">Market Prices</h3>
                                    <p className="mt-2 text-lg font-medium tracking-tight">Real-time pricing data</p>
                                    <p className="mt-2 max-w-lg text-sm/6 text-muted-foreground">
                                        Get accurate market prices to plan your harvest sales and maximize profitability.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Card - Large */}
                        <div className="flex p-px lg:col-span-4">
                            <div className="w-full overflow-hidden rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 shadow outline outline-1 outline-black/5 max-lg:rounded-b-[2rem] lg:rounded-br-[2rem] dark:shadow-none dark:outline-white/15">
                                <div className="p-10">
                                    <h3 className="text-sm/4 font-semibold text-orange-600 dark:text-orange-500">Get Started Today</h3>
                                    <p className="mt-2 text-lg font-medium tracking-tight">Join thousands of successful farmers</p>
                                    <p className="mt-2 max-w-lg text-sm/6 text-muted-foreground mb-6">
                                        Build a profitable agricultural business with access to verified buyers, market insights, quality inputs and expert guidance all in one platform.
                                    </p>
                                    <Link href="/signup">
                                        <Button className="bg-orange-600 hover:bg-orange-700 text-white dark:bg-orange-500 dark:hover:bg-orange-600 justify-center" onClick={() => sendGTMEvent({ event: "link", value: "SignupHeroNavigation" })}>
                                            Get Started
                                            <ArrowDownIcon className="h-4 w-4 text-black dark:text-white" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Featured />
            <FeaturedPopularSection />
        </main>
    )
}

function ArrowDownIcon(props: React.ComponentPropsWithoutRef<"svg">) {
    return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
            <path
                d="M4.75 8.75 8 12.25m0 0 3.25-3.5M8 12.25v-8.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

function Featured() {
    const categories = [
        {
            name: "Pricing",
            description: "Pricing data and market insights",
            href: "/prices",
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
            ),
        },
        {
            name: "Shop",
            description: "Quality inputs for your farm",
            href: "/shop",
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
            ),
        },
        {
            name: "Chemical Guides",
            description: "Expert agrochemical information",
            href: "/agrochemical-guides",
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
            ),
        },
    ]

    return (
        <section className="bg-background py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-12 lg:gap-12 xl:gap-16">
                    <div className="content-center lg:col-span-6 order-1 lg:order-2">
                        <h2 className="mb-4 text-4xl font-bold leading-none tracking-tight sm:text-5xl font-heading">
                            Your Complete Farm Hub
                        </h2>
                        <p className="mb-6 max-w-2xl text-lg text-muted-foreground md:mb-8">
                            Search active ingredients, discover how pesticides and herbicides work, find what targets specific pests and diseases, then shop for the right products. Find reputable and verified buyers for your produce and get real-time market prices to plan your harvest sales.
                        </p>
                    </div>
                    <div className="lg:col-span-6 order-2 lg:order-1">
                        <div className="grid gap-4 sm:grid-cols-1">
                            {categories.map((category) => (
                                <Link
                                    key={category.name}
                                    href={category.href}
                                    className="group flex items-start gap-4 rounded-lg border bg-card text-card-foreground p-4 shadow-sm transition hover:border-orange-500 hover:shadow-md"
                                    onClick={() => sendGTMEvent({ event: "click", value: `CategoryCard${category.name.replace(/\s+/g, '')}` })}
                                >
                                    <div className="relative mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 group-hover:bg-orange-600 group-hover:text-white dark:group-hover:bg-orange-500">
                                        {category.icon}
                                    </div>
                                    <div>
                                        <h3 className="mb-1 text-lg font-semibold">
                                            {category.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {category.description}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function FeaturedPopularSection() {

    const markets = [
        {
            name: "Chicken",
            message: "Find Chicken, Broiler Buyers in Zimbabwe, Make Poultry Farming Profitable for You.",
            logo: logoChicken,
            link: "buyers/chicken"
        },
        {
            name: "Pork",
            message: "Find Pig, Pork, Porker Buyers in Zimbabwe, Make Livestock Farming Profitable for You.",
            logo: logoPig,
            link: "buyers/pork"
        },
        {
            name: "Onions",
            message: "Find Onion Buyers in Zimbabwe, Make Horticulture Farming Profitable for You.",
            logo: logoOnion,
            link: "buyers/onions"
        },
        {
            name: "Cattle",
            message: "Find Cattle Buyers in Zimbabwe, Make Ranching, Dairy, Livestock Farming Profitable for You.",
            logo: logoCattle,
            link: "buyers/cattle"
        },
        {
            name: "Tomatoes",
            message: "Find Tomato Buyers in Zimbabwe, Make Horticulture Farming Profitable for You.",
            logo: logoTomato,
            link: "buyers/tomatoes"
        },
        {
            name: "Chilli",
            message: "Find Chilli Buyers in Zimbabwe, Make Horticulture Farming Profitable for You.",
            logo: logoChilli,
            link: "buyers/chilli"
        },
    ]


    return (
        <div className="py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0">
                    <h2 className="mb-4 text-4xl font-bold leading-none tracking-tight sm:text-5xl font-heading">
                        Our most popular markets!
                    </h2>
                    <p className="mb-6 max-w-2xl text-lg text-muted-foreground md:mb-8">
                        These agri produce markets are the most searched for by farmers looking to sell, market their fresh produce.
                    </p>
                </div>
                <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:mt-12">
                    {markets.map((market) => (
                        <div
                            key={market.name}
                            className="relative flex items-center space-x-3 bg-card text-card-foreground shadow-sm rounded-lg  border border-zinc-100 p-6 dark:border-zinc-700/40 px-6 py-5 "
                        >
                            <div className="relative mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
                                <Image src={market.logo} alt="" className="h-7 w-7" unoptimized />
                            </div>
                            <div className="min-w-0 flex-1">
                                <Link href={market.link} className="focus:outline-none" onClick={() => sendGTMEvent({ event: "view", value: "FeaturedLink" })}>
                                    <span className="absolute inset-0" aria-hidden="true" />
                                    <p className="text-lg font-medium">{market.name}</p>
                                    <p className="text-base text-muted-foreground pt-1">{market.message}</p>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
