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
