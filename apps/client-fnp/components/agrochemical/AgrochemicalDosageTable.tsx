import React from "react"
import { formatUnit } from "@/lib/utilities"

interface AgrochemicalDosageTableProps {
    dosageRates: any[]
}

export function AgrochemicalDosageTable({ dosageRates }: AgrochemicalDosageTableProps) {
    if (!dosageRates || dosageRates.length === 0) return null

    const grouped = new Map<string, any[]>()
    const ungrouped: any[] = []

    dosageRates.forEach((rate: any) => {
        if (rate.crop_group_id) {
            const existing = grouped.get(rate.crop_group_id) || []
            existing.push(rate)
            grouped.set(rate.crop_group_id, existing)
        } else {
            ungrouped.push(rate)
        }
    })

    const renderTargetGrid = (targets: string[]) => (
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            {targets.map((t: string, i: number) => {
                const parenIdx = t.indexOf(" (")
                const mainName = parenIdx > -1 ? t.slice(0, parenIdx) : t
                const sciName = parenIdx > -1 ? t.slice(parenIdx) : ""
                return (
                    <div key={i} className="text-sm flex items-start gap-1">
                        <span className="h-1 w-1 mt-1.5 rounded-full bg-muted-foreground/50 flex-shrink-0" />
                        <span>
                            <span className="text-foreground">{mainName}</span>
                            {sciName && <span className="text-muted-foreground text-xs">{sciName}</span>}
                        </span>
                    </div>
                )
            })}
        </div>
    )

    const renderEntryRows = (rate: any, rateKey: string, cropCell: React.ReactNode, targetCell: React.ReactNode) => {
        const entries = rate.entries || []
        const lastIdx = entries.length - 1
        return entries.map((entry: any, entryIdx: number) => (
            <tr key={`${rateKey}-${entryIdx}`} className={`hover:bg-muted/30 transition-colors ${entryIdx === 0 ? "border-t border-border" : ""} ${entryIdx === lastIdx ? "border-b border-border" : ""}`}>
                <td className="p-3 align-top">{entryIdx === 0 ? cropCell : null}</td>
                <td className="p-3 align-top">{entryIdx === 0 ? targetCell : null}</td>
                <td className="p-3 align-top">
                    <div className="font-bold text-blue-600 dark:text-blue-400 text-base">
                        {entry.dosage.value} {formatUnit(entry.dosage.unit)}
                    </div>
                    <div className="text-xs text-muted-foreground">per {entry.dosage.per}</div>
                </td>
                <td className="p-3 align-top">
                    <div className="font-semibold text-orange-700 dark:text-orange-300">{entry.max_applications.max > 0 ? entry.max_applications.max : "—"}</div>
                    {entry.max_applications.note && entry.max_applications.note.trim() !== '' && (
                        <div className="text-xs text-muted-foreground mt-1">{entry.max_applications.note}</div>
                    )}
                </td>
                <td className="p-3 align-top">
                    <div className="font-semibold text-teal-700 dark:text-teal-300 text-sm">{entry.application_interval}</div>
                </td>
                <td className="p-3 align-top">
                    <div className="font-semibold text-rose-700 dark:text-rose-300 text-sm">{entry.phi}</div>
                </td>
                <td className="p-3 align-top">
                    {entry.remarks && entry.remarks.length > 0 ? (
                        <ul className="space-y-1">
                            {entry.remarks.map((remark: string, remarkIdx: number) => (
                                <li key={remarkIdx} className="text-xs text-foreground flex items-start gap-1.5">
                                    <span className="h-1 w-1 mt-1.5 rounded-full bg-foreground/50 flex-shrink-0" />
                                    <span className="flex-1">{remark}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <span className="text-xs text-muted-foreground">&mdash;</span>
                    )}
                </td>
            </tr>
        ))
    }

    const targetGrouped = new Map<string, any[]>()
    const targetOrder: string[] = []
    ungrouped.forEach((rate: any) => {
        const key = Array.isArray(rate.targets) ? rate.targets.slice().sort().join("|") : ""
        if (!targetGrouped.has(key)) {
            targetGrouped.set(key, [])
            targetOrder.push(key)
        }
        targetGrouped.get(key)!.push(rate)
    })

    return (
        <div className="mb-12">
            <h2 id="dosage-guide" className="sticky top-16 z-10 text-2xl font-bold py-4 text-foreground bg-background">Dosage Rates & Application Guide</h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-b-2 border-blue-200 dark:border-blue-800">
                            <th className="text-left p-3 text-sm font-semibold text-blue-900 dark:text-blue-100 min-w-[120px]">Crop</th>
                            <th className="text-left p-3 text-sm font-semibold text-blue-900 dark:text-blue-100 min-w-[180px]">Target</th>
                            <th className="text-left p-3 text-sm font-semibold text-blue-900 dark:text-blue-100 min-w-[140px]">Dosage</th>
                            <th className="text-left p-3 text-sm font-semibold text-orange-700 dark:text-orange-300 min-w-[120px] whitespace-nowrap">Max Applications</th>
                            <th className="text-left p-3 text-sm font-semibold text-teal-700 dark:text-teal-300 min-w-[130px] whitespace-nowrap">Application Interval</th>
                            <th className="text-left p-3 text-sm font-semibold text-rose-700 dark:text-rose-300 min-w-[60px]">PHI</th>
                            <th className="text-left p-3 text-sm font-semibold text-blue-900 dark:text-blue-100 min-w-[180px]">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from(grouped.entries()).map(([groupId, rates]) => {
                            const firstRate = rates[0]
                            const cropCell = (
                                <div>
                                    <div className="font-semibold text-sm text-blue-700 dark:text-blue-300">{firstRate.crop_group}</div>
                                    <div className="mt-1 space-y-0.5">
                                        {rates.map((r: any, idx: number) => (
                                            <div key={idx} className="text-xs text-muted-foreground capitalize flex items-start gap-1">
                                                <span className="h-1 w-1 mt-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                                <span className="flex-1">{r.crop}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                            return renderEntryRows(firstRate, `group-${groupId}`, cropCell, renderTargetGrid(firstRate.targets || []))
                        })}

                        {targetOrder.map((targetKey, tgIdx) => {
                            const rates = targetGrouped.get(targetKey)!
                            if (rates.length === 1) {
                                const rate = rates[0]
                                const cropCell = (
                                    <div>
                                        <div className="font-semibold capitalize text-sm text-foreground">{rate.crop_group || rate.crop}</div>
                                        {!rate.crop_group && rate.category_name && (
                                            <div className="text-xs text-muted-foreground mt-0.5">{rate.category_name}</div>
                                        )}
                                    </div>
                                )
                                return renderEntryRows(rate, `tg-${tgIdx}`, cropCell, renderTargetGrid(rate.targets || []))
                            }
                            return rates.map((rate: any, rateIdx: number) => {
                                const cropCell = (
                                    <div>
                                        <div className="font-semibold capitalize text-sm text-foreground">{rate.crop_group || rate.crop}</div>
                                        {!rate.crop_group && rate.category_name && (
                                            <div className="text-xs text-muted-foreground mt-0.5">{rate.category_name}</div>
                                        )}
                                    </div>
                                )
                                return renderEntryRows(rate, `tg-${tgIdx}-${rateIdx}`, cropCell, rateIdx === 0 ? renderTargetGrid(rate.targets || []) : null)
                            })
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
