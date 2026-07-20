import Link from "next/link"
import { FileText } from "lucide-react"

export function SidebarPromo() {
    return (
        <Link
            href="/buy-documents/pig-sty-pen-design-plan"
            className="block rounded-xl border border-border bg-muted/30 hover:bg-muted/50 hover:border-border/80 transition-colors p-4"
        >
            <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Featured</p>
            </div>
            <p className="text-sm font-bold text-foreground mb-1">Pig Sty Pen Design Plan</p>
            <p className="text-xs text-muted-foreground mb-3">Professional pig pen design with detailed measurements, material list, and step-by-step construction guide.</p>
            <span className="inline-flex items-center text-xs font-semibold text-primary">
                View plan →
            </span>
        </Link>
    )
}
