"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { sendGTMEvent } from "@next/third-parties/google"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { BaseURL } from "@/lib/schemas"

async function fetchArticle(slug: string) {
  const res = await fetch(`${BaseURL}/resource-articles/${slug}`, { cache: "no-store" })
  if (!res.ok) return null
  const data = await res.json()
  return data.article
}

function TopicNav({ currentSlug, topicTitle }: { currentSlug: string; topicTitle: string }) {
  const { data: topicsData } = useQuery({
    queryKey: ["resource-topics-nav"],
    queryFn: async () => {
      const res = await fetch(`${BaseURL}/resource-topics/`, { cache: "no-store" })
      if (!res.ok) return []
      const data = await res.json()
      return data.topics ?? []
    },
    staleTime: 60000,
  })

  const topics = topicsData ?? []

  return (
    <nav className="space-y-3">
      {topics.map((topic: any) => (
        <Link
          key={topic.id}
          href={`/resources/topic/${topic.slug}`}
          className={`block text-sm font-semibold py-2 px-3 rounded transition-colors ${
            topic.title === topicTitle
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          {topic.title}
        </Link>
      ))}
    </nav>
  )
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
}

function RenderBlock({ block }: { block: any }) {
  switch (block.type) {
    case "header": {
      const level = block.data.level || 2
      const cls = level === 2 ? "text-2xl sm:text-3xl font-bold mt-10 mb-4" : "text-xl font-bold mt-8 mb-3"
      return <div className={cls} dangerouslySetInnerHTML={{ __html: block.data.text }} />
    }
    case "paragraph":
      return <p className="text-base sm:text-lg leading-relaxed mb-4 text-muted-foreground" dangerouslySetInnerHTML={{ __html: block.data.text }} />
    case "list": {
      const Tag = block.data.style === "ordered" ? "ol" : "ul"
      return (
        <Tag className={`mb-6 pl-6 space-y-2 ${block.data.style === "ordered" ? "list-decimal" : "list-disc"}`}>
          {block.data.items.map((item: string, i: number) => (
            <li key={i} className="text-base sm:text-lg leading-relaxed text-muted-foreground" dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </Tag>
      )
    }
    case "image":
      return (
        <figure className="my-8">
          <img src={block.data.file?.url || block.data.url} alt={block.data.caption || ""} className="w-full" />
          {block.data.caption && (
            <figcaption className="text-sm text-muted-foreground mt-3 italic">{block.data.caption}</figcaption>
          )}
        </figure>
      )
    case "delimiter":
      return <hr className="my-10 border-border" />
    case "quote":
      return (
        <blockquote className="border-l-4 border-foreground pl-6 py-2 my-6">
          <p className="text-lg font-medium">{block.data.text}</p>
          {block.data.caption && <cite className="text-sm text-muted-foreground mt-2 block">— {block.data.caption}</cite>}
        </blockquote>
      )
    case "checklist":
      return (
        <div className="mb-6 space-y-2">
          {block.data.items.map((item: any, i: number) => (
            <div key={i} className="flex items-start gap-3 text-base sm:text-lg">
              <span className={`mt-1 ${item.checked ? "text-primary" : "text-muted-foreground"}`}>
                {item.checked ? "✓" : "○"}
              </span>
              <span className="text-muted-foreground">{item.text}</span>
            </div>
          ))}
        </div>
      )
    case "embed":
      return (
        <div className="my-8">
          <iframe src={block.data.embed} className="w-full aspect-video" allowFullScreen />
          {block.data.caption && <p className="text-sm text-muted-foreground mt-3 italic">{block.data.caption}</p>}
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
      <div className="container py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-10">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>›</span>
          {article.topic_title && (
            <>
              <Link href="/resources" className="hover:text-foreground transition-colors">{article.topic_title}</Link>
              <span>›</span>
            </>
          )}
          <span className="text-muted-foreground">{article.title}</span>
        </nav>

        <div className="lg:flex lg:gap-12">
        {/* Left — article content */}
        <div className="flex-1 min-w-0 max-w-2xl">
          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-4">
            {article.title}
          </h1>

          {/* Description */}
          {article.description && (
            <p className="text-xl sm:text-2xl text-muted-foreground leading-snug mb-6">
              {article.description}
            </p>
          )}

          {/* Author + date */}
          <p className="text-sm text-muted-foreground mb-4">
            By Farmnport on {formatDate(article.created)}
          </p>

          {/* Share icons */}
          <div className="flex items-center gap-3 mb-10">
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://farmnport.com/resources/article/${article.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Share on LinkedIn"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://farmnport.com/resources/article/${article.slug}`)}&text=${encodeURIComponent(article.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Share on X"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://farmnport.com/resources/article/${article.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Share on Facebook"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          </div>

          {/* Cover image */}
          {article.cover_image && (
            <div className="mb-10">
              <img src={article.cover_image} alt={article.title} className="w-full" />
            </div>
          )}

          {/* Editor.js content blocks */}
          {blocks.map((block: any, i: number) => (
            <RenderBlock key={i} block={block} />
          ))}

          {/* Tags */}
          {article.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t">
              {article.tags.map((tag: string) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Right — topic navigation sidebar */}
        <aside className="hidden lg:block lg:w-64 shrink-0">
          <div className="sticky top-20">
            <TopicNav currentSlug={slug} topicTitle={article.topic_title} />
          </div>
        </aside>
        </div>
      </div>
    </div>
  )
}
