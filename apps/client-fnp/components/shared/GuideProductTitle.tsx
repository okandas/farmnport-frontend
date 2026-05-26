interface GuideProductTitleProps {
    name: string
    brand?: string | null
}

export function GuideProductTitle({ name, brand }: GuideProductTitleProps) {
    return (
        <div>
            <h1 className="text-3xl lg:text-4xl font-bold capitalize leading-tight">
                {name}
            </h1>
            {brand && (
                <p className="text-sm text-muted-foreground mt-1 capitalize">{brand}</p>
            )}
        </div>
    )
}
