import Link from "next/link"

interface ProductNotFoundLink {
    href: string
    label: string
}

interface ProductNotFoundProps {
    title: string
    description: string
    primary: ProductNotFoundLink
    secondary?: ProductNotFoundLink
}

export function ProductNotFound({ title, description, primary, secondary }: ProductNotFoundProps) {
    return (
        <div className="h-[70vh] bg-background flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <h2 className="text-2xl font-semibold mb-2">{title}</h2>
                <p className="text-muted-foreground mb-6">{description}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href={primary.href} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 transition-colors">
                        {primary.label}
                    </Link>
                    {secondary && (
                        <Link href={secondary.href} className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 transition-colors">
                            {secondary.label}
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
