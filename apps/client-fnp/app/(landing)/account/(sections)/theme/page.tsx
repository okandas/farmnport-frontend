"use client"

import { useTheme } from "next-themes"

const THEMES = [
    { value: "light", label: "Light", description: "Clean white background." },
    { value: "dark", label: "Dark", description: "Dark background for low-light use." },
    { value: "system", label: "System", description: "Matches your device setting." },
]

export default function AccountThemePage() {
    const { theme, setTheme } = useTheme()

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold">Theme</h1>
            <div className="space-y-1">
                {THEMES.map(({ value, label, description }) => (
                    <button
                        key={value}
                        onClick={() => setTheme(value)}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors text-left"
                    >
                        <div>
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                        {theme === value && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}
