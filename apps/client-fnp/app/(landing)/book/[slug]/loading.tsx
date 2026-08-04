import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-10" />
            <span className="mx-1 text-muted-foreground">/</span>
            <Skeleton className="h-4 w-28" />
            <span className="mx-1 text-muted-foreground">/</span>
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-9 w-2/3 mb-2" />
        <Skeleton className="h-4 w-24 mb-6" />
        <div className="h-px bg-border mb-6" />
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-64 w-full rounded-xl mt-4" />
            <Skeleton className="h-4 w-full mt-4" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-full rounded-md mt-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

