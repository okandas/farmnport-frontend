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
  let url: string

  if (pagination?.p !== undefined && pagination.p >= 2) {
    url = `${BaseURL}/prices/all?p=${pagination.p}`
  } else {
    url = `${BaseURL}/prices/all`
  }

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

export function queryPricesByProduce(produceSlug: string) {
  const url = `${BaseURL}/prices/produce/${produceSlug}`
  return api.get(url)
}

export function updateUserWantToPay(wantToPay: boolean) {
  const url = `${BaseURL}/client/want-to-pay`
  return api.post(url, { wantToPay })
}

export function queryClientFilterAggregates(type: 'buyers' | 'farmers') {
  const url = `${BaseURL}/client/aggregates/filters?type=${type}`
  return api.get(url)
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

export function queryAgroChemicalCategories() {
  const url = `${BaseURL}/agrochemicalcategories/`
  return api.get(url)
}

export function queryAllAgroChemicals(pagination?: PaginationModel & { brand?: string[], target?: string[], active_ingredient?: string[], used_on?: string[] }) {
  const params = new URLSearchParams()

  // Add pagination
  if (pagination?.p !== undefined && pagination.p >= 2) {
    params.set('p', pagination.p.toString())
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

export function queryAgroChemicalFilterAggregates() {
  const url = `${BaseURL}/agrochemical/aggregates/filters`
  return api.get(url)
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
