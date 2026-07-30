import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

const BASE = (process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3744") + "/v1"

async function getTopic(slug: string) {
  const res = await fetch(`${BASE}/resource-topics/${slug}`, { cache: "no-store" })
  if (!res.ok) return null
  return res.json()
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getTopic(slug)
  if (!data?.topic) return { title: "Topic Not Found" }
  return {
    title: `${data.topic.title} — Resources | farmnport.com`,
    description: data.topic.description,
  }
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getTopic(slug)

  if (!data?.topic) notFound()

  const topic = data.topic
  const articles = data.articles ?? []

  return (
    <div className="min-h-screen">
      <div className="container py-10">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/resources" className="hover:text-foreground transition-colors">Resources</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{topic.title}</span>
        </nav>

        <h1 className="text-3xl font-bold tracking-tight mb-2">{topic.title}</h1>
        {topic.description && (
          <p className="text-base text-muted-foreground mb-10">{topic.description}</p>
        )}

        {articles.length === 0 ? (
          <p className="text-sm text-muted-foreground py-16 text-center">No articles in this topic yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {articles.map((article: any) => (
              <Link key={article.id} href={`/resources/article/${article.slug}`} className="group block">
                <div className="aspect-[4/3] relative rounded-xl overflow-hidden bg-muted/30 mb-2">
                  {article.cover_image && (
                    <Image
                      src={article.cover_image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  )}
                </div>
                <p className="text-sm font-medium">{article.title}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
