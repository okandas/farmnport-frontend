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
                <ol className="space-y-1.5 list-none">
                    {targets.map((target, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                            <span className="text-xs font-semibold text-green-600 dark:text-green-400 tabular-nums mt-0.5 min-w-[1.25rem]">
                                {idx + 1}.
                            </span>
                            <span>
                                <span className="capitalize">{target.name}</span>
                                {target.scientific_name && (
                                    <span className="text-xs text-muted-foreground italic ml-1">({target.scientific_name})</span>
                                )}
                            </span>
                        </li>
                    ))}
                </ol>
            ) : (
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            )}
        </div>
    )
}
