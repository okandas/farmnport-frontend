import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-10" />
            <span className="mx-1 text-muted-foreground">/</span>
            <Skeleton className="h-4 w-32" />
            <span className="mx-1 text-muted-foreground">/</span>
            <Skeleton className="h-4 w-20" />
            <span className="mx-1 text-muted-foreground">/</span>
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="grid lg:grid-cols-[450px,1fr] gap-12 mb-16">
          {/* Left - Image */}
          <div className="flex flex-col gap-4">
            <Skeleton className="aspect-square w-full rounded-xl" />
          </div>

          {/* Right - Product Info */}
          <div className="space-y-6">
            {/* Title + Brand */}
            <div>
              <Skeleton className="h-9 w-3/4" />
              <Skeleton className="h-4 w-24 mt-2" />
            </div>

            {/* Category badge */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>

            <div className="h-px bg-border" />

            {/* Overview */}
            <div>
              <Skeleton className="h-6 w-24 mb-3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6 mt-1" />
              <Skeleton className="h-4 w-4/6 mt-1" />
            </div>

            {/* Active Ingredients */}
            <div>
              <Skeleton className="h-6 w-36 mb-3" />
              <Skeleton className="h-4 w-48 mt-1" />
            </div>

            {/* Used On & Targets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border bg-card p-4">
                <Skeleton className="h-4 w-16 mb-3" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-24" />
                  ))}
                </div>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <Skeleton className="h-4 w-28 mb-3" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-32" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
