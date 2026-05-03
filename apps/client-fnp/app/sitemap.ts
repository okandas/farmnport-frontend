import { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

function safeDate(value: any): Date {
  if (!value) return new Date()
  const d = new Date(value)
  return isNaN(d.getTime()) ? new Date() : d
}

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
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/prices/lwt`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/prices/cdm`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/prices/produce`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
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
    cdmPrices,
    clients,
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
    fetchCdmPrices(),
    fetchClients(),
  ])

  // Price list routes
  const priceRoutes: MetadataRoute.Sitemap = priceLists.map((pl) => ({
    url: `${BASE_URL}/prices/${pl.slug}`,
    lastModified: safeDate(pl.effectiveDate),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Farm produce → /buyers/{slug} and /farmers/{slug}
  const farmProduceRoutes: MetadataRoute.Sitemap = farmProduce.flatMap((fp: any) => [
    { url: `${BASE_URL}/buyers/${fp.slug}`, lastModified: safeDate(fp.updated || fp.created), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/farmers/${fp.slug}`, lastModified: safeDate(fp.updated || fp.created), changeFrequency: 'weekly' as const, priority: 0.7 },
  ])

  // Agrochemical category routes
  const agroChemicalCategoryRoutes: MetadataRoute.Sitemap = agroChemicalCategories.map((category: any) => ({
    url: `${BASE_URL}/agrochemical-guides/${category.slug}`,
    lastModified: safeDate(category.updated || category.created),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Individual agrochemical guide + buy pages
  const agroChemicalRoutes: MetadataRoute.Sitemap = agroChemicals.flatMap((chemical: any) => [
    { url: `${BASE_URL}/agrochemical-guides/${chemical.categorySlug || 'all'}/${chemical.slug}`, lastModified: safeDate(chemical.updated || chemical.created), changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: `${BASE_URL}/buy-agrochemicals/${chemical.slug}`, lastModified: safeDate(chemical.updated || chemical.created), changeFrequency: 'daily' as const, priority: 0.8 },
  ])

  // Buy agrochemicals listing
  const buyAgroChemicalListingRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/buy-agrochemicals`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ]

  // Buy feeds routes (individual feed product buy pages)
  const buyFeedRoutes: MetadataRoute.Sitemap = feedProducts.map((fp: any) => ({
    url: `${BASE_URL}/buy-feeds/${fp.slug}`,
    lastModified: safeDate(fp.updated || fp.created),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // CDM price routes
  const cdmPriceRoutes: MetadataRoute.Sitemap = cdmPrices.map((cp: any) => ({
    url: `${BASE_URL}/prices/cdm/${cp.slug}`,
    lastModified: safeDate(cp.effectiveDate),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Produce price category routes
  const producePriceCategories = ['beef', 'lamb', 'mutton', 'goat', 'chicken', 'pork']
  const producePriceRoutes: MetadataRoute.Sitemap = producePriceCategories.map((slug) => ({
    url: `${BASE_URL}/prices/produce/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Farmer and buyer profile routes
  const clientRoutes: MetadataRoute.Sitemap = clients.flatMap((client: any) => {
    const clientSlug = client.name.toLowerCase().replace(/\s+/g, '-')
    const route = client.type === 'farmer'
      ? { url: `${BASE_URL}/farmer/${clientSlug}`, lastModified: safeDate(client.updated || client.created), changeFrequency: 'weekly' as const, priority: 0.6 }
      : { url: `${BASE_URL}/buyer/${clientSlug}`, lastModified: safeDate(client.updated || client.created), changeFrequency: 'weekly' as const, priority: 0.6 }
    return [route]
  })

  // Animal health category routes
  const animalHealthCategoryRoutes: MetadataRoute.Sitemap = animalHealthCategories.map((category: any) => ({
    url: `${BASE_URL}/animal-health-guides/${category.slug}`,
    lastModified: safeDate(category.updated || category.created),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Individual animal health guide pages
  const animalHealthRoutes: MetadataRoute.Sitemap = animalHealthProducts.map((product: any) => ({
    url: `${BASE_URL}/animal-health-guides/${product.categorySlug || 'all'}/${product.slug}`,
    lastModified: safeDate(product.updated || product.created),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Feed product routes
  const feedRoutes: MetadataRoute.Sitemap = feedProducts.map((fp: any) => ({
    url: `${BASE_URL}/feeds/${fp.slug}`,
    lastModified: safeDate(fp.updated || fp.created),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Feeding program routes
  const feedingProgramRoutes: MetadataRoute.Sitemap = feedingPrograms.map((fp: any) => ({
    url: `${BASE_URL}/feeding-programs/${fp.slug}`,
    lastModified: safeDate(fp.updated || fp.created),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Spray program routes
  const sprayProgramRoutes: MetadataRoute.Sitemap = sprayPrograms.map((sp: any) => ({
    url: `${BASE_URL}/spray-programs/${sp.slug}`,
    lastModified: safeDate(sp.updated || sp.created),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    ...staticRoutes,
    ...priceRoutes,
    ...cdmPriceRoutes,
    ...producePriceRoutes,
    ...farmProduceRoutes,
    ...agroChemicalCategoryRoutes,
    ...agroChemicalRoutes,
    ...buyAgroChemicalListingRoutes,
    ...animalHealthCategoryRoutes,
    ...animalHealthRoutes,
    ...feedRoutes,
    ...buyFeedRoutes,
    ...feedingProgramRoutes,
    ...sprayProgramRoutes,
    ...clientRoutes,
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

async function fetchCdmPrices() {
  const apiUrl = getApiUrl()
  if (!apiUrl) return []

  try {
    const response = await fetch(`${apiUrl}/cdmprices/all?p=1&limit=100`, { next: { revalidate: 86400 } })
    if (!response.ok) return []
    const data = await response.json()
    const prices = data.data || []
    return prices.map((p: any) => {
      const pDate = new Date(p.effectiveDate).toISOString().split('T')[0]
      return {
        slug: `${p.client_name.toLowerCase().replace(/\s+/g, '-')}-${pDate}`,
        effectiveDate: p.effectiveDate,
      }
    })
  } catch (error) {
    console.error('Error fetching CDM prices for sitemap:', error)
    return []
  }
}

async function fetchClients() {
  const apiUrl = getApiUrl()
  if (!apiUrl) return []

  try {
    let all: any[] = []
    let page = 1

    while (page <= 50 && all.length < 1000) {
      const response = await fetch(`${apiUrl}/client/all?p=${page}`, { next: { revalidate: 86400 } })
      if (!response.ok) break
      const data = await response.json()
      const items = data.data || []
      if (items.length === 0) break
      all = [...all, ...items.map((c: any) => ({
        name: c.name,
        type: c.type,
        updated: c.updated,
        created: c.created,
      }))]
      page++
    }

    return all
  } catch (error) {
    console.error('Error fetching clients for sitemap:', error)
    return []
  }
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
        const plDate = safeDate(pl.effectiveDate).toISOString().split('T')[0]
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
