import { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

function getApiUrl() {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL
  if (!baseURL) return null
  return `${baseURL}/v1`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/buyers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/farmers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/prices`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/feeds`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/feeding-programs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/spray-programs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/agrochemical-guides`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/agrochemical-guides/all`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/animal-health-guides`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/animal-health-guides/all`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/waiting-list-paying`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/waiting-list-shop`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  // Fetch all dynamic data in parallel
  const [
    priceLists,
    farmProduce,
    agroChemicalCategories,
    agroChemicals,
    animalHealthCategories,
    animalHealthProducts,
    feedProducts,
    feedingPrograms,
    sprayPrograms,
  ] = await Promise.all([
    fetchPriceLists(),
    fetchFarmProduce(),
    fetchAgroChemicalCategories(),
    fetchAgroChemicals(),
    fetchAnimalHealthCategories(),
    fetchAnimalHealthProducts(),
    fetchFeedProducts(),
    fetchFeedingPrograms(),
    fetchSprayPrograms(),
  ])

  // Price list routes
  const priceRoutes: MetadataRoute.Sitemap = priceLists.map((pl) => ({
    url: `${BASE_URL}/prices/${pl.slug}`,
    lastModified: new Date(pl.effectiveDate),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Farm produce → /buyers/{slug} and /farmers/{slug}
  const farmProduceRoutes: MetadataRoute.Sitemap = farmProduce.flatMap((fp: any) => [
    { url: `${BASE_URL}/buyers/${fp.slug}`, lastModified: new Date(fp.updated || fp.created), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/farmers/${fp.slug}`, lastModified: new Date(fp.updated || fp.created), changeFrequency: 'weekly' as const, priority: 0.7 },
  ])

  // Agrochemical category routes
  const agroChemicalCategoryRoutes: MetadataRoute.Sitemap = agroChemicalCategories.map((category: any) => ({
    url: `${BASE_URL}/agrochemical-guides/${category.slug}`,
    lastModified: new Date(category.updated || category.created),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Individual agrochemical guide + buy pages
  const agroChemicalRoutes: MetadataRoute.Sitemap = agroChemicals.flatMap((chemical: any) => [
    { url: `${BASE_URL}/agrochemical-guides/${chemical.categorySlug || 'all'}/${chemical.slug}`, lastModified: new Date(chemical.updated || chemical.created), changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: `${BASE_URL}/buy-agrochemicals/${chemical.slug}`, lastModified: new Date(chemical.updated || chemical.created), changeFrequency: 'daily' as const, priority: 0.8 },
  ])

  // Buy agrochemicals listing
  const buyAgroChemicalListingRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/buy-agrochemicals`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ]

  // Animal health category routes
  const animalHealthCategoryRoutes: MetadataRoute.Sitemap = animalHealthCategories.map((category: any) => ({
    url: `${BASE_URL}/animal-health-guides/${category.slug}`,
    lastModified: new Date(category.updated || category.created),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Individual animal health guide pages
  const animalHealthRoutes: MetadataRoute.Sitemap = animalHealthProducts.map((product: any) => ({
    url: `${BASE_URL}/animal-health-guides/${product.categorySlug || 'all'}/${product.slug}`,
    lastModified: new Date(product.updated || product.created),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Feed product routes
  const feedRoutes: MetadataRoute.Sitemap = feedProducts.map((fp: any) => ({
    url: `${BASE_URL}/feeds/${fp.slug}`,
    lastModified: new Date(fp.updated || fp.created),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Feeding program routes
  const feedingProgramRoutes: MetadataRoute.Sitemap = feedingPrograms.map((fp: any) => ({
    url: `${BASE_URL}/feeding-programs/${fp.slug}`,
    lastModified: new Date(fp.updated || fp.created),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Spray program routes
  const sprayProgramRoutes: MetadataRoute.Sitemap = sprayPrograms.map((sp: any) => ({
    url: `${BASE_URL}/spray-programs/${sp.slug}`,
    lastModified: new Date(sp.updated || sp.created),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    ...staticRoutes,
    ...priceRoutes,
    ...farmProduceRoutes,
    ...agroChemicalCategoryRoutes,
    ...agroChemicalRoutes,
    ...buyAgroChemicalListingRoutes,
    ...animalHealthCategoryRoutes,
    ...animalHealthRoutes,
    ...feedRoutes,
    ...feedingProgramRoutes,
    ...sprayProgramRoutes,
  ]
}

// --- Fetchers ---

async function fetchPaginatedApi(endpoint: string, maxPages = 50, maxItems = 1000) {
  const apiUrl = getApiUrl()
  if (!apiUrl) return []

  try {
    let all: any[] = []
    let page = 1

    while (page <= maxPages && all.length < maxItems) {
      const response = await fetch(`${apiUrl}/${endpoint}${endpoint.includes('?') ? '&' : '?'}p=${page}`, {
        next: { revalidate: 86400 },
      })
      if (!response.ok) break

      const data = await response.json()
      const items = data.data || []
      if (items.length === 0) break

      all = [...all, ...items]
      page++
    }

    return all
  } catch (error) {
    console.error(`Error fetching ${endpoint} for sitemap:`, error)
    return []
  }
}

async function fetchSimpleApi(endpoint: string) {
  const apiUrl = getApiUrl()
  if (!apiUrl) return []

  try {
    const response = await fetch(`${apiUrl}/${endpoint}`, { next: { revalidate: 86400 } })
    if (!response.ok) return []
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error(`Error fetching ${endpoint} for sitemap:`, error)
    return []
  }
}

async function fetchFarmProduce() {
  return fetchSimpleApi('farmproduce/all')
}

async function fetchAgroChemicalCategories() {
  return fetchSimpleApi('agrochemicalcategories/all')
}

async function fetchAgroChemicals() {
  const chemicals = await fetchPaginatedApi('agrochemical/all')
  return chemicals.map((c: any) => ({
    slug: c.slug,
    categorySlug: c.agrochemical_category?.slug,
    updated: c.updated,
    created: c.created,
  }))
}

async function fetchAnimalHealthCategories() {
  return fetchSimpleApi('animalhealthcategories/')
}

async function fetchAnimalHealthProducts() {
  const products = await fetchPaginatedApi('animalhealth/all')
  return products.map((p: any) => ({
    slug: p.slug,
    categorySlug: p.animal_health_category?.slug,
    updated: p.updated,
    created: p.created,
  }))
}

async function fetchFeedProducts() {
  const feeds = await fetchPaginatedApi('feed/all')
  return feeds.map((f: any) => ({
    slug: f.slug,
    updated: f.updated,
    created: f.created,
  }))
}

async function fetchFeedingPrograms() {
  const programs = await fetchSimpleApi('feedingprograms/')
  return (programs || []).map((p: any) => ({
    slug: p.slug,
    updated: p.updated,
    created: p.created,
  }))
}

async function fetchSprayPrograms() {
  const data = await fetchSimpleApi('sprayprograms/')
  const programs = Array.isArray(data) ? data : (data?.data || data || [])
  return (Array.isArray(programs) ? programs : []).map((p: any) => ({
    slug: p.slug,
    updated: p.updated,
    created: p.created,
  }))
}

async function fetchPriceLists() {
  const apiUrl = getApiUrl()
  if (!apiUrl) return []

  try {
    let all: any[] = []
    let page = 1

    while (page <= 20 && all.length < 500) {
      const response = await fetch(`${apiUrl}/prices/all?p=${page}&limit=100`, {
        next: { revalidate: 3600 },
      })
      if (!response.ok) break

      const data = await response.json()
      const priceLists = data.data || []
      if (priceLists.length === 0) break

      const mapped = priceLists.map((pl: any) => {
        const plDate = new Date(pl.effectiveDate).toISOString().split('T')[0]
        return {
          slug: `${pl.client_name.toLowerCase().replace(/\s+/g, '-')}-${plDate}`,
          effectiveDate: pl.effectiveDate,
        }
      })
      all = [...all, ...mapped]
      page++
    }

    return all
  } catch (error) {
    console.error('Error fetching price lists for sitemap:', error)
    return []
  }
}
