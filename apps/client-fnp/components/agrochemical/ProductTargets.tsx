interface Target {
    name: string
    scientific_name?: string
}

interface ProductTargetsProps {
    title: string
    targets: Target[]
    emptyMessage: string
}

export function ProductTargets({ title, targets, emptyMessage }: ProductTargetsProps) {
    return (
        <div className="rounded-xl border bg-card p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-green-700 dark:text-green-400 mb-3">
                {title}
            </h2>
            {targets && targets.length > 0 ? (
                <ul className="space-y-1.5">
                    {targets.map((target, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-green-400 flex-shrink-0 mt-1.5" />
                            <span>
                                <span className="capitalize">{target.name}</span>
                                {target.scientific_name && (
                                    <span className="text-xs text-muted-foreground italic ml-1">({target.scientific_name})</span>
                                )}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            )}
        </div>
    )
}
