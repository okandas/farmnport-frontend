"use client"

import { use, useEffect, useRef } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"

import { querySprayProgram } from "@/lib/query"
import { SprayProgram } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { Placeholder } from "@/components/state/placeholder"
import { SprayProgramForm } from "@/components/structures/forms/sprayProgramForm"
import { handleFetchError } from "@/lib/error-handler"

interface EditSprayProgramPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function EditSprayProgramPage({ params }: EditSprayProgramPageProps) {
  const { slug } = use(params)
  const id = slug
  const url = `/dashboard/farmnport/spray-programs`

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["dashboard-spray-program", id],
    queryFn: () => querySprayProgram(id),
    refetchOnWindowFocus: false,
  })

  const sprayProgram = data?.data as SprayProgram

  const hasShownError = useRef(false)
  useEffect(() => {
    if (isError && !hasShownError.current) {
      hasShownError.current = true
      handleFetchError(error, {
        onRetry: () => {
          hasShownError.current = false
          refetch()
        },
        context: "spray program"
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
          <Placeholder.Title>Error Fetching Spray Program</Placeholder.Title>
          <Placeholder.Description>
            Error fetching spray program from the database
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
          <Placeholder.Title>Fetching Spray Program</Placeholder.Title>
          <Placeholder.Description>
            Fetching spray program from the database
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

      {sprayProgram !== undefined ? <SprayProgramForm sprayProgram={sprayProgram} mode="edit" /> : null}
    </>
  )
}
