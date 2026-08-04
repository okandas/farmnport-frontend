import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-10" />
            <span className="mx-1 text-muted-foreground">/</span>
            <Skeleton className="h-4 w-32" />
            <span className="mx-1 text-muted-foreground">/</span>
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[480px_1fr_300px] gap-6 items-start">
          {/* Left - Image */}
          <div className="flex flex-col gap-4">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
          {/* Middle - Info */}
          <div className="space-y-5">
            <div>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-24 mt-2" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-24 rounded-md" />
              <Skeleton className="h-7 w-20 rounded-md" />
            </div>
            <div className="h-px bg-border" />
            <div>
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6 mt-1" />
              <Skeleton className="h-4 w-3/6 mt-1" />
            </div>
            {/* Tabs placeholder */}
            <div className="flex gap-4 border-b pb-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          </div>
          {/* Right - Price / Cart */}
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
            <div className="h-px bg-border" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}

