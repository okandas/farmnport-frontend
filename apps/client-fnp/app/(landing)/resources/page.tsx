"use client"

import Link from "next/link"
import Image from "next/image"
import { sendGTMEvent } from "@next/third-parties/google"

interface Resource {
  title: string
  href: string
  image: string
}

const SECTIONS = [
  {
    heading: "Get started as a farmer",
    resources: [
      { title: "How to list a lot", href: "/sell", image: "" },
      { title: "How to create a booking", href: "/bookings/new", image: "" },
      { title: "How to find buyers", href: "/buyers", image: "" },
      { title: "How to check market prices", href: "/prices", image: "" },
    ],
  },
  {
    heading: "Grow your farm business",
    resources: [
      { title: "Using spray programs", href: "/spray-programs", image: "" },
      { title: "Using feeding programs", href: "/feeding-programs", image: "" },
      { title: "Buying farm plans", href: "/buy-documents", image: "" },
      { title: "Browsing agrochemical guides", href: "/agrochemical-guides", image: "" },
    ],
  },
  {
    heading: "Buying on Farmnport",
    resources: [
      { title: "How to browse bookings", href: "/bookings", image: "" },
      { title: "How to bid on lots", href: "/lots", image: "" },
      { title: "How to find farmers", href: "/farmers", image: "" },
      { title: "Buying plant nutrition", href: "/buy-plant-nutrition", image: "" },
    ],
  },
]

function ResourceCard({ title, href, image }: Resource) {
  return (
    <Link
      href={href}
      className="group block"
      onClick={() => sendGTMEvent({ event: "resource_click", resource_title: title, resource_href: href })}
    >
      <div className="aspect-[4/3] relative rounded-xl overflow-hidden bg-muted/30 mb-2">
        {image && (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
          />
        )}
      </div>
      <p className="text-sm font-medium">{title}</p>
    </Link>
  )
}

export default function ResourcesPage() {
  return (
    <div className="min-h-screen">
      <div className="container py-10">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">Resource Center</h1>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {["Selling", "Buying", "Bookings", "Lots", "Prices", "Programs"].map((tag) => (
              <span key={tag} className="px-4 py-1.5 rounded-full border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-14">
          {SECTIONS.map((section) => (
            <section key={section.heading}>
              <div className="flex items-center justify-between mb-4 border-b pb-2">
                <h2 className="text-xl sm:text-2xl font-bold">{section.heading}</h2>
                <span className="text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Show all</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                {section.resources.map((resource) => (
                  <ResourceCard key={resource.href} {...resource} />
                ))}
              </div>
            </section>
          ))}
        </div>

      </div>
    </div>
  )
}
