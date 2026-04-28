import { Metadata } from 'next'
import { querySprayProgramBySlug } from '@/lib/query'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const response = await querySprayProgramBySlug(slug)
    const program = response?.data

    if (!program) {
      return {
        title: 'Spray Program Not Found | farmnport',
        description: 'The spray program you are looking for could not be found.',
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'
    const url = `${baseUrl}/spray-programs/${slug}`
    const imageUrl = program.cover_image?.img?.src || `${baseUrl}/og-image.png`

    const stageCount = program.stages?.length || 0
    const description = `${program.name} spray program for ${program.farm_produce_name || 'crops'} with ${stageCount} growth stages. View recommended agrochemicals, dosages, and application methods for each stage.`

    const keywords = [
      program.name,
      program.farm_produce_name,
      'spray program',
      'crop protection',
      'agrochemical schedule',
      ...(program.stages?.map((s: any) => s.name) || []),
    ].filter(Boolean).join(', ')

    return {
      title: `${program.name} - Spray Program | farmnport`,
      description,
      keywords,
      authors: [{ name: 'farmnport' }],
      openGraph: {
        title: `${program.name} - Spray Program`,
        description,
        url,
        siteName: 'farmnport',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: program.name,
          },
        ],
        locale: 'en_ZW',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${program.name} - Spray Program`,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: url,
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
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Spray Program | farmnport',
      description: 'Crop spray program with stage-by-stage application schedules.',
    }
  }
}

export default function SprayProgramDetailLayout({ children }: LayoutProps) {
  return <>{children}</>
}
