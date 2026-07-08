import { Skeleton } from "@/components/ui/skeleton"

export function ClientListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-8">
      <Skeleton className="h-[72px] w-full rounded-xl" />
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-80 mt-2" />
      </div>
      <ul role="list" className="divide-y">
        {Array.from({ length: count }).map((_, i) => (
          <li key={i} className="py-4 first:pt-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-5 w-20 rounded-md" />
              </div>
              <Skeleton className="h-4 w-72" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 mt-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-52" />
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-44" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
