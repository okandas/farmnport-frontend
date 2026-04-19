import { formatUnit } from "@/lib/utilities"

interface DosageEntry {
    dosage: { value: string; unit: string; per: string }
    max_applications: { max: number; note: string }
    application_interval: string
    phi: string
    remarks: string[]
}

interface DosageRate {
    crop_group: string
    crop_group_id: string
    entries: DosageEntry[]
}

interface FertilizerApplicationRatesProps {
    dosageRates: DosageRate[]
}

export function FertilizerApplicationRates({ dosageRates }: FertilizerApplicationRatesProps) {
    if (!dosageRates || dosageRates.length === 0) return null

    return (
        <div className="mb-12">
            <h2 className="sticky top-16 z-10 text-2xl font-bold py-4 text-foreground bg-background">
                Application Rates
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-b-2 border-green-200 dark:border-green-800">
                            <th className="text-left p-3 text-sm font-semibold text-green-900 dark:text-green-100 min-w-[180px]">Application Method</th>
                            <th className="text-left p-3 text-sm font-semibold text-blue-700 dark:text-blue-300 min-w-[140px]">Rate</th>
                            <th className="text-left p-3 text-sm font-semibold text-orange-700 dark:text-orange-300 min-w-[120px] whitespace-nowrap">Max Applications</th>
                            <th className="text-left p-3 text-sm font-semibold text-teal-700 dark:text-teal-300 min-w-[130px] whitespace-nowrap">Interval</th>
                            <th className="text-left p-3 text-sm font-semibold text-green-900 dark:text-green-100 min-w-[200px]">Remarks / Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dosageRates.map((rate, rateIdx) => {
                            const entries = rate.entries || []
                            const lastIdx = entries.length - 1
                            return entries.map((entry, entryIdx) => (
                                <tr
                                    key={`${rateIdx}-${entryIdx}`}
                                    className={`hover:bg-muted/30 transition-colors ${entryIdx === 0 ? "border-t border-border" : ""} ${entryIdx === lastIdx ? "border-b border-border" : ""}`}
                                >
                                    <td className="p-3 align-top">
                                        {entryIdx === 0 && (
                                            <div className="font-semibold text-sm text-green-800 dark:text-green-200">
                                                {rate.crop_group}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3 align-top">
                                        <div className="font-bold text-blue-600 dark:text-blue-400 text-base">
                                            {entry.dosage.value} {formatUnit(entry.dosage.unit)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">per {entry.dosage.per}</div>
                                    </td>
                                    <td className="p-3 align-top">
                                        <div className="font-semibold text-orange-700 dark:text-orange-300">
                                            {entry.max_applications.max > 0 ? entry.max_applications.max : "—"}
                                        </div>
                                        {entry.max_applications.note && entry.max_applications.note.trim() !== "" && (
                                            <div className="text-xs text-muted-foreground mt-1">{entry.max_applications.note}</div>
                                        )}
                                    </td>
                                    <td className="p-3 align-top">
                                        <div className="font-semibold text-teal-700 dark:text-teal-300 text-sm">
                                            {entry.application_interval || "—"}
                                        </div>
                                    </td>
                                    <td className="p-3 align-top">
                                        {entry.remarks && entry.remarks.length > 0 ? (
                                            <ul className="space-y-1">
                                                {entry.remarks.map((remark, remarkIdx) => (
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
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
