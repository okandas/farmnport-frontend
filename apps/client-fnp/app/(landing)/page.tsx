"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function LandingPage() {

    return (
        <main>
            <Tabs defaultValue="farmers">
                <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8">
                    <div className="px-6 pb-24 pt-3 sm:pb-32 lg:col-span-7 lg:px-0 lg:pb-16 lg:pt-7 xl:col-span-6">
                        <div className="mx-auto max-w-2xl lg:mx-0">

                            <div className="mt-12 mb-8 sm:mt-32 sm:flex lg:mt-16">
                                <div className="relative rounded-full px-3 py-1 text-sm leading-6 ring-1 ring-orange-300 hover:ring-900/20">
                                    See <a href="#" className="whitespace-nowrap font-semibold text-orange-600">What's new!? <span aria-hidden="true">&rarr;</span></a>
                                </div>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight sm:mt-10 sm:text-6xl font-heading">Getting You To Market.</h1>
                            <p className="mt-6 leading-normal text-muted-foreground sm:text-xl sm:leading-8">Its never been easier to plan your harvest sales, with fresh farm produce buyers at the tip of your fingers. Farmnport the best pace to find buyers for your agriproduce.</p>
                            <div className="mt-10 flex items-center gap-x-6">
                                <TabsList className="">
                                    <TabsTrigger value="farmers"><span className="mr-1">For Farmers</span>  <span aria-hidden="true">&rarr;</span></TabsTrigger>
                                    <TabsTrigger value="buyers">See Buyers</TabsTrigger>
                                </TabsList>
                            </div>
                        </div>
                    </div>
                    <div className="relative lg:col-span-5 lg:-mr-8 ">
                        <TabsContent value="farmers"></TabsContent>
                        <TabsContent value="buyers"></TabsContent>
                    </div>
                </div>
            </Tabs>

        </main>
    )
}
