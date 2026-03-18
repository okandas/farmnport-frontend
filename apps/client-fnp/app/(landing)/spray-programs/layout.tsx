import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crop Spray Programs - Step-by-Step Application Schedules | farmnport',
  description: 'Discover crop-specific spray programs with detailed stage-by-stage agrochemical application schedules. Find the right products for each growth stage of your crops.',
  keywords: 'spray programs, crop protection, agrochemical schedule, farming guide, pest management, disease prevention, growth stages, agricultural spraying',
  authors: [{ name: 'farmnport' }],
  openGraph: {
    title: 'Crop Spray Programs - Step-by-Step Application Schedules',
    description: 'Discover crop-specific spray programs with detailed stage-by-stage agrochemical application schedules. Find the right products for each growth stage of your crops.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'}/spray-programs`,
    siteName: 'farmnport',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crop Spray Programs - Application Schedules',
    description: 'Crop-specific spray programs with stage-by-stage agrochemical application schedules.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'}/spray-programs`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function SprayProgramsRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
