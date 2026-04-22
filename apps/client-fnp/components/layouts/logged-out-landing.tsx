"use client"

import { sendGTMEvent } from "@next/third-parties/google"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function LoggedOutLanding() {
    return (
        <main>
            <div className="py-12 lg:py-16">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <div className="mb-6 inline-flex">
                            <Link href="/plant-nutrition-guides" onClick={() => sendGTMEvent({ event: "click", value: "PlantNutritionCTAHero" })}>
                                <div className="relative rounded-full px-3 py-1 text-sm leading-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white ring-2 ring-green-500/50 hover:ring-green-600 transition-all animate-pulse hover:animate-none hover:scale-105 shadow-lg hover:shadow-green-500/50">
                                    New! <span className="whitespace-nowrap font-semibold">Check Plant Nutrition Guides <span aria-hidden="true">&rarr;</span></span>
                                </div>
                            </Link>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl font-heading">Getting You To Market.</h1>
                        <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-8">
                            Its never been easier to pre plan your harvest sales, with fresh farm produce buyers at the tip of your fingers. Farmnport the best place to find buyers for your agriproduce.
                        </p>
                    </div>

                    {/* Bento Grid */}
                    <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6">
                        {/* For Farmers - Large Card */}
                        <div className="flex p-px lg:col-span-4 lg:row-span-2">
                            <div className="w-full overflow-hidden rounded-lg bg-card shadow outline outline-1 outline-black/5 max-lg:rounded-t-[2rem] lg:rounded-tl-[2rem] dark:shadow-none dark:outline-white/15">
                                <div className="p-10">
                                    <h3 className="text-sm/4 font-semibold text-muted-foreground">For Farmers</h3>
                                    <p className="mt-2 text-lg font-medium tracking-tight">Everything you need to succeed</p>
                                    <p className="mt-2 max-w-lg text-sm/6 text-muted-foreground">
                                        Feeding programs, animal health, market prices, and crop protection guides — all in one place.
                                    </p>
                                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {[
                                            { company: "Feeding Programs", title: "Structured feeding schedules for optimal livestock growth at every stage.", href: "/feeding-programs" },
                                            { company: "Animal Health Guides", title: "Vaccines, antibiotics, dips and nutrition supplements for your livestock.", href: "/guides" },
                                            { company: "Market Prices", title: "Real-time livestock pricing data to plan your sales and maximize profit.", href: "/prices" },
                                            { company: "Agrochemical Guides", title: "Crop protection products, herbicides, fungicides and insecticides.", href: "/guides" },
                                            { company: "Plant Nutrition", title: "Fertilizer and micronutrient guides to boost crop yields and soil health.", href: "/plant-nutrition-guides" },
                                        ].map((info, index) => (
                                            <Link key={index} href={info.href} className="flex items-start gap-3 rounded-md p-2 -m-2 hover:bg-muted transition-colors">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium">{info.company}</p>
                                                    <p className="text-xs text-muted-foreground">{info.title}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                    <div className="mt-4 sm:hidden">
                                        <Link href="/guides" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                            See more <span aria-hidden="true">&rarr;</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links Card */}
                        <div className="flex p-px lg:col-span-2 lg:row-span-2">
                            <div className="w-full overflow-hidden rounded-lg bg-card shadow outline outline-1 outline-black/5 lg:rounded-tr-[2rem] dark:shadow-none dark:outline-white/15">
                                <div className="p-6 h-full flex flex-col">
                                    <h3 className="text-sm/4 font-semibold text-muted-foreground mb-4">Explore Farmnport</h3>
                                    <div className="flex flex-col gap-1 flex-1 justify-between">
                                        {[
                                            { label: "Prices", href: "/prices" },
                                            { label: "Guides", href: "/guides" },
                                            { label: "Spray Programs", href: "/spray-programs" },
                                            { label: "Feed Programs", href: "/feeding-programs" },
                                            { label: "Feeds", href: "/feeds" },
                                            { label: "Buyers", href: "/buyers" },
                                            { label: "Farmers", href: "/farmers" },
                                        ].map(({ label, href }) => (
                                            <Link
                                                key={href}
                                                href={href}
                                                className="flex items-center justify-between py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors group -mx-1 px-1"
                                            >
                                                <span>{label}</span>
                                                <span className="text-muted-foreground group-hover:text-foreground transition-colors">→</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA Card - Full Width */}
                        <div className="flex p-px lg:col-span-6">
                            <div className="w-full overflow-hidden rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 shadow outline outline-1 outline-black/5 max-lg:rounded-b-[2rem] lg:rounded-b-[2rem] dark:shadow-none dark:outline-white/15">
                                <div className="px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <p className="text-base font-semibold tracking-tight">Join the platform</p>
                                        <p className="text-sm text-muted-foreground mt-0.5">Whether you&apos;re a farmer or a buyer — connect, trade, and grow.</p>
                                    </div>
                                    <Link href="/signup" className="shrink-0">
                                        <Button className="bg-orange-600 hover:bg-orange-700 text-white dark:bg-orange-500 dark:hover:bg-orange-600" onClick={() => sendGTMEvent({ event: "link", value: "SignupHeroNavigation" })}>
                                            Get Started
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <FeaturedPopularSection />
        </main>
    )
}


function FeaturedPopularSection() {
    const markets = [
        {
            name: "Chicken",
            message: "Find Chicken, Broiler Buyers in Zimbabwe, Make Poultry Farming Profitable for You.",
            link: "buyers/chicken"
        },
        {
            name: "Pork",
            message: "Find Pig, Pork, Porker Buyers in Zimbabwe, Make Livestock Farming Profitable for You.",
            link: "buyers/pork"
        },
        {
            name: "Onions",
            message: "Find Onion Buyers in Zimbabwe, Make Horticulture Farming Profitable for You.",
            link: "buyers/onions"
        },
        {
            name: "Cattle",
            message: "Find Cattle Buyers in Zimbabwe, Make Ranching, Dairy, Livestock Farming Profitable for You.",
            link: "buyers/cattle"
        },
        {
            name: "Tomatoes",
            message: "Find Tomato Buyers in Zimbabwe, Make Horticulture Farming Profitable for You.",
            link: "buyers/tomatoes"
        },
        {
            name: "Chilli",
            message: "Find Chilli Buyers in Zimbabwe, Make Horticulture Farming Profitable for You.",
            link: "buyers/chilli"
        },
    ]


    return (
        <div className="py-8 lg:py-10">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex items-baseline justify-between mb-5">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight font-heading">Popular Markets</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">Most searched produce markets by farmers in Zimbabwe.</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                    {markets.map((market) => (
                        <Link
                            key={market.name}
                            href={market.link}
                            className="flex flex-col gap-1 rounded-lg border bg-card text-card-foreground px-4 py-3 shadow-sm transition hover:border-orange-500 hover:shadow-md"
                            onClick={() => sendGTMEvent({ event: "view", value: "FeaturedLink" })}
                        >
                            <h3 className="text-sm font-semibold">{market.name}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">{market.message}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}

