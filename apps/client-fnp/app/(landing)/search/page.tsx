import { SearchResults } from "./SearchResults"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Search — farmnport.com",
    description: "Search for products, guides, programs, buyers, prices, and more on farmnport.com.",
}

export default function SearchPage() {
    return <SearchResults />
}
