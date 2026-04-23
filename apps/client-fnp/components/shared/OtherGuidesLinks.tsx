import Link from "next/link"
import { Beaker, Leaf, HeartPulse } from "lucide-react"

const guides = [
    {
        key: "agrochemical",
        label: "Agrochemical",
        href: "/agrochemical-guides",
        icon: Beaker,
    },
    {
        key: "plant-nutrition",
        label: "Plant Nutrition",
        href: "/plant-nutrition-guides",
        icon: Leaf,
    },
    {
        key: "animal-health",
        label: "Animal Health",
        href: "/animal-health-guides",
        icon: HeartPulse,
    },
]

export function OtherGuidesLinks({ current }: { current: "agrochemical" | "plant-nutrition" | "animal-health" }) {
    const others = guides.filter(g => g.key !== current)

    return (
        <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="text-xs text-muted-foreground mr-1 shrink-0">Other guides:</span>
            {others.map(guide => {
                const Icon = guide.icon
                return (
                    <Link
                        key={guide.key}
                        href={guide.href}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-background hover:bg-muted transition-colors"
                    >
                        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                        {guide.label}
                    </Link>
                )
            })}
        </div>
    )
}
