import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    template: "%s | Farmnport Resources",
    default: "Farmnport Resources",
  },
  description:
    "How-to guides and resources for farmers and buyers on farmnport.com",
}

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return children
}
