"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { sendGTMEvent } from "@next/third-parties/google"

const BASE = (process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3744") + "/v1"

async function fetchTopics() {
  const res = await fetch(`${BASE}/resource-topics/`, { cache: "no-store" })
  if (!res.ok) return []
  const data = await res.json()
  return data.topics ?? []
}

async function fetchTopicWithArticles(slug: string) {
  const res = await fetch(`${BASE}/resource-topics/${slug}`, { cache: "no-store" })
  if (!res.ok) return null
  return res.json()
}

// Fallback hardcoded sections when no topics exist yet
const FALLBACK_SECTIONS = [
  {
    heading: "Get started as a farmer",
    resources: [
      { title: "How to list a lot", href: "/resources/article/how-to-list-a-lot", image: "" },
      { title: "How to create a booking", href: "/resources/article/how-to-create-a-booking", image: "" },
      { title: "How to find buyers", href: "/resources/article/how-to-find-buyers", image: "" },
      { title: "How to check market prices", href: "/resources/article/how-to-check-market-prices", image: "" },
    ],
  },
  {
    heading: "Grow your farm business",
    resources: [
      { title: "Using spray programs", href: "/resources/article/using-spray-programs", image: "" },
      { title: "Using feeding programs", href: "/resources/article/using-feeding-programs", image: "" },
      { title: "Buying farm plans", href: "/resources/article/buying-farm-plans", image: "" },
      { title: "Browsing agrochemical guides", href: "/resources/article/browsing-agrochemical-guides", image: "" },
    ],
  },
  {
    heading: "Buying on Farmnport",
    resources: [
      { title: "How to browse bookings", href: "/resources/article/how-to-browse-bookings", image: "" },
      { title: "How to bid on lots", href: "/resources/article/how-to-bid-on-lots", image: "" },
      { title: "How to find farmers", href: "/resources/article/how-to-find-farmers", image: "" },
      { title: "How to use guides to buy", href: "/resources/article/how-to-use-guides-to-buy", image: "" },
    ],
  },
]

function ResourceCard({ title, href, image }: { title: string; href: string; image: string }) {
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

const TAGS = ["Selling", "Buying", "Bookings", "Lots", "Prices", "Programs"]

export default function ResourcesPage() {
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const { data: topics } = useQuery({
    queryKey: ["resource-topics"],
    queryFn: fetchTopics,
    staleTime: 60000,
  })

  const hasTopics = topics && topics.length > 0

  return (
    <div className="min-h-screen">
      <div className="container py-10">

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">Resource Center</h1>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag.toLowerCase() ? null : tag.toLowerCase())}
                className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                  activeTag === tag.toLowerCase()
                    ? "bg-foreground text-background border-foreground"
                    : "text-muted-foreground hover:text-foreground hover:border-foreground"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-14">
          {hasTopics ? (
            topics.map((topic: any) => (
              <TopicSection key={topic.id} topic={topic} activeTag={activeTag} />
            ))
          ) : (
            FALLBACK_SECTIONS.map((section) => (
              <section key={section.heading}>
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                  <h2 className="text-xl sm:text-2xl font-bold">{section.heading}</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                  {section.resources.map((resource) => (
                    <ResourceCard key={resource.href} {...resource} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function TopicSection({ topic, activeTag }: { topic: any; activeTag: string | null }) {
  const { data } = useQuery({
    queryKey: ["resource-topic", topic.slug],
    queryFn: () => fetchTopicWithArticles(topic.slug),
    staleTime: 60000,
  })

  const allArticles = data?.articles ?? []
  const articles = activeTag
    ? allArticles.filter((a: any) => a.tags?.includes(activeTag))
    : allArticles

  if (activeTag && articles.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-4 border-b pb-2">
        <h2 className="text-xl sm:text-2xl font-bold">{topic.title}</h2>
        <Link href={`/resources/topic/${topic.slug}`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Show all
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {articles.length > 0 ? (
          articles.slice(0, 4).map((article: any) => (
            <ResourceCard
              key={article.id}
              title={article.title}
              href={`/resources/article/${article.slug}`}
              image={article.cover_image || ""}
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground col-span-4">No articles yet</p>
        )}
      </div>
    </section>
  )
}
