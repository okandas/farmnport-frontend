import Link from "next/link"

const guides = [
    { key: "agrochemical", label: "Agrochemical", href: "/agrochemical-guides" },
    { key: "plant-nutrition", label: "Plant Nutrition", href: "/plant-nutrition-guides" },
    { key: "animal-health", label: "Animal Health", href: "/animal-health-guides" },
    { key: "animal-nutrition", label: "Animal Nutrition", href: "/feeds" },
]

export function OtherGuidesLinks({ current }: { current: "agrochemical" | "plant-nutrition" | "animal-health" | "animal-nutrition" }) {
    const others = guides.filter(g => g.key !== current)

    return (
        <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="text-xs text-muted-foreground mr-1 shrink-0">Other guides:</span>
            {others.map(guide => (
                <Link
                    key={guide.key}
                    href={guide.href}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-background hover:bg-muted transition-colors"
                >
                    {guide.label}
                </Link>
            ))}
        </div>
    )
}
