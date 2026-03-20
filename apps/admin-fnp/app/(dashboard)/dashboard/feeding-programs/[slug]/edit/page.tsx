"use client"

import { use, useEffect, useRef } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"

import { queryFeedingProgram } from "@/lib/query"
import { FeedingProgram } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { Placeholder } from "@/components/state/placeholder"
import { FeedingProgramForm } from "@/components/structures/forms/feedingProgramForm"
import { handleFetchError } from "@/lib/error-handler"

interface EditFeedingProgramPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function EditFeedingProgramPage({ params }: EditFeedingProgramPageProps) {
  const { slug } = use(params)
  const id = slug
  const url = `/dashboard/feeding-programs`

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["dashboard-feeding-program", id],
    queryFn: () => queryFeedingProgram(id),
    refetchOnWindowFocus: false,
  })

  const feedingProgram = data?.data as FeedingProgram

  const hasShownError = useRef(false)
  useEffect(() => {
    if (isError && !hasShownError.current) {
      hasShownError.current = true
      handleFetchError(error, {
        onRetry: () => {
          hasShownError.current = false
          refetch()
        },
        context: "feeding program"
      })
    }
    if (!isError) {
      hasShownError.current = false
    }
  }, [isError, error, refetch])

  if (isError) {
    return (
      <div className="mt-20">
        <Placeholder>
          <Placeholder.Icon name="close" />
          <Placeholder.Title>Error Fetching Feeding Program</Placeholder.Title>
          <Placeholder.Description>
            Error fetching feeding program from the database
          </Placeholder.Description>
        </Placeholder>
      </div>
    )
  }

  if (isLoading || isFetching) {
    return (
      <div className="mt-20">
        <Placeholder>
          <Placeholder.Icon name="search" />
          <Placeholder.Title>Fetching Feeding Program</Placeholder.Title>
          <Placeholder.Description>
            Fetching feeding program from the database
          </Placeholder.Description>
        </Placeholder>
      </div>
    )
  }

  return (
    <>
      <div className={"absolute right-10 top-8"}>
        <Link href={url} className={cn(buttonVariants({ variant: "link" }))}>
          <>
            <Icons.close className="w-4 h-4 mr-2" />
            Close
          </>
        </Link>
      </div>

      {feedingProgram !== undefined ? <FeedingProgramForm feedingProgram={feedingProgram} mode="edit" /> : null}
    </>
  )
}
