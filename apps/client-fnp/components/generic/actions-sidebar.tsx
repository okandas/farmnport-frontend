"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { sendGTMEvent } from "@next/third-parties/google"

interface ActionsSidebarProps {
  type?: "buyers" | "farmers"
  product?: string
  showPremiumCTA?: boolean
}

type ActionItem = {
  title: string
  description: string
  cta: string
  href: string
  event: string
  bg: string
  border: string
  button: string
}

const productActions: Record<string, ActionItem[]> = {
  chicken: [
    {
      title: "Order New Chicks Online",
      description: "Source day-old chicks and point-of-lay hens from trusted hatcheries across Zimbabwe.",
      cta: "Join Waiting List",
      href: "/waiting-list",
      event: "ActionOrderChicks",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "border-emerald-200 dark:border-emerald-800/50",
      button: "bg-emerald-600 hover:bg-emerald-700",
    },
    {
      title: "Poultry Feed Programs",
      description: "Broiler, layer and free-range feeding programs to maximise growth and production.",
      cta: "View Feed Programs",
      href: "/feeding-programs",
      event: "ActionPoultryFeedPrograms",
      bg: "bg-sky-50 dark:bg-sky-950/30",
      border: "border-sky-200 dark:border-sky-800/50",
      button: "bg-sky-600 hover:bg-sky-700",
    },
  ],
  cattle: [
    {
      title: "Cattle Health Products",
      description: "Browse dips, vaccines and supplements for your herd.",
      cta: "View Products",
      href: "/agrochemical-guides/all",
      event: "ActionCattleHealth",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      border: "border-amber-200 dark:border-amber-800/50",
      button: "bg-amber-600 hover:bg-amber-700",
    },
  ],
  pork: [
    {
      title: "Pig Health Guides",
      description: "Deworming, vaccines and feed supplements for pig farming.",
      cta: "View Guides",
      href: "/agrochemical-guides/all",
      event: "ActionPigHealth",
      bg: "bg-rose-50 dark:bg-rose-950/30",
      border: "border-rose-200 dark:border-rose-800/50",
      button: "bg-rose-600 hover:bg-rose-700",
    },
  ],
}

const categoryProducts: Record<string, string[]> = {
  "meat & poultry": ["chicken", "cattle", "pork"],
}

export function ActionsSidebar({type = "buyers", product, showPremiumCTA = true}: ActionsSidebarProps) {
  const searchParams = useSearchParams()

  let actions: ActionItem[] | undefined

  if (product) {
    actions = productActions[product.toLowerCase()]
  } else {
    const category = searchParams.get("category")
    if (category) {
      const products = categoryProducts[category.toLowerCase()]
      if (products) {
        actions = products.flatMap(p => productActions[p] || []).slice(0, 2)
      }
    }
  }

  return (
    <aside className="mt-[21px] space-y-6">
      {actions?.map((action) => (
        <div key={action.event} className={`${action.bg} border-2 ${action.border} rounded-lg p-6`}>
          <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {action.description}
          </p>
          <Link
            href={action.href}
            className={`block w-full ${action.button} text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm text-center`}
            onClick={() => sendGTMEvent({ event: "click", value: action.event })}
          >
            {action.cta}
          </Link>
        </div>
      ))}

      {/* {showPremiumCTA && (
        <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Unlock Premium Features</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get direct contact information and connect with {type === "buyers" ? "buyers" : "sellers"} instantly.
          </p>
          <Link
            href="/pricing"
            className="block w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm text-center"
          >
            Subscribe
          </Link>
        </div>
      )} */}
    </aside>
  )
}
