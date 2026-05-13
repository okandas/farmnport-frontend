import { Metadata } from 'next'
import { queryFeedingProgramBySlug } from '@/lib/query'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const response = await queryFeedingProgramBySlug(slug)
    const program = response?.data

    if (!program) {
      return {
        title: 'Feeding Program Not Found | farmnport',
        description: 'The feeding program you are looking for could not be found.',
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://farmnport.com'
    const url = `${baseUrl}/feeding-programs/${slug}`
    const imageUrl = program.cover_image?.img?.src || `${baseUrl}/og-image.png`

    const stageCount = program.stages?.length || 0
    const animal = program.animal || 'livestock'
    const description = `${program.name} feeding program for ${animal} with ${stageCount} stages. View recommended feeds, quantities, and nutritional guidelines for each growth stage.`

    const keywords = [
      program.name,
      program.animal,
      'feeding program',
      'livestock nutrition',
      'feed schedule',
      ...(program.stages?.map((s: any) => s.name) || []),
    ].filter(Boolean).join(', ')

    return {
      title: `${program.name} - Feeding Program | farmnport`,
      description,
      keywords,
      authors: [{ name: 'farmnport' }],
      openGraph: {
        title: `${program.name} - Feeding Program`,
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
        title: `${program.name} - Feeding Program`,
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
      title: 'Feeding Program | farmnport',
      description: 'View livestock feeding programs with stage-by-stage nutritional guidelines.',
    }
  }
}

export default function FeedingProgramDetailLayout({ children }: LayoutProps) {
  return <>{children}</>
}
