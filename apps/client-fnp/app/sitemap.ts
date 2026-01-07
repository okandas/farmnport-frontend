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

  return [...staticRoutes, ...productRoutes, ...farmerRoutes, ...buyerRoutes]
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
