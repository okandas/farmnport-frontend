import axios, { InternalAxiosRequestConfig } from "axios"
import { toast } from "sonner"

import { PaginationModel, ResetFormData, LoginFormData, SignUpFormData, BaseURL, FeatureFlags } from "@/lib/schemas"
import { retrieveToken, logoutUser } from "@/lib/actions"

let api = axios.create({})

api.interceptors.request.use(async(config: InternalAxiosRequestConfig) => {

    const token = await retrieveToken()

    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`
    }

    return config
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 400 || error.response?.status === 401) {
            const errorMessage = error.response?.data?.message || ""

            // Check if it's a token expiration error
            if (errorMessage.includes("expired") || errorMessage.includes("not active yet")) {
                // Logout the user
                await logoutUser()

                // Show session expired toast
                toast("Session Expired", {
                    description: "Your session has expired. Please login again."
                })

                // Redirect to login page
                if (typeof window !== "undefined") {
                    window.location.href = "/login"
                }
            }
        }

        return Promise.reject(error)
    }
)

export function queryClient(slug: string) {

  let url = `${BaseURL}/client/${slug}`

  return api.get(url)
}

export function queryClients(slug: string, pagination?: PaginationModel & { province?: string[], produce?: string[], category?: string[], payment_terms?: string[], pricing?: string[], verified?: string[] }) {
    const params = new URLSearchParams()

    // Add pagination
    if (pagination?.p !== undefined && pagination.p >= 2) {
        params.set('p', pagination.p.toString())
    }

    // Add filters
    if (pagination?.province && pagination.province.length > 0) {
        pagination.province.forEach(p => params.append('province', p))
    }
    if (pagination?.produce && pagination.produce.length > 0) {
        pagination.produce.forEach(p => params.append('produce', p))
    }
    if (pagination?.category && pagination.category.length > 0) {
        pagination.category.forEach(c => params.append('category', c))
    }
    if (pagination?.payment_terms && pagination.payment_terms.length > 0) {
        pagination.payment_terms.forEach(pt => params.append('payment_terms', pt))
    }
    if (pagination?.pricing && pagination.pricing.length > 0) {
        pagination.pricing.forEach(pr => params.append('pricing', pr))
    }
    if (pagination?.verified && pagination.verified.length > 0) {
        params.set('verified', pagination.verified[0])
    }

    const queryString = params.toString()
    const url = queryString ? `${BaseURL}/${slug}/all?${queryString}` : `${BaseURL}/${slug}/all`

    return api.get(url)
}


export function queryClientsByProduct(slug: string, product: string, pagination?: PaginationModel & { province?: string[], verified?: string[] }) {
  const params = new URLSearchParams()

  if (pagination?.p !== undefined && pagination.p >= 2) {
    params.set('p', pagination.p.toString())
  }

  if (pagination?.province && pagination.province.length > 0) {
    pagination.province.forEach(p => params.append('province', p))
  }

  if (pagination?.verified && pagination.verified.length > 0) {
    params.set('verified', pagination.verified[0])
  }

  const queryString = params.toString()
  const url = queryString ? `${BaseURL}/${slug}/${product}?${queryString}` : `${BaseURL}/${slug}/${product}`

  return api.get(url)
}

export function clientLogin(data: LoginFormData) {
    let url = `${BaseURL}/client/login`
    return api.post(url, data)
}

export function clientReset(data: ResetFormData) {
    var url = `${BaseURL}/client/reset`
    return api.post(url, data)
}

export async function clientSignup(data: SignUpFormData) {
    let url = `${BaseURL}/client/signup`
    return api.post(url, data)
}

export function queryProducerPriceLists(pagination?: PaginationModel) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) {
    params.set("p", String(pagination.p))
  }
  if (pagination?.limit) {
    params.set("limit", String(pagination.limit))
  }
  const qs = params.toString()
  const url = `${BaseURL}/prices/all${qs ? `?${qs}` : ""}`
  return api.get(url)
}

export function queryFarmProduceCategories() {
  const url = `${BaseURL}/farmproducecategories/`
  return api.get(url)
}

export function queryFarmProduceByCategory(categorySlug: string) {
  const url = `${BaseURL}/farmproduce/category/${categorySlug}`
  return api.get(url)
}

export function queryAllFarmProduce() {
  const url = `${BaseURL}/farmproduce/`
  return api.get(url)
}

export function queryAllFarmProduceUnpaginated() {
  const url = `${BaseURL}/farmproduce/all`
  return api.get(url)
}

export function queryPriceFilterAggregates() {
  const url = `${BaseURL}/prices/aggregates/filters`
  return api.get(url)
}

export function queryPricesByProduce(produceSlug: string, pagination?: PaginationModel) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) {
    params.set("p", String(pagination.p))
  }
  if (pagination?.limit) {
    params.set("limit", String(pagination.limit))
  }
  const qs = params.toString()
  const url = `${BaseURL}/prices/produce/${produceSlug}${qs ? `?${qs}` : ""}`
  return api.get(url)
}

export function updateUserWantToPay(wantToPay: boolean) {
  const url = `${BaseURL}/client/want-to-pay`
  return api.post(url, { wantToPay })
}

export function queryClientFilterAggregates(type: 'buyers' | 'farmers', filters?: { produce?: string[], province?: string[] }) {
  const params = new URLSearchParams({ type })
  filters?.produce?.forEach(p => params.append('produce', p))
  filters?.province?.forEach(p => params.append('province', p))
  return api.get(`${BaseURL}/client/aggregates/filters?${params.toString()}`)
}

export function queryClientPricing(clientId: string, pagination?: PaginationModel) {
  let url: string

  if (pagination?.p !== undefined && pagination.p >= 2) {
    url = `${BaseURL}/prices/client/${clientId}?p=${pagination.p}`
  } else {
    url = `${BaseURL}/prices/client/${clientId}`
  }

  return api.get(url)
}

export function queryBuyerContacts(clientId: string) {
  const url = `${BaseURL}/buyercontacts/client/${clientId}`
  return api.get(url)
}

export function recordContactView(userId: string, viewedId: string, type: "phone" | "email") {
  const url = `${BaseURL}/views/viewed`
  return api.post(url, { user_id: userId, viewed_id: viewedId, type })
}

export function queryViewersCount() {
  const url = `${BaseURL}/views/viewers`
  return api.get(url)
}

export function queryViewersList() {
  const url = `${BaseURL}/views/viewers/list`
  return api.get(url)
}

export function queryAgroChemicalCategories() {
  const url = `${BaseURL}/agrochemicalcategories/`
  return api.get(url)
}

export function queryAllAgroChemicals(pagination?: PaginationModel & { search?: string, brand?: string[], target?: string[], active_ingredient?: string[], used_on?: string[] }) {
  const params = new URLSearchParams()

  // Add pagination
  if (pagination?.p !== undefined && pagination.p >= 2) {
    params.set('p', pagination.p.toString())
  }

  // Add search
  if (pagination?.search && pagination.search.length >= 2) {
    params.set('search', pagination.search)
  }

  // Add filters
  if (pagination?.brand && pagination.brand.length > 0) {
    pagination.brand.forEach(b => params.append('brand', b))
  }
  if (pagination?.target && pagination.target.length > 0) {
    pagination.target.forEach(t => params.append('target', t))
  }
  if (pagination?.active_ingredient && pagination.active_ingredient.length > 0) {
    pagination.active_ingredient.forEach(ai => params.append('active_ingredient', ai))
  }
  if (pagination?.used_on && pagination.used_on.length > 0) {
    pagination.used_on.forEach(uo => params.append('used_on', uo))
  }

  const queryString = params.toString()
  const url = queryString ? `${BaseURL}/agrochemical/all?${queryString}` : `${BaseURL}/agrochemical/all`

  return api.get(url)
}

export function queryAgroChemicalsByCategory(options: { category: string } & PaginationModel & { brand?: string[], target?: string[], active_ingredient?: string[] }) {
  const params = new URLSearchParams()

  // Add pagination
  if (options.p !== undefined && options.p >= 2) {
    params.set('p', options.p.toString())
  }

  // Add filters
  if (options.brand && options.brand.length > 0) {
    options.brand.forEach(b => params.append('brand', b))
  }
  if (options.target && options.target.length > 0) {
    options.target.forEach(t => params.append('target', t))
  }
  if (options.active_ingredient && options.active_ingredient.length > 0) {
    options.active_ingredient.forEach(ai => params.append('active_ingredient', ai))
  }

  const queryString = params.toString()
  const url = queryString ? `${BaseURL}/agrochemical/category/${options.category}?${queryString}` : `${BaseURL}/agrochemical/category/${options.category}`

  return api.get(url)
}

export function queryAllBrands() {
  const url = `${BaseURL}/brand/`
  return api.get(url)
}

export function queryAllTargets() {
  const url = `${BaseURL}/agrochemical-target/`
  return api.get(url)
}

export function queryAllActiveIngredients() {
  const url = `${BaseURL}/agrochemical-active-ingredient/`
  return api.get(url)
}

export function queryAgroChemicalFilterAggregates(filters?: { brand?: string[], category?: string[], target?: string[], active_ingredient?: string[], used_on?: string[] }) {
  const params = new URLSearchParams()
  filters?.brand?.forEach(v => params.append('brand', v))
  filters?.category?.forEach(v => params.append('category', v))
  filters?.target?.forEach(v => params.append('target', v))
  filters?.active_ingredient?.forEach(v => params.append('active_ingredient', v))
  filters?.used_on?.forEach(v => params.append('used_on', v))
  const qs = params.toString()
  return api.get(`${BaseURL}/agrochemical/aggregates/filters${qs ? `?${qs}` : ''}`)
}

export function queryAgroChemical(slug: string) {
  const url = `${BaseURL}/agrochemical/${slug}`
  return api.get(url)
}

export function queryDashboardAggregates() {
  const url = `${BaseURL}/client/aggregates/dashboard`
  return api.get(url)
}

export function initiateSubscription(data: { method: string; phone: string; email: string }) {
  const url = `${BaseURL}/subscription/initiate`
  return api.post(url, data)
}

export function checkSubscriptionStatus() {
  const url = `${BaseURL}/subscription/status`
  return api.get(url)
}

export function pollSubscription(reference: string) {
  const url = `${BaseURL}/subscription/poll`
  return api.post(url, { reference })
}

export function queryPublishedSprayPrograms(pagination?: PaginationModel) {
  let url: string

  if (pagination?.p !== undefined && pagination.p >= 2) {
    url = `${BaseURL}/sprayprograms/?p=${pagination.p}`
  } else {
    url = `${BaseURL}/sprayprograms/`
  }

  return api.get(url)
}

export function querySprayProgramBySlug(slug: string) {
  const url = `${BaseURL}/sprayprograms/${slug}`
  return api.get(url)
}

// Animal Health
export function queryAnimalHealthCategories(usedOn?: string) {
  const params = new URLSearchParams()
  if (usedOn) {
    params.set('used_on', usedOn)
  }
  const qs = params.toString()
  const url = `${BaseURL}/animalhealthcategories/${qs ? `?${qs}` : ''}`
  return api.get(url)
}

export function queryAllAnimalHealthProducts(pagination?: PaginationModel & { brand?: string[], target?: string[], active_ingredient?: string[], used_on?: string[] }) {
  const params = new URLSearchParams()

  if (pagination?.p !== undefined && pagination.p >= 2) {
    params.set('p', pagination.p.toString())
  }

  if (pagination?.brand && pagination.brand.length > 0) {
    pagination.brand.forEach(b => params.append('brand', b))
  }
  if (pagination?.target && pagination.target.length > 0) {
    pagination.target.forEach(t => params.append('target', t))
  }
  if (pagination?.active_ingredient && pagination.active_ingredient.length > 0) {
    pagination.active_ingredient.forEach(ai => params.append('active_ingredient', ai))
  }
  if (pagination?.used_on && pagination.used_on.length > 0) {
    pagination.used_on.forEach(uo => params.append('used_on', uo))
  }

  const queryString = params.toString()
  const url = queryString ? `${BaseURL}/animalhealth/all?${queryString}` : `${BaseURL}/animalhealth/all`

  return api.get(url)
}

export function queryAnimalHealthProductsByCategory(options: { category: string } & PaginationModel & { brand?: string[], target?: string[], active_ingredient?: string[], used_on?: string[] }) {
  const params = new URLSearchParams()

  if (options.p !== undefined && options.p >= 2) {
    params.set('p', options.p.toString())
  }

  if (options.brand && options.brand.length > 0) {
    options.brand.forEach(b => params.append('brand', b))
  }
  if (options.target && options.target.length > 0) {
    options.target.forEach(t => params.append('target', t))
  }
  if (options.active_ingredient && options.active_ingredient.length > 0) {
    options.active_ingredient.forEach(ai => params.append('active_ingredient', ai))
  }
  if (options.used_on && options.used_on.length > 0) {
    options.used_on.forEach(u => params.append('used_on', u))
  }

  const queryString = params.toString()
  const url = queryString ? `${BaseURL}/animalhealth/category/${options.category}?${queryString}` : `${BaseURL}/animalhealth/category/${options.category}`

  return api.get(url)
}

export function queryAnimalHealthFilterAggregates(filters?: { brand?: string[], category?: string[], target?: string[], active_ingredient?: string[], used_on?: string[] }) {
  const params = new URLSearchParams()
  filters?.brand?.forEach(v => params.append('brand', v))
  filters?.category?.forEach(v => params.append('category', v))
  filters?.target?.forEach(v => params.append('target', v))
  filters?.active_ingredient?.forEach(v => params.append('active_ingredient', v))
  filters?.used_on?.forEach(v => params.append('used_on', v))
  const qs = params.toString()
  return api.get(`${BaseURL}/animalhealth/aggregates/filters${qs ? `?${qs}` : ''}`)
}

export function queryAnimalHealthProduct(slug: string) {
  const url = `${BaseURL}/animalhealth/${slug}`
  return api.get(url)
}

// Feed Products
export function queryAllFeedProducts(pagination?: PaginationModel & { search?: string, category?: string[], brand?: string[], animal?: string[], phase?: string[], sub_type?: string[] }) {
  const params = new URLSearchParams()

  if (pagination?.p !== undefined && pagination.p >= 2) {
    params.set('p', pagination.p.toString())
  }

  if (pagination?.search && pagination.search.length >= 2) {
    params.set('search', pagination.search)
  }

  if (pagination?.category && pagination.category.length > 0) {
    pagination.category.forEach(c => params.append('category', c))
  }

  if (pagination?.brand && pagination.brand.length > 0) {
    pagination.brand.forEach(b => params.append('brand', b))
  }

  if (pagination?.animal && pagination.animal.length > 0) {
    pagination.animal.forEach(a => params.append('animal', a))
  }

  if (pagination?.phase && pagination.phase.length > 0) {
    pagination.phase.forEach(ph => params.append('phase', ph))
  }

  if (pagination?.sub_type && pagination.sub_type.length > 0) {
    pagination.sub_type.forEach(st => params.append('sub_type', st))
  }

  const queryString = params.toString()
  const url = queryString ? `${BaseURL}/feed/all?${queryString}` : `${BaseURL}/feed/all`

  return api.get(url)
}

export function queryFeedProduct(slug: string) {
  const url = `${BaseURL}/feed/${slug}`
  return api.get(url)
}

export function queryFeedCategories() {
  const url = `${BaseURL}/feedcategories/`
  return api.get(url)
}

export function queryFeedFilterAggregates(filters?: { brand?: string[], animal?: string[], phase?: string[], sub_type?: string[] }) {
  const params = new URLSearchParams()
  filters?.brand?.forEach(v => params.append('brand', v))
  filters?.animal?.forEach(v => params.append('animal', v))
  filters?.phase?.forEach(v => params.append('phase', v))
  filters?.sub_type?.forEach(v => params.append('sub_type', v))
  const qs = params.toString()
  return api.get(`${BaseURL}/feed/aggregates/filters${qs ? `?${qs}` : ''}`)
}

// Feeding Programs
export function queryPublishedFeedingPrograms(pagination?: PaginationModel) {
  let url: string

  if (pagination?.p !== undefined && pagination.p >= 2) {
    url = `${BaseURL}/feedingprograms/?p=${pagination.p}`
  } else {
    url = `${BaseURL}/feedingprograms/`
  }

  return api.get(url)
}

export function queryFeedingProgramBySlug(slug: string) {
  const url = `${BaseURL}/feedingprograms/${slug}`
  return api.get(url)
}

// CDM Prices
export function queryCdmPrices(pagination?: PaginationModel) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) {
    params.set("p", String(pagination.p))
  }
  if (pagination?.limit) {
    params.set("limit", String(pagination.limit))
  }
  const qs = params.toString()
  const url = `${BaseURL}/cdmprices/all${qs ? `?${qs}` : ""}`
  return api.get(url)
}

export function queryCdmPricesByClient(clientId: string, pagination?: PaginationModel) {
  let url: string

  if (pagination?.p !== undefined && pagination.p >= 2) {
    url = `${BaseURL}/cdmprices/client/${clientId}?p=${pagination.p}`
  } else {
    url = `${BaseURL}/cdmprices/client/${clientId}`
  }

  return api.get(url)
}

// Plant Nutrition
export function queryPlantNutritionCategories() {
  return api.get(`${BaseURL}/plantnutritioncategories/`)
}

export function queryAllPlantNutritionProducts(pagination?: PaginationModel & { brand?: string[], category?: string[], active_ingredient?: string[], used_on?: string[] }) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) {
    params.set('p', pagination.p.toString())
  }
  if (pagination?.brand && pagination.brand.length > 0) {
    pagination.brand.forEach(b => params.append('brand', b))
  }
  if (pagination?.category && pagination.category.length > 0) {
    pagination.category.forEach(c => params.append('category', c))
  }
  if (pagination?.active_ingredient && pagination.active_ingredient.length > 0) {
    pagination.active_ingredient.forEach(ai => params.append('active_ingredient', ai))
  }
  if (pagination?.used_on && pagination.used_on.length > 0) {
    pagination.used_on.forEach(u => params.append('used_on', u))
  }
  const qs = params.toString()
  return api.get(qs ? `${BaseURL}/plantnutrition/all?${qs}` : `${BaseURL}/plantnutrition/all`)
}

export function queryPlantNutritionProductsByCategory(options: { category: string } & PaginationModel & { brand?: string[] }) {
  const params = new URLSearchParams()
  if (options.p !== undefined && options.p >= 2) {
    params.set('p', options.p.toString())
  }
  if (options.brand && options.brand.length > 0) {
    options.brand.forEach(b => params.append('brand', b))
  }
  const qs = params.toString()
  return api.get(qs ? `${BaseURL}/plantnutrition/category/${options.category}?${qs}` : `${BaseURL}/plantnutrition/category/${options.category}`)
}

export function queryPlantNutritionProduct(slug: string) {
  return api.get(`${BaseURL}/plantnutrition/${slug}`)
}

export function queryPlantNutritionFilterAggregates(filters?: { brand?: string[], category?: string[], active_ingredient?: string[], used_on?: string[] }) {
  const params = new URLSearchParams()
  filters?.brand?.forEach(v => params.append('brand', v))
  filters?.category?.forEach(v => params.append('category', v))
  filters?.active_ingredient?.forEach(v => params.append('active_ingredient', v))
  filters?.used_on?.forEach(v => params.append('used_on', v))
  const qs = params.toString()
  return api.get(`${BaseURL}/plantnutrition/aggregates/filters${qs ? `?${qs}` : ''}`)
}

// Cart
export function getCart() {
  return api.get(`${BaseURL}/cart/get`)
}

export function addToCart(item: {
  product_id: string
  product_type: string
  product_name: string
  product_slug: string
  image_src: string
  unit_price: number
  quantity: number
  seller_id?: string
}) {
  return api.post(`${BaseURL}/cart/add`, item)
}

export function updateCartItem(product_id: string, quantity: number) {
  return api.post(`${BaseURL}/cart/update`, { product_id, quantity })
}

export function removeFromCart(product_id: string) {
  return api.post(`${BaseURL}/cart/remove`, { product_id })
}

export function clearCart() {
  return api.delete(`${BaseURL}/cart/clear`)
}

// Orders
export function checkout(data: {
  provider: string
  method: string
  phone: string
  email: string
  fulfillment: string
  address?: {
    name: string
    phone: string
    address: string
    city: string
    province: string
  }
  order_type?: string
}) {
  return api.post(`${BaseURL}/order/checkout`, data)
}

export function pollOrderStatus(reference: string) {
  return api.post(`${BaseURL}/order/poll`, { reference })
}

export function myOrders(page?: number) {
  const url = page && page >= 2 ? `${BaseURL}/order/my-orders?p=${page}` : `${BaseURL}/order/my-orders`
  return api.get(url)
}

export function getOrder(id: string) {
  return api.get(`${BaseURL}/order/${id}`)
}
