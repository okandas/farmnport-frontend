import { MetadataRoute } from 'next'

// Update this with your actual domain
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/buyers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/farmers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/prices`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Price list routes
  const priceLists = await fetchPriceLists()
  const priceRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/prices`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...priceLists.map((priceList) => ({
      url: `${BASE_URL}/prices/${priceList.slug}`,
      lastModified: new Date(priceList.effectiveDate),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]

  // Dynamic routes - Fetch product pages
  // Replace this with your actual API call or database query
  const products = await fetchProducts()
  const productRoutes: MetadataRoute.Sitemap = products.flatMap((product) => [
    {
      url: `${BASE_URL}/buyers/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/farmers/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ])

  // Dynamic routes - Fetch farmer and buyer profile pages
  const farmers = await fetchFarmers()
  const farmerRoutes: MetadataRoute.Sitemap = farmers.map((farmer) => ({
    url: `${BASE_URL}/farmer/${farmer.slug}`,
    lastModified: new Date(farmer.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const buyers = await fetchBuyers()
  const buyerRoutes: MetadataRoute.Sitemap = buyers.map((buyer) => ({
    url: `${BASE_URL}/buyer/${buyer.slug}`,
    lastModified: new Date(buyer.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // Agrochemical guide routes
  const agroChemicalCategories = await fetchAgroChemicalCategories()
  const agroChemicalCategoryRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/agrochemical-guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/agrochemical-guides/all`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...agroChemicalCategories.map((category) => ({
      url: `${BASE_URL}/agrochemical-guides/${category.slug}`,
      lastModified: new Date(category.updated || category.created),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]

  // Individual agrochemical product pages
  const agroChemicals = await fetchAgroChemicals()
  const agroChemicalRoutes: MetadataRoute.Sitemap = agroChemicals.map((chemical) => ({
    url: `${BASE_URL}/agrochemical-guides/${chemical.categorySlug || 'all'}/${chemical.slug}`,
    lastModified: new Date(chemical.updated || chemical.created),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  // Buy agrochemicals shop routes
  const buyAgroChemicalRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/buy-agrochemicals`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9, // High priority for e-commerce
    },
    ...agroChemicals.map((chemical) => ({
      url: `${BASE_URL}/buy-agrochemicals/${chemical.slug}`,
      lastModified: new Date(chemical.updated || chemical.created),
      changeFrequency: 'daily' as const, // Products/prices change frequently
      priority: 0.8, // High priority for product pages
    })),
  ]

  return [
    ...staticRoutes,
    ...priceRoutes,
    ...productRoutes,
    ...farmerRoutes,
    ...buyerRoutes,
    ...agroChemicalCategoryRoutes,
    ...agroChemicalRoutes,
    ...buyAgroChemicalRoutes,
  ]
}

// Helper functions to fetch dynamic content
// Replace these with your actual data fetching logic
async function fetchProducts() {
  try {
    // Example: Fetch from your API
    // const response = await fetch(`${process.env.API_URL}/products`, {
    //   next: { revalidate: 3600 } // Revalidate every hour
    // })
    // const data = await response.json()
    // return data.products

    // For now, return empty array - replace with actual implementation
    return []
  } catch (error) {
    console.error('Error fetching products for sitemap:', error)
    return []
  }
}

async function fetchFarmers() {
  try {
    // Example: Fetch from your API
    // const response = await fetch(`${process.env.API_URL}/farmers`, {
    //   next: { revalidate: 3600 }
    // })
    // const data = await response.json()
    // return data.farmers

    // For now, return empty array - replace with actual implementation
    return []
  } catch (error) {
    console.error('Error fetching farmers for sitemap:', error)
    return []
  }
}

async function fetchBuyers() {
  try {
    // Example: Fetch from your API
    // const response = await fetch(`${process.env.API_URL}/buyers`, {
    //   next: { revalidate: 3600 }
    // })
    // const data = await response.json()
    // return data.buyers

    // For now, return empty array - replace with actual implementation
    return []
  } catch (error) {
    console.error('Error fetching buyers for sitemap:', error)
    return []
  }
}

async function fetchAgroChemicalCategories() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL
    if (!apiUrl) {
      console.warn('API URL not configured for sitemap generation')
      return []
    }

    const response = await fetch(`${apiUrl}/agrochemicalcategories/all`, {
      next: { revalidate: 86400 }, // Revalidate once per day
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`)
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching agrochemical categories for sitemap:', error)
    return []
  }
}

async function fetchAgroChemicals() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL
    if (!apiUrl) {
      console.warn('API URL not configured for sitemap generation')
      return []
    }

    // Fetch all agrochemicals with pagination
    let allChemicals: any[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const response = await fetch(`${apiUrl}/agrochemical/all?p=${page}`, {
        next: { revalidate: 86400 }, // Revalidate once per day
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch agrochemicals: ${response.status}`)
      }

      const data = await response.json()
      const chemicals = data.data || []

      if (chemicals.length === 0) {
        hasMore = false
      } else {
        // Map chemicals to include category slug
        const mappedChemicals = chemicals.map((chemical: any) => ({
          slug: chemical.slug,
          categorySlug: chemical.agrochemical_category?.slug,
          updated: chemical.updated,
          created: chemical.created,
        }))
        allChemicals = [...allChemicals, ...mappedChemicals]
        page++

        // Limit to prevent infinite loops (adjust as needed)
        if (page > 50 || allChemicals.length >= 1000) {
          hasMore = false
        }
      }
    }

    return allChemicals
  } catch (error) {
    console.error('Error fetching agrochemicals for sitemap:', error)
    return []
  }
}

async function fetchPriceLists() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL
    if (!apiUrl) {
      console.warn('API URL not configured for sitemap generation')
      return []
    }

    // Fetch price lists with pagination
    let allPriceLists: any[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const response = await fetch(`${apiUrl}/prices/all?p=${page}&limit=100`, {
        next: { revalidate: 3600 }, // Revalidate every hour (prices change frequently)
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch price lists: ${response.status}`)
      }

      const data = await response.json()
      const priceLists = data.data || []

      if (priceLists.length === 0) {
        hasMore = false
      } else {
        // Map price lists to generate slugs
        const mappedPriceLists = priceLists.map((pl: any) => {
          const plDate = new Date(pl.effectiveDate).toISOString().split('T')[0]
          const slug = `${pl.client_name.toLowerCase().replace(/\s+/g, '-')}-${plDate}`
          return {
            slug,
            effectiveDate: pl.effectiveDate,
          }
        })
        allPriceLists = [...allPriceLists, ...mappedPriceLists]
        page++

        // Limit to prevent infinite loops
        if (page > 20 || allPriceLists.length >= 500) {
          hasMore = false
        }
      }
    }

    return allPriceLists
  } catch (error) {
    console.error('Error fetching price lists for sitemap:', error)
    return []
  }
}
