import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utilities"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Skeleton } from "@/components/ui/skeleton"
import { Icons } from "@/components/icons/lucide"

interface PlaceholderImageProps
    extends React.ComponentPropsWithoutRef<typeof AspectRatio> {
    isSkeleton?: boolean
    asChild?: boolean
}

export function PlaceholderImage({
    isSkeleton = false,
    asChild = false,
    className,
    ...props
}: PlaceholderImageProps) {
    const Comp = asChild ? Slot : AspectRatio

    return (
        <Comp
            ratio={16 / 9}
            {...props}
            className={cn("overflow-hidden rounded-lg", className)}
        >
            <Skeleton
                aria-label="Placeholder"
                role="img"
                aria-roledescription="placeholder"
                className={cn(
                    "flex h-full w-full items-center justify-center",
                    isSkeleton ? "animate-pulse" : "animate-none"
                )}
            >
                <Icons.image
                    className="h-9 w-9 text-muted-foreground"
                    aria-hidden="true"
                />
            </Skeleton>
        </Comp>
    )
}