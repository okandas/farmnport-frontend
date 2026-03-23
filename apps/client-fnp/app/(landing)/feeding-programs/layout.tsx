import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Feeding Programs - Livestock Nutrition Guides | farmnport',
  description: 'Browse livestock feeding programs with stage-by-stage nutritional guidelines for poultry, cattle, pigs, and more. Find recommended feeds and quantities for each growth stage.',
  keywords: 'feeding programs, livestock nutrition, poultry feeding, cattle feeding, pig feeding, feed schedule',
  authors: [{ name: 'farmnport' }],
  openGraph: {
    title: 'Feeding Programs | farmnport',
    description: 'Browse livestock feeding programs with stage-by-stage nutritional guidelines.',
    siteName: 'farmnport',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'https://farmnport.com'}/feeding-programs`,
  },
}

export default function FeedingProgramsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
