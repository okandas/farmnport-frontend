"use client"

import { parseAsStringLiteral, useQueryState } from "nuqs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PriceCardsView } from "@/components/structures/price-cards-view"
import { PricesByProduceView } from "@/components/structures/prices-by-produce-view"
import { PricesSearchView } from "@/components/structures/prices-search-view"

const tabOptions = ["all", "by-produce", "search"] as const

export function PriceViewTabs() {
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsStringLiteral(tabOptions).withDefault("all")
  )

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="all">All Prices</TabsTrigger>
        <TabsTrigger value="by-produce">By Produce</TabsTrigger>
        <TabsTrigger value="search">Search</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-0">
        <PriceCardsView />
      </TabsContent>

      <TabsContent value="by-produce" className="mt-0">
        <PricesByProduceView />
      </TabsContent>

      <TabsContent value="search" className="mt-0">
        <PricesSearchView />
      </TabsContent>
    </Tabs>
  )
}
