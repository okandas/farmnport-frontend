const unitLabels: Record<string, string> = {
    "g/L": "grams per litre",
    "g/l": "grams per litre",
    "mg/L": "milligrams per litre",
    "mg/ml": "milligrams per millilitre",
    "mg/kg": "milligrams per kilogram",
    "g/kg": "grams per kilogram",
    "g/bolus": "grams per bolus",
    "%": "percentage by weight",
    "% m/m": "mass per mass percentage",
    "% m/v": "mass per volume percentage",
    "% w/v": "weight per volume percentage",
}

interface ActiveIngredientUnitsKeyProps {
    activeIngredients: { dosage_unit: string }[]
}

interface ActiveIngredient {
    name: string
    dosage_value: string | number
    dosage_unit: string
}

export function ActiveIngredientsList({ activeIngredients }: { activeIngredients: ActiveIngredient[] }) {
    if (!activeIngredients || activeIngredients.length === 0) {
        return <p className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg border">No active ingredient information available.</p>
    }

    return (
        <>
            <ActiveIngredientUnitsKey activeIngredients={activeIngredients} />
            <div className="grid grid-cols-2 gap-1 mt-2">
                {activeIngredients.map((ai, idx) => (
                    <div key={idx} className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-muted/50 border border-border">
                        <span className="capitalize text-sm text-foreground">{ai.name}</span>
                        <span className="text-xs font-semibold text-primary ml-2 shrink-0">{ai.dosage_value} {ai.dosage_unit}</span>
                    </div>
                ))}
            </div>
        </>
    )
}

export function ActiveIngredientUnitsKey({ activeIngredients }: ActiveIngredientUnitsKeyProps) {
    const units = Array.from(new Set(activeIngredients.map(ai => ai.dosage_unit))) as string[]
    const knownUnits = units.filter(u => unitLabels[u])

    if (knownUnits.length === 0) return null

    return (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {knownUnits.map(unit => (
                <span key={unit} className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{unit}</span> = {unitLabels[unit]}
                </span>
            ))}
        </div>
    )
}
