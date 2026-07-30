"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { sendGTMEvent } from "@next/third-parties/google"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"

const BASE = (process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3744") + "/v1"

async function fetchArticle(slug: string) {
  const res = await fetch(`${BASE}/resource-articles/${slug}`, { cache: "no-store" })
  if (!res.ok) return null
  const data = await res.json()
  return data.article
}

function RenderBlock({ block }: { block: any }) {
  switch (block.type) {
    case "header":
      const Tag = `h${block.data.level || 2}` as keyof JSX.IntrinsicElements
      return <Tag className="font-bold mt-6 mb-3">{block.data.text}</Tag>
    case "paragraph":
      return <p className="text-base leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: block.data.text }} />
    case "list":
      const ListTag = block.data.style === "ordered" ? "ol" : "ul"
      return (
        <ListTag className={`mb-4 pl-6 space-y-1 ${block.data.style === "ordered" ? "list-decimal" : "list-disc"}`}>
          {block.data.items.map((item: string, i: number) => (
            <li key={i} className="text-base" dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ListTag>
      )
    case "image":
      return (
        <figure className="my-6">
          <div className="relative rounded-xl overflow-hidden">
            <img src={block.data.file?.url || block.data.url} alt={block.data.caption || ""} className="w-full rounded-xl" />
          </div>
          {block.data.caption && (
            <figcaption className="text-xs text-muted-foreground mt-2 text-center">{block.data.caption}</figcaption>
          )}
        </figure>
      )
    case "delimiter":
      return <hr className="my-8 border-border" />
    case "quote":
      return (
        <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 italic text-muted-foreground">
          <p>{block.data.text}</p>
          {block.data.caption && <cite className="text-xs mt-1 block">— {block.data.caption}</cite>}
        </blockquote>
      )
    case "checklist":
      return (
        <div className="mb-4 space-y-1">
          {block.data.items.map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-base">
              <span className={`text-sm ${item.checked ? "text-primary" : "text-muted-foreground"}`}>
                {item.checked ? "☑" : "☐"}
              </span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      )
    case "embed":
      return (
        <div className="my-6">
          <iframe src={block.data.embed} className="w-full aspect-video rounded-xl" allowFullScreen />
          {block.data.caption && <p className="text-xs text-muted-foreground mt-2 text-center">{block.data.caption}</p>}
        </div>
      )
    default:
      return null
  }
}

export default function ArticlePage() {
  const params = useParams()
  const slug = params.slug as string

  const { data: article, isLoading } = useQuery({
    queryKey: ["resource-article", slug],
    queryFn: () => fetchArticle(slug),
    enabled: !!slug,
  })

  useEffect(() => {
    if (article) {
      sendGTMEvent({ event: "resource_view", article_title: article.title, article_slug: article.slug })
    }
  }, [article])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Article not found</p>
      </div>
    )
  }

  const blocks = article.content?.blocks ?? []

  return (
    <div className="min-h-screen">
      <div className="container py-10">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/resources" className="hover:text-foreground transition-colors">Resources</Link>
          <span>/</span>
          {article.topic_title && (
            <>
              <Link href={`/resources/topic/${article.slug?.split("-").slice(0, 3).join("-")}`} className="hover:text-foreground transition-colors">
                {article.topic_title}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground font-medium">{article.title}</span>
        </nav>

        {/* Cover image */}
        {article.cover_image && (
          <div className="relative aspect-[3/1] rounded-2xl overflow-hidden mb-8">
            <Image src={article.cover_image} alt={article.title} fill className="object-cover" sizes="100vw" />
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{article.title}</h1>
          {article.description && (
            <p className="text-lg text-muted-foreground mb-8">{article.description}</p>
          )}

          {/* Editor.js content blocks */}
          <div className="prose-content">
            {blocks.map((block: any, i: number) => (
              <RenderBlock key={i} block={block} />
            ))}
          </div>

          {/* Tags */}
          {article.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t">
              {article.tags.map((tag: string) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
