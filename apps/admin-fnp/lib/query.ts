import axios, { InternalAxiosRequestConfig } from "axios"
import Cookies from "js-cookie"
import * as z from "zod"

import {
  ApplicationUserID,
  AuthSchema,
  EditApplicationUser,
  ApplicationUser,
  LoginResponse,
  ProducerPriceList,
  FormAgroChemicalModel,
  ImageModel,
  Brand,
} from "@/lib/schemas"

let base = process.env.NEXT_PUBLIC_BASE_URL
let version = "/v1"
let baseUrl = base + version

let tumiraBase = process.env.NEXT_PUBLIC_TUMIRA_URL
let tumiraUrl = tumiraBase + version
let tumiraAdminUrl = tumiraBase + version + "/admin"
let tumiraSecret = process.env.NEXT_PUBLIC_TUMIRA_SECRET || ""

let api = axios.create({})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Get token in current cookies

  const token = Cookies.get("cl_jtkn")

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`
  }

  return config
})

type LoginFormData = z.infer<typeof AuthSchema>

// Administrator
export function queryLogin(data: LoginFormData) {
  let url = `${baseUrl}/user/signin`
  return api.post<LoginResponse>(url, data)
}

type pagination = {
  p?: number
  search?: string
  limit?: number
  type?: string[]
  category?: string[]
  produce?: string[]
  sort?: string
  id?: string
}

export function queryUsers(pagination?: pagination) {
  const params = new URLSearchParams()

  if (pagination?.p !== undefined && pagination.p >= 2) {
    params.append('p', pagination.p.toString())
  }

  if (pagination?.search !== undefined && pagination.search.length >= 2) {
    params.append('search', pagination.search)
  }

  if (pagination?.type !== undefined && pagination.type.length > 0) {
    params.append('type', pagination.type.join(','))
  }

  if (pagination?.category !== undefined && pagination.category.length > 0) {
    params.append('category', pagination.category.join(','))
  }

  if (pagination?.produce !== undefined && pagination.produce.length > 0) {
    params.append('produce', pagination.produce.join(','))
  }

  if (pagination?.sort !== undefined && pagination.sort.length > 0) {
    params.append('sort', pagination.sort)
  }

  if (pagination?.id !== undefined && pagination.id.length > 0) {
    params.append('id', pagination.id)
  }

  const queryString = params.toString()
  const url = queryString
    ? `${baseUrl}/user/clients?${queryString}`
    : `${baseUrl}/user/clients`

  return api.get(url)
}

export function queryPriceList(priceListID?: string) {
  const url = `${baseUrl}/prices/get/${priceListID}/producer_price`
  return api.get(url)
}

export function queryLatestProductPriceList(clientID?: string) {
  const url = `${baseUrl}/prices/latest/${clientID}/producer_price`
  return api.get(url)
}

export function queryProducerPriceLists(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.append("p", String(pagination.p))
  if (pagination?.search !== undefined && pagination.search.length >= 2) params.append("search", pagination.search)
  const qs = params.toString()
  return api.get(qs ? `${baseUrl}/prices/get/producer_prices?${qs}` : `${baseUrl}/prices/get/producer_prices`)
}

export function queryUser(name: string) {
  const url = `${baseUrl}/user/${name}`
  return api.get(url)
}

export function createClient(data: EditApplicationUser) {
  let url = `${baseUrl}/user/add_client`
  return api.post(url, data)
}

export function updateClient(data: EditApplicationUser) {
  let url = `${baseUrl}/user/update_client`
  return api.post(url, data)
}

export function verifyClient(data: ApplicationUserID) {
  let url = `${baseUrl}/user/verify_client`
  return api.post<ApplicationUser>(url, data)
}

export function badClient(data: ApplicationUserID) {
  let url = `${baseUrl}/user/bad_client`
  return api.post<ApplicationUser>(url, data)
}

export function archiveClient(data: ApplicationUserID) {
  let url = `${baseUrl}/user/archive_client`
  return api.post<ApplicationUser>(url, data)
}

export function toggleBookingClient(data: ApplicationUserID) {
  let url = `${baseUrl}/user/toggle_booking`
  return api.post<ApplicationUser>(url, data)
}

export function togglePickupClient(data: ApplicationUserID) {
  let url = `${baseUrl}/user/toggle_pickup`
  return api.post<ApplicationUser>(url, data)
}

export function impersonateClient(clientId: string) {
  let url = `${baseUrl}/user/impersonate/${clientId}`
  return api.post<LoginResponse>(url)
}

export function createClientProductPriceList(data: ProducerPriceList) {
  let url = `${baseUrl}/prices/add/producer_price`
  return api.post(url, data)
}

export function updateClientProductPriceList(data: ProducerPriceList) {
  let url = `${baseUrl}/prices/up/producer_price`
  return api.post(url, data)
}

export function deleteProducerPriceList(priceId: string) {
  let url = `${baseUrl}/prices/delete/${priceId}`
  return api.delete(url)
}

export function queryAgroChemicals(pagination?: pagination) {
  const params = new URLSearchParams()

  if (pagination?.p !== undefined && pagination.p >= 2) {
    params.append("p", pagination.p.toString())
  }

  if (pagination?.search !== undefined && pagination.search.length >= 2) {
    params.append("search", pagination.search)
  }

  const query = params.toString()
  const url = query
    ? `${baseUrl}/user/agrochemicals?${query}`
    : `${baseUrl}/user/agrochemicals`

  return api.get(url)
}

export function addAgroChemical(data: FormAgroChemicalModel) {
  let url = `${baseUrl}/user/agrochemicals/add`
  return api.post(url, data)
}

export function queryAgroChemical(id: string) {
  const url = `${baseUrl}/user/agrochemicals/${id}`
  return api.get(url)
}

export function updateAgroChemical(data: FormAgroChemicalModel) {
  let url = `${baseUrl}/user/agrochemicals/update`
  return api.post(url, data)
}

export function uploadImage(data: FormData) {
  let url = `${baseUrl}/user/image/upload`
  return api.post(url, data)
}

export function uploadImages(data: FormData) {
  let url = `${baseUrl}/user/image/uploads`
  return api.post(url, data)
}

export function removeImage(data: ImageModel) {
  let url = `${baseUrl}/user/image/remove`
  return api.post(url, data)
}

export function deleteAgroChemicals(productIds: string[]) {
  let url = `${baseUrl}/user/agrochemicals/delete`
  return api.post(url, { product_ids: productIds })
}

// Brand functions
export function queryBrands(pagination?: pagination) {
  const params = new URLSearchParams()

  if (pagination?.p !== undefined && pagination.p >= 2) {
    params.append('p', pagination.p.toString())
  }

  if (pagination?.search !== undefined && pagination.search.length >= 2) {
    params.append('search', pagination.search)
  }

  const queryString = params.toString()
  const url = queryString ? `${baseUrl}/user/brands?${queryString}` : `${baseUrl}/user/brands`

  return api.get(url)
}

export function addBrand(data: { name: string; slogan?: string }) {
  let url = `${baseUrl}/user/brands/add`
  return api.post(url, data)
}

export function queryBrand(id: string) {
  const url = `${baseUrl}/user/brands/${id}`
  return api.get(url)
}

export function updateBrand(data: { id: string; name: string; slogan?: string }) {
  let url = `${baseUrl}/user/brands/update`
  return api.post(url, data)
}

// AgroChemical Category functions
export function queryAgroChemicalCategories(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.append("p", String(pagination.p))
  if (pagination?.search !== undefined && pagination.search.length >= 2) params.append("search", pagination.search)
  const qs = params.toString()
  return api.get(qs ? `${baseUrl}/user/agrochemical-categories?${qs}` : `${baseUrl}/user/agrochemical-categories`)
}

export function queryAgroChemicalCategory(id: string) {
  const url = `${baseUrl}/user/agrochemical-categories/${id}`
  return api.get(url)
}

export function addAgroChemicalCategory(data: { name: string; short_description: string; description: string }) {
  let url = `${baseUrl}/user/agrochemical-categories/add`
  return api.post(url, data)
}

export function updateAgroChemicalCategory(data: { id: string; name: string; short_description: string; description: string }) {
  let url = `${baseUrl}/user/agrochemical-categories/update`
  return api.post(url, data)
}

export function deleteAgroChemicalCategories(categoryIds: string[]) {
  let url = `${baseUrl}/user/agrochemical-categories/delete`
  return api.post(url, { category_ids: categoryIds })
}

// AgroChemical Active Ingredient functions
export function queryAgroChemicalActiveIngredients(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.append("p", String(pagination.p))
  if (pagination?.search !== undefined && pagination.search.length >= 2) params.append("search", pagination.search)
  const qs = params.toString()
  return api.get(qs ? `${baseUrl}/user/agrochemical-active-ingredients?${qs}` : `${baseUrl}/user/agrochemical-active-ingredients`)
}

export function queryAgroChemicalActiveIngredient(id: string) {
  const url = `${baseUrl}/user/agrochemical-active-ingredients/${id}`
  return api.get(url)
}

export function queryAgroChemicalTargets(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.append("p", String(pagination.p))
  if (pagination?.search !== undefined && pagination.search.length >= 2) params.append("search", pagination.search)
  const qs = params.toString()
  return api.get(qs ? `${baseUrl}/user/agrochemical-targets?${qs}` : `${baseUrl}/user/agrochemical-targets`)
}

export function queryAgroChemicalTarget(id: string) {
  const url = `${baseUrl}/user/agrochemical-targets/${id}`
  return api.get(url)
}

export function addAgroChemicalActiveIngredient(data: { name: string; short_description: string; description: string }) {
  let url = `${baseUrl}/user/agrochemical-active-ingredients/add`
  return api.post(url, data)
}

export function updateAgroChemicalActiveIngredient(data: { id: string; name: string; short_description: string; description: string }) {
  let url = `${baseUrl}/user/agrochemical-active-ingredients/update`
  return api.post(url, data)
}

export function deleteAgroChemicalActiveIngredients(ingredientIds: string[]) {
  let url = `${baseUrl}/user/agrochemical-active-ingredients/delete`
  return api.post(url, { ingredient_ids: ingredientIds })
}

export function addAgroChemicalTarget(data: { name: string; scientific_name?: string; remark?: string }) {
  let url = `${baseUrl}/user/agrochemical-targets/add`
  return api.post(url, data)
}

export function updateAgroChemicalTarget(data: { id: string; name: string; scientific_name?: string; remark?: string }) {
  let url = `${baseUrl}/user/agrochemical-targets/update`
  return api.post(url, data)
}

export function deleteAgroChemicalTargets(targetIds: string[]) {
  let url = `${baseUrl}/user/agrochemical-targets/delete`
  return api.post(url, { target_ids: targetIds })
}

// Crop Group functions
export function queryCropGroups(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.append("p", String(pagination.p))
  if (pagination?.search !== undefined && pagination.search.length >= 2) params.append("search", pagination.search)
  const qs = params.toString()
  return api.get(qs ? `${baseUrl}/user/crop-groups?${qs}` : `${baseUrl}/user/crop-groups`)
}

export function queryCropGroup(id: string) {
  const url = `${baseUrl}/user/crop-groups/${id}`
  return api.get(url)
}

export function addCropGroup(data: { name: string; description: string; farm_produce_ids: string[] }) {
  let url = `${baseUrl}/user/crop-groups/add`
  return api.post(url, data)
}

export function updateCropGroup(data: { id: string; name: string; description: string; farm_produce_ids: string[] }) {
  let url = `${baseUrl}/user/crop-groups/update`
  return api.post(url, data)
}

export function deleteCropGroups(groupIds: string[]) {
  let url = `${baseUrl}/user/crop-groups/delete`
  return api.post(url, { group_ids: groupIds })
}

// Weed Group functions
export function queryWeedGroups(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.append("p", String(pagination.p))
  if (pagination?.search !== undefined && pagination.search.length >= 2) params.append("search", pagination.search)
  const qs = params.toString()
  return api.get(qs ? `${baseUrl}/user/weed-groups?${qs}` : `${baseUrl}/user/weed-groups`)
}

export function queryWeedGroup(id: string) {
  const url = `${baseUrl}/user/weed-groups/${id}`
  return api.get(url)
}

export function addWeedGroup(data: { name: string; description: string; target_ids: string[] }) {
  let url = `${baseUrl}/user/weed-groups/add`
  return api.post(url, data)
}

export function updateWeedGroup(data: { id: string; name: string; description: string; target_ids: string[] }) {
  let url = `${baseUrl}/user/weed-groups/update`
  return api.post(url, data)
}

export function deleteWeedGroups(groupIds: string[]) {
  let url = `${baseUrl}/user/weed-groups/delete`
  return api.post(url, { group_ids: groupIds })
}

export function queryFarmProduceCategory(slug: string) {
  const url = `${baseUrl}/farmproducecategories/${slug}`
  return api.get(url)
}

export function updateFarmProduceCategory(data: { slug: string; name: string; description: string }) {
  const url = `${baseUrl}/farmproducecategories/${data.slug}`
  return api.put(url, { name: data.name, description: data.description })
}

export function addFarmProduceCategory(data: { name: string; description: string }) {
  const url = `${baseUrl}/farmproducecategories`
  return api.post(url, data)
}

export function queryFarmProduceCategories(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.append("p", String(pagination.p))
  if (pagination?.search !== undefined && pagination.search.length >= 2) params.append("search", pagination.search)
  const qs = params.toString()
  return api.get(qs ? `${baseUrl}/farmproducecategories?${qs}` : `${baseUrl}/farmproducecategories`)
}

export function queryFarmProduce(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.append("p", String(pagination.p))
  if (pagination?.search !== undefined && pagination.search.length >= 2) params.append("search", pagination.search)
  const qs = params.toString()
  return api.get(qs ? `${baseUrl}/farmproduce?${qs}` : `${baseUrl}/farmproduce`)
}

export function queryAllFarmProduce() {
  const url = `${baseUrl}/farmproduce/all`
  return api.get(url)
}

export function queryFarmProduceBySlug(slug: string) {
  return api.get(`${baseUrl}/farmproduce/${slug}`)
}

export function addFarmProduce(data: { name: string; description: string; category_id: string; category_slug: string; lots_enabled: boolean }) {
  return api.post(`${baseUrl}/farmproduce`, data)
}

export function updateFarmProduce(data: { slug: string; name: string; description: string; category_id: string; category_slug: string; lots_enabled: boolean }) {
  return api.put(`${baseUrl}/farmproduce/${data.slug}`, data)
}

export function queryAdminLots({ p }: { p: number }) {
  const qs = new URLSearchParams({ p: String(p) })
  return api.get(`${baseUrl}/lots/admin/list?${qs}`)
}

export function approveLot(slug: string) {
  return api.post(`${baseUrl}/lots/${slug}/approve`, {})
}

export function queryAdminLot(slug: string) {
  return api.get(`${baseUrl}/lots/${slug}/admin`)
}

export function adminCreateLot(data: {
  client_id: string
  type: string
  farm_produce_id: string
  breed_id?: string
  form: string
  quantity: number
  unit: string
  price_per_unit_cents: number
  notes?: string
  expires_at: string
  main_image?: ImageModel
  images?: ImageModel[]
}) {
  return api.post(`${baseUrl}/lots/admin/create`, data)
}

export function queryLotBids(slug: string, p: number) {
  return api.get(`${baseUrl}/lots/${slug}/bids?p=${p}`)
}

export function adminAcceptBid(id: string) {
  return api.post(`${baseUrl}/bids/admin/${id}/accept`, {})
}

export function updateLot(slug: string, data: {
  client_id?: string
  type: string
  form: string
  quantity: number
  unit: string
  price_per_unit_cents: number
  notes: string
  expires_date: string
  expires_time: string
}) {
  return api.put(`${baseUrl}/lots/${slug}`, data)
}

export function queryFarmProduceStates({ p, search }: { p: number; search: string }) {
  return api.get(`${baseUrl}/farm-produce-states?p=${p}&q=${encodeURIComponent(search)}`)
}

export function queryFarmProduceByCategory(categorySlug: string) {
  const url = `${baseUrl}/farmproduce/category/${categorySlug}`
  return api.get(url)
}

// Buyer Contacts
type BuyerContactsPagination = {
  p?: number
  client_id?: string
  status?: string
}

export function queryBuyerContacts(pagination?: BuyerContactsPagination) {
  const params = new URLSearchParams()

  if (pagination?.p !== undefined && pagination.p >= 2) {
    params.append('p', pagination.p.toString())
  }

  if (pagination?.client_id) {
    params.append('client_id', pagination.client_id)
  }

  if (pagination?.status) {
    params.append('status', pagination.status)
  }

  const queryString = params.toString()
  const url = queryString
    ? `${baseUrl}/buyercontacts/list?${queryString}`
    : `${baseUrl}/buyercontacts/list`

  return api.get(url)
}

export function queryBuyerContact(id: string) {
  const url = `${baseUrl}/buyercontacts/get/${id}`
  return api.get(url)
}

export function addBuyerContact(data: any) {
  const url = `${baseUrl}/buyercontacts/add`
  return api.post(url, data)
}

export function updateBuyerContact(data: any) {
  const url = `${baseUrl}/buyercontacts/update`
  return api.post(url, data)
}

export function deleteBuyerContact(id: string) {
  const url = `${baseUrl}/buyercontacts/delete/${id}`
  return api.delete(url)
}

// Animal Health Product functions
export function queryAnimalHealthProducts(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.append("p", String(pagination.p))
  if (pagination?.search !== undefined && pagination.search.length >= 2) params.append("search", pagination.search)
  const qs = params.toString()
  return api.get(qs ? `${baseUrl}/user/animal-health-products?${qs}` : `${baseUrl}/user/animal-health-products`)
}

export function queryAnimalHealthProduct(id: string) {
  const url = `${baseUrl}/user/animal-health-products/${id}`
  return api.get(url)
}

export function addAnimalHealthProduct(data: any) {
  let url = `${baseUrl}/user/animal-health-products/add`
  return api.post(url, data)
}

export function updateAnimalHealthProduct(data: any) {
  let url = `${baseUrl}/user/animal-health-products/update`
  return api.post(url, data)
}

// Animal Health Category functions
export function queryAnimalHealthCategories(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.append("p", String(pagination.p))
  if (pagination?.search !== undefined && pagination.search.length >= 2) params.append("search", pagination.search)
  const qs = params.toString()
  return api.get(qs ? `${baseUrl}/user/animal-health-categories?${qs}` : `${baseUrl}/user/animal-health-categories`)
}

export function queryAnimalHealthCategory(id: string) {
  const url = `${baseUrl}/user/animal-health-categories/${id}`
  return api.get(url)
}

export function addAnimalHealthCategory(data: { name: string; short_description: string; description: string }) {
  let url = `${baseUrl}/user/animal-health-categories/add`
  return api.post(url, data)
}

export function updateAnimalHealthCategory(data: { id: string; name: string; short_description: string; description: string }) {
  let url = `${baseUrl}/user/animal-health-categories/update`
  return api.post(url, data)
}

export function deleteAnimalHealthCategories(categoryIds: string[]) {
  let url = `${baseUrl}/user/animal-health-categories/delete`
  return api.post(url, { category_ids: categoryIds })
}

// Animal Health Active Ingredient functions
export function queryAnimalHealthActiveIngredients(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.append("p", String(pagination.p))
  if (pagination?.search !== undefined && pagination.search.length >= 2) params.append("search", pagination.search)
  const qs = params.toString()
  return api.get(qs ? `${baseUrl}/user/animal-health-active-ingredients?${qs}` : `${baseUrl}/user/animal-health-active-ingredients`)
}

export function queryAnimalHealthActiveIngredient(id: string) {
  const url = `${baseUrl}/user/animal-health-active-ingredients/${id}`
  return api.get(url)
}

export function addAnimalHealthActiveIngredient(data: { name: string; short_description: string; description: string }) {
  let url = `${baseUrl}/user/animal-health-active-ingredients/add`
  return api.post(url, data)
}

export function updateAnimalHealthActiveIngredient(data: { id: string; name: string; short_description: string; description: string }) {
  let url = `${baseUrl}/user/animal-health-active-ingredients/update`
  return api.post(url, data)
}

export function deleteAnimalHealthActiveIngredients(ingredientIds: string[]) {
  let url = `${baseUrl}/user/animal-health-active-ingredients/delete`
  return api.post(url, { ingredient_ids: ingredientIds })
}

// Animal Health Target functions
export function queryAnimalHealthTargets(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.append("p", String(pagination.p))
  if (pagination?.search !== undefined && pagination.search.length >= 2) params.append("search", pagination.search)
  const qs = params.toString()
  return api.get(qs ? `${baseUrl}/user/animal-health-targets?${qs}` : `${baseUrl}/user/animal-health-targets`)
}

export function queryAnimalHealthTarget(id: string) {
  const url = `${baseUrl}/user/animal-health-targets/${id}`
  return api.get(url)
}

export function addAnimalHealthTarget(data: { name: string; scientific_name?: string; description?: string; damage_type?: string; remark?: string }) {
  let url = `${baseUrl}/user/animal-health-targets/add`
  return api.post(url, data)
}

export function updateAnimalHealthTarget(data: { id: string; name: string; scientific_name?: string; description?: string; damage_type?: string; remark?: string }) {
  let url = `${baseUrl}/user/animal-health-targets/update`
  return api.post(url, data)
}

export function deleteAnimalHealthTargets(targetIds: string[]) {
  let url = `${baseUrl}/user/animal-health-targets/delete`
  return api.post(url, { target_ids: targetIds })
}

// Spray Program functions

export function querySprayPrograms(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) {
    params.set("p", String(pagination.p))
  }
  if (pagination?.search !== undefined && pagination.search.length >= 2) {
    params.set("search", pagination.search)
  }
  const qs = params.toString()
  const url = `${baseUrl}/user/spray-programs${qs ? `?${qs}` : ""}`
  return api.get(url)
}

export function querySprayProgram(id: string) {
  const url = `${baseUrl}/user/spray-programs/${id}`
  return api.get(url)
}

export function addSprayProgram(data: any) {
  let url = `${baseUrl}/user/spray-programs/add`
  return api.post(url, data)
}

export function updateSprayProgram(data: any) {
  let url = `${baseUrl}/user/spray-programs/update`
  return api.post(url, data)
}

export function deleteSprayPrograms(programIds: string[]) {
  let url = `${baseUrl}/user/spray-programs/delete`
  return api.post(url, { program_ids: programIds })
}

// CDM Price functions
export function queryCdmPrices(pagination?: pagination) {
  let url: string
  if (pagination?.p !== undefined && pagination.p >= 2) {
    url = `${baseUrl}/cdmprices/get?p=${pagination.p}`
  } else {
    url = `${baseUrl}/cdmprices/get`
  }
  return api.get(url)
}

export function queryCdmPrice(id: string) {
  const url = `${baseUrl}/cdmprices/get/${id}`
  return api.get(url)
}

export function addCdmPrice(data: any) {
  let url = `${baseUrl}/cdmprices/add`
  return api.post(url, data)
}

export function updateCdmPrice(data: any) {
  let url = `${baseUrl}/cdmprices/update`
  return api.post(url, data)
}

export function deleteCdmPrice(priceId: string) {
  let url = `${baseUrl}/cdmprices/delete/${priceId}`
  return api.delete(url)
}

// Feed Product functions
export function queryFeedProducts(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.append("p", String(pagination.p))
  if (pagination?.search !== undefined && pagination.search.length >= 2) params.append("search", pagination.search)
  const qs = params.toString()
  return api.get(qs ? `${baseUrl}/user/feed-products?${qs}` : `${baseUrl}/user/feed-products`)
}

export function queryFeedProduct(id: string) {
  const url = `${baseUrl}/user/feed-products/${id}`
  return api.get(url)
}

export function addFeedProduct(data: any) {
  let url = `${baseUrl}/user/feed-products/add`
  return api.post(url, data)
}

export function updateFeedProduct(data: any) {
  let url = `${baseUrl}/user/feed-products/update`
  return api.post(url, data)
}

// Feed Category functions
export function queryFeedCategories(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.append("p", String(pagination.p))
  if (pagination?.search !== undefined && pagination.search.length >= 2) params.append("search", pagination.search)
  const qs = params.toString()
  return api.get(qs ? `${baseUrl}/user/feed-categories?${qs}` : `${baseUrl}/user/feed-categories`)
}

export function queryFeedCategory(id: string) {
  const url = `${baseUrl}/user/feed-categories/${id}`
  return api.get(url)
}

export function addFeedCategory(data: { name: string; short_description: string; description: string }) {
  let url = `${baseUrl}/user/feed-categories/add`
  return api.post(url, data)
}

export function updateFeedCategory(data: { id: string; name: string; short_description: string; description: string }) {
  let url = `${baseUrl}/user/feed-categories/update`
  return api.post(url, data)
}

export function deleteFeedCategories(categoryIds: string[]) {
  let url = `${baseUrl}/user/feed-categories/delete`
  return api.post(url, { category_ids: categoryIds })
}

// Feed Active Ingredient functions
export function queryFeedActiveIngredients(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.append("p", String(pagination.p))
  if (pagination?.search !== undefined && pagination.search.length >= 2) params.append("search", pagination.search)
  const qs = params.toString()
  return api.get(qs ? `${baseUrl}/user/feed-active-ingredients?${qs}` : `${baseUrl}/user/feed-active-ingredients`)
}

export function queryFeedActiveIngredient(id: string) {
  const url = `${baseUrl}/user/feed-active-ingredients/${id}`
  return api.get(url)
}

export function addFeedActiveIngredient(data: { name: string; short_description: string; description: string }) {
  let url = `${baseUrl}/user/feed-active-ingredients/add`
  return api.post(url, data)
}

export function updateFeedActiveIngredient(data: { id: string; name: string; short_description: string; description: string }) {
  let url = `${baseUrl}/user/feed-active-ingredients/update`
  return api.post(url, data)
}

export function deleteFeedActiveIngredients(ingredientIds: string[]) {
  let url = `${baseUrl}/user/feed-active-ingredients/delete`
  return api.post(url, { ingredient_ids: ingredientIds })
}

// Feed Nutritional Spec functions
export function queryFeedNutritionalSpecs(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.append("p", String(pagination.p))
  if (pagination?.search !== undefined && pagination.search.length >= 2) params.append("search", pagination.search)
  const qs = params.toString()
  return api.get(qs ? `${baseUrl}/user/feed-nutritional-specs?${qs}` : `${baseUrl}/user/feed-nutritional-specs`)
}

export function queryFeedNutritionalSpec(id: string) {
  const url = `${baseUrl}/user/feed-nutritional-specs/${id}`
  return api.get(url)
}

export function addFeedNutritionalSpec(data: { name: string; short_description: string; description: string }) {
  let url = `${baseUrl}/user/feed-nutritional-specs/add`
  return api.post(url, data)
}

export function updateFeedNutritionalSpec(data: { id: string; name: string; short_description: string; description: string }) {
  let url = `${baseUrl}/user/feed-nutritional-specs/update`
  return api.post(url, data)
}

export function deleteFeedNutritionalSpecs(specIds: string[]) {
  let url = `${baseUrl}/user/feed-nutritional-specs/delete`
  return api.post(url, { spec_ids: specIds })
}

// Feed Target functions
export function queryFeedTargets(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.append("p", String(pagination.p))
  if (pagination?.search !== undefined && pagination.search.length >= 2) params.append("search", pagination.search)
  const qs = params.toString()
  return api.get(qs ? `${baseUrl}/user/feed-targets?${qs}` : `${baseUrl}/user/feed-targets`)
}

export function queryFeedTarget(id: string) {
  const url = `${baseUrl}/user/feed-targets/${id}`
  return api.get(url)
}

export function addFeedTarget(data: { name: string; scientific_name?: string; description?: string; damage_type?: string; remark?: string }) {
  let url = `${baseUrl}/user/feed-targets/add`
  return api.post(url, data)
}

export function updateFeedTarget(data: { id: string; name: string; scientific_name?: string; description?: string; damage_type?: string; remark?: string }) {
  let url = `${baseUrl}/user/feed-targets/update`
  return api.post(url, data)
}

export function deleteFeedTargets(targetIds: string[]) {
  let url = `${baseUrl}/user/feed-targets/delete`
  return api.post(url, { target_ids: targetIds })
}

// Feeding Program functions
export function queryFeedingPrograms(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.append("p", String(pagination.p))
  if (pagination?.search !== undefined && pagination.search.length >= 2) params.append("search", pagination.search)
  const qs = params.toString()
  return api.get(qs ? `${baseUrl}/user/feeding-programs?${qs}` : `${baseUrl}/user/feeding-programs`)
}

export function queryFeedingProgram(id: string) {
  const url = `${baseUrl}/user/feeding-programs/${id}`
  return api.get(url)
}

export function addFeedingProgram(data: any) {
  let url = `${baseUrl}/user/feeding-programs/add`
  return api.post(url, data)
}

export function updateFeedingProgram(data: any) {
  let url = `${baseUrl}/user/feeding-programs/update`
  return api.post(url, data)
}

export function deleteFeedingPrograms(programIds: string[]) {
  let url = `${baseUrl}/user/feeding-programs/delete`
  return api.post(url, { program_ids: programIds })
}

export function queryDashboardStats() {
  let url = `${baseUrl}/user/dashboard-stats`
  return api.get(url)
}

export function queryContactViewsStats() {
  const url = `${baseUrl}/views/admin/stats`
  return api.get(url)
}

export function queryTopViewers(page: number, limit: number) {
  const url = `${baseUrl}/views/admin/top-viewers?page=${page}&limit=${limit}`
  return api.get(url)
}

export function queryRecentViewedContacts(page: number, limit: number) {
  const url = `${baseUrl}/views/admin/recent-viewed?page=${page}&limit=${limit}`
  return api.get(url)
}

export function queryContactViewDetail(contactId: string, page: number, limit: number) {
  const url = `${baseUrl}/views/admin/contact/${contactId}?page=${page}&limit=${limit}`
  return api.get(url)
}

export function queryViewerDetail(viewerId: string, page: number, limit: number) {
  const url = `${baseUrl}/views/admin/viewer/${viewerId}?page=${page}&limit=${limit}`
  return api.get(url)
}

// Orders & Sales
type orderPagination = {
  p?: number
  search?: string
  limit?: number
  status?: string
  order_type?: string
}

export function queryOrders(pagination?: orderPagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) {
    params.append("p", pagination.p.toString())
  }
  if (pagination?.search !== undefined && pagination.search.length >= 2) {
    params.append("search", pagination.search)
  }
  if (pagination?.limit !== undefined) {
    params.append("limit", pagination.limit.toString())
  }
  if (pagination?.status) {
    params.append("status", pagination.status)
  }
  if (pagination?.order_type) {
    params.append("order_type", pagination.order_type)
  }
  const qs = params.toString()
  const url = `${baseUrl}/user/orders${qs ? `?${qs}` : ""}`
  return api.get(url)
}

export function queryOrder(id: string) {
  const url = `${baseUrl}/user/orders/${id}`
  return api.get(url)
}

export function updateOrderStatus(data: { order_id: string; status: string; note?: string }) {
  const url = `${baseUrl}/user/orders/update-status`
  return api.post(url, data)
}

export function querySalesStats(orderType?: string) {
  const params = new URLSearchParams()
  if (orderType) {
    params.append("order_type", orderType)
  }
  const qs = params.toString()
  const url = `${baseUrl}/user/sales-stats${qs ? `?${qs}` : ""}`
  return api.get(url)
}

// Notifications
export function queryUnreadNotificationCount() {
  const url = `${baseUrl}/user/notifications/unread-count`
  return api.get(url)
}

export function queryRecentNotifications() {
  const url = `${baseUrl}/user/notifications/recent`
  return api.get(url)
}

export function queryNotificationsList(page: number) {
  const url = `${baseUrl}/admin-notifications/list?p=${page}`
  return api.get(url)
}

export function markNotificationsRead(data: { ids?: string[]; all?: boolean }) {
  const url = `${baseUrl}/user/notifications/mark-read`
  return api.post(url, data)
}

// Restaurants
export function addRestaurant(data: {
  name: string
  status: string
  cuisines: {
    cuisine_category_id: string
    cuisine_category_name: string
    cuisine_category_slug: string
  }[]
}) {
  let url = `${baseUrl}/restaurants/add`
  return api.post(url, data)
}

export function queryRestaurants(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) {
    params.set("p", String(pagination.p))
  }
  if (pagination?.search !== undefined && pagination.search.length >= 2) {
    params.set("search", pagination.search)
  }
  if (pagination?.limit !== undefined) {
    params.set("limit", String(pagination.limit))
  }
  const qs = params.toString()
  const url = `${baseUrl}/restaurants/list${qs ? `?${qs}` : ""}`
  return api.get(url)
}

export function queryRestaurant(id: string) {
  let url = `${baseUrl}/restaurants/get/${id}`
  return api.get(url)
}

export function updateRestaurant(data: any) {
  let url = `${baseUrl}/restaurants/update`
  return api.post(url, data)
}

export function deleteRestaurant(id: string) {
  let url = `${baseUrl}/restaurants/delete/${id}`
  return api.delete(url)
}

// Restaurant Cuisines (junction)
export function queryRestaurantCuisines(restaurantId: string) {
  let url = `${baseUrl}/restaurants/cuisines/${restaurantId}`
  return api.get(url)
}

export function addRestaurantCuisine(data: {
  restaurant_id: string
  restaurant_name: string
  cuisine_category_id: string
  cuisine_category_name: string
  cuisine_category_slug: string
}) {
  let url = `${baseUrl}/restaurants/cuisines/add`
  return api.post(url, data)
}

export function deleteRestaurantCuisine(id: string) {
  let url = `${baseUrl}/restaurants/cuisines/delete/${id}`
  return api.delete(url)
}

// Restaurant Locations
export function addRestaurantLocation(data: any) {
  let url = `${baseUrl}/restaurant-locations/add`
  return api.post(url, data)
}

export function queryRestaurantLocations(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) {
    params.set("p", String(pagination.p))
  }
  if (pagination?.search !== undefined && pagination.search.length >= 2) {
    params.set("search", pagination.search.replace(/[^a-zA-Z0-9\s]/g, ""))
  }
  const qs = params.toString()
  const url = `${baseUrl}/restaurant-locations/list${qs ? `?${qs}` : ""}`
  return api.get(url)
}

export function queryRestaurantLocationsByRestaurant(restaurantId: string) {
  return api.get(`${baseUrl}/restaurant-locations/list?restaurant_id=${restaurantId}&limit=100`)
}

export function queryRestaurantLocation(id: string) {
  let url = `${baseUrl}/restaurant-locations/get/${id}`
  return api.get(url)
}

export function updateRestaurantLocation(data: any) {
  let url = `${baseUrl}/restaurant-locations/update`
  return api.post(url, data)
}

export function deleteRestaurantLocation(id: string) {
  let url = `${baseUrl}/restaurant-locations/delete/${id}`
  return api.delete(url)
}

// Menu Categories
export function queryMenuCategories(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) {
    params.set("p", String(pagination.p))
  }
  if (pagination?.search !== undefined && pagination.search.length >= 2) {
    params.set("search", pagination.search)
  }
  if (pagination?.limit !== undefined) {
    params.set("limit", String(pagination.limit))
  }
  const qs = params.toString()
  const url = `${baseUrl}/menu-categories/list${qs ? `?${qs}` : ""}`
  return api.get(url)
}

export function queryMenuCategory(id: string) {
  let url = `${baseUrl}/menu-categories/get/${id}`
  return api.get(url)
}

export function addMenuCategory(data: { name: string; description: string }) {
  let url = `${baseUrl}/menu-categories/add`
  return api.post(url, data)
}

export function updateMenuCategory(data: { id: string; name: string; description: string }) {
  let url = `${baseUrl}/menu-categories/update`
  return api.post(url, data)
}

export function deleteMenuCategory(id: string) {
  let url = `${baseUrl}/menu-categories/delete/${id}`
  return api.delete(url)
}

// Cuisine Categories
export function queryCuisineCategories(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) {
    params.set("p", String(pagination.p))
  }
  if (pagination?.search !== undefined && pagination.search.length >= 2) {
    params.set("search", pagination.search)
  }
  if (pagination?.limit !== undefined) {
    params.set("limit", String(pagination.limit))
  }
  const qs = params.toString()
  const url = `${baseUrl}/cuisine-categories/list${qs ? `?${qs}` : ""}`
  return api.get(url)
}

export function queryCuisineCategory(id: string) {
  let url = `${baseUrl}/cuisine-categories/get/${id}`
  return api.get(url)
}

export function addCuisineCategory(data: { name: string; description: string }) {
  let url = `${baseUrl}/cuisine-categories/add`
  return api.post(url, data)
}

export function updateCuisineCategory(data: { id: string; name: string; description: string }) {
  let url = `${baseUrl}/cuisine-categories/update`
  return api.post(url, data)
}

export function deleteCuisineCategory(id: string) {
  let url = `${baseUrl}/cuisine-categories/delete/${id}`
  return api.delete(url)
}

// Menu Item Categories
export function queryMenuItemCategories(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) {
    params.set("p", String(pagination.p))
  }
  if (pagination?.search !== undefined && pagination.search.length >= 2) {
    params.set("search", pagination.search)
  }
  if (pagination?.limit !== undefined) {
    params.set("limit", String(pagination.limit))
  }
  const qs = params.toString()
  const url = `${baseUrl}/menu-item-categories/list${qs ? `?${qs}` : ""}`
  return api.get(url)
}

export function queryMenuItemCategory(id: string) {
  let url = `${baseUrl}/menu-item-categories/get/${id}`
  return api.get(url)
}

export function addMenuItemCategory(data: { name: string }) {
  let url = `${baseUrl}/menu-item-categories/add`
  return api.post(url, data)
}

export function updateMenuItemCategory(data: { id: string; name: string }) {
  let url = `${baseUrl}/menu-item-categories/update`
  return api.post(url, data)
}

export function deleteMenuItemCategory(id: string) {
  let url = `${baseUrl}/menu-item-categories/delete/${id}`
  return api.delete(url)
}

// Menu Item Components
export function queryMenuItemComponents(pagination?: pagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) {
    params.set("p", String(pagination.p))
  }
  if (pagination?.search !== undefined && pagination.search.length >= 2) {
    params.set("search", pagination.search)
  }
  const qs = params.toString()
  const url = `${baseUrl}/menu-item-components/list${qs ? `?${qs}` : ""}`
  return api.get(url)
}

export function queryMenuItemComponent(id: string) {
  let url = `${baseUrl}/menu-item-components/get/${id}`
  return api.get(url)
}

export function addMenuItemComponent(data: { name: string }) {
  let url = `${baseUrl}/menu-item-components/add`
  return api.post(url, data)
}

export function updateMenuItemComponent(data: { id: string; name: string }) {
  let url = `${baseUrl}/menu-item-components/update`
  return api.post(url, data)
}

export function deleteMenuItemComponent(id: string) {
  let url = `${baseUrl}/menu-item-components/delete/${id}`
  return api.delete(url)
}

// Menus
type menuPagination = pagination & {
  location_id?: string
}

export function queryMenus(pagination?: menuPagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) {
    params.set("p", String(pagination.p))
  }
  if (pagination?.search !== undefined && pagination.search.length >= 2) {
    params.set("search", pagination.search)
  }
  if (pagination?.location_id) {
    params.set("location_id", pagination.location_id)
  }
  const qs = params.toString()
  const url = `${baseUrl}/menus/list${qs ? `?${qs}` : ""}`
  return api.get(url)
}

export function queryMenu(id: string) {
  let url = `${baseUrl}/menus/get/${id}`
  return api.get(url)
}

export function addMenu(data: any) {
  let url = `${baseUrl}/menus/add`
  return api.post(url, data)
}

export function updateMenu(data: any) {
  let url = `${baseUrl}/menus/update`
  return api.post(url, data)
}

export function deleteMenu(id: string) {
  let url = `${baseUrl}/menus/delete/${id}`
  return api.delete(url)
}

// Menu Items
type menuItemPagination = pagination & {
  category_id?: string
  menu_id?: string
}

export function queryMenuItems(pagination?: menuItemPagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) {
    params.set("p", String(pagination.p))
  }
  if (pagination?.search !== undefined && pagination.search.length >= 2) {
    params.set("search", pagination.search)
  }
  if (pagination?.category_id) {
    params.set("category_id", pagination.category_id)
  }
  if (pagination?.menu_id) {
    params.set("menu_id", pagination.menu_id)
  }
  const qs = params.toString()
  const url = `${baseUrl}/menu-items/list${qs ? `?${qs}` : ""}`
  return api.get(url)
}

export function queryMenuItem(id: string) {
  let url = `${baseUrl}/menu-items/get/${id}`
  return api.get(url)
}

export function addMenuItem(data: any) {
  let url = `${baseUrl}/menu-items/add`
  return api.post(url, data)
}

export function updateMenuItem(data: any) {
  let url = `${baseUrl}/menu-items/update`
  return api.post(url, data)
}

export function deleteMenuItem(id: string) {
  let url = `${baseUrl}/menu-items/delete/${id}`
  return api.delete(url)
}

// Menu Item Add-Ons
type menuItemAddOnPagination = pagination & {
  menu_id?: string
  category_id?: string
}

export function queryMenuItemAddOns(pagination?: menuItemAddOnPagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) {
    params.set("p", String(pagination.p))
  }
  if (pagination?.search !== undefined && pagination.search.length >= 2) {
    params.set("search", pagination.search)
  }
  if (pagination?.menu_id) {
    params.set("menu_id", pagination.menu_id)
  }
  if (pagination?.category_id) {
    params.set("category_id", pagination.category_id)
  }
  const qs = params.toString()
  const url = `${baseUrl}/menu-item-add-ons/list${qs ? `?${qs}` : ""}`
  return api.get(url)
}

export function queryMenuItemAddOn(id: string) {
  let url = `${baseUrl}/menu-item-add-ons/get/${id}`
  return api.get(url)
}

export function addMenuItemAddOn(data: any) {
  let url = `${baseUrl}/menu-item-add-ons/add`
  return api.post(url, data)
}

export function updateMenuItemAddOn(data: any) {
  let url = `${baseUrl}/menu-item-add-ons/update`
  return api.post(url, data)
}

export function deleteMenuItemAddOn(id: string) {
  let url = `${baseUrl}/menu-item-add-ons/delete/${id}`
  return api.delete(url)
}


// Subscription Plans
export function querySubscriptionPlans(params?: { status?: string; tier?: string }) {
  const query = new URLSearchParams()
  if (params?.status) query.set("status", params.status)
  if (params?.tier) query.set("tier", params.tier)
  const qs = query.toString()
  return api.get(`${baseUrl}/restaurant-subscription-plans/list${qs ? `?${qs}` : ""}`)
}

export function querySubscriptionPlan(id: string) {
  return api.get(`${baseUrl}/restaurant-subscription-plans/get/${id}`)
}

export function addSubscriptionPlan(data: any) {
  return api.post(`${baseUrl}/restaurant-subscription-plans/add`, data)
}

export function updateSubscriptionPlan(id: string, data: any) {
  return api.post(`${baseUrl}/restaurant-subscription-plans/update/${id}`, data)
}

// Restaurant Subscriptions
export function queryRestaurantSubscriptions(params?: { restaurant_id?: string; status?: string; p?: number }) {
  const query = new URLSearchParams()
  if (params?.restaurant_id) query.set("restaurant_id", params.restaurant_id)
  if (params?.status) query.set("status", params.status)
  if (params?.p) query.set("p", String(params.p))
  const qs = query.toString()
  return api.get(`${baseUrl}/restaurant-subscriptions/list${qs ? `?${qs}` : ""}`)
}

export function addRestaurantSubscription(data: any) {
  return api.post(`${baseUrl}/restaurant-subscriptions/add`, data)
}

export function queryRestaurantSubscription(id: string) {
  return api.get(`${baseUrl}/restaurant-subscriptions/get/${id}`)
}

export function cancelRestaurantSubscription(id: string) {
  return api.post(`${baseUrl}/restaurant-subscriptions/cancel/${id}`, {})
}

export function activateRestaurantSubscription(id: string) {
  return api.post(`${baseUrl}/restaurant-subscriptions/activate/${id}`, {})
}

// Location Subscriptions
export function queryLocationSubscriptions(params?: { restaurant_id?: string; location_id?: string; status?: string; p?: number }) {
  const query = new URLSearchParams()
  if (params?.restaurant_id) query.set("restaurant_id", params.restaurant_id)
  if (params?.location_id) query.set("location_id", params.location_id)
  if (params?.status) query.set("status", params.status)
  if (params?.p) query.set("p", String(params.p))
  const qs = query.toString()
  return api.get(`${baseUrl}/restaurant-location-subscriptions/list${qs ? `?${qs}` : ""}`)
}

export function addLocationSubscription(data: any) {
  return api.post(`${baseUrl}/restaurant-location-subscriptions/add`, data)
}

export function renewLocationSubscription(id: string, data?: any) {
  return api.post(`${baseUrl}/restaurant-location-subscriptions/renew/${id}`, data ?? {})
}

export function cancelLocationSubscription(id: string) {
  return api.post(`${baseUrl}/restaurant-location-subscriptions/cancel/${id}`, {})
}

export function queryLocationPayments(params?: { restaurant_id?: string; location_id?: string; subscription_id?: string; p?: number }) {
  const query = new URLSearchParams()
  if (params?.restaurant_id) query.set("restaurant_id", params.restaurant_id)
  if (params?.location_id) query.set("location_id", params.location_id)
  if (params?.subscription_id) query.set("subscription_id", params.subscription_id)
  if (params?.p) query.set("p", String(params.p))
  const qs = query.toString()
  return api.get(`${baseUrl}/restaurant-location-payments/list${qs ? `?${qs}` : ""}`)
}

// Location Seats
export function queryLocationSeats(params?: { subscription_id?: string; restaurant_id?: string; status?: string; p?: number }) {
  const query = new URLSearchParams()
  if (params?.subscription_id) query.set("subscription_id", params.subscription_id)
  if (params?.restaurant_id) query.set("restaurant_id", params.restaurant_id)
  if (params?.status) query.set("status", params.status)
  if (params?.p) query.set("p", String(params.p))
  const qs = query.toString()
  return api.get(`${baseUrl}/restaurant-location-seats/list${qs ? `?${qs}` : ""}`)
}

export function addLocationSeat(data: { subscription_id: string; location_id: string }) {
  return api.post(`${baseUrl}/restaurant-location-seats/add`, data)
}

// Invoices
export function queryRestaurantInvoices(params?: { subscription_id?: string; restaurant_id?: string; status?: string; p?: number }) {
  const query = new URLSearchParams()
  if (params?.subscription_id) query.set("subscription_id", params.subscription_id)
  if (params?.restaurant_id) query.set("restaurant_id", params.restaurant_id)
  if (params?.status) query.set("status", params.status)
  if (params?.p) query.set("p", String(params.p))
  const qs = query.toString()
  return api.get(`${baseUrl}/restaurant-invoices/list${qs ? `?${qs}` : ""}`)
}

export function queryRestaurantInvoice(id: string) {
  return api.get(`${baseUrl}/restaurant-invoices/get/${id}`)
}

// Menus Contact Views
export function queryMenusContactViewStats(p?: number) {
  const params = new URLSearchParams()
  if (p !== undefined && p >= 2) params.set("p", String(p))
  const qs = params.toString()
  return api.get(`${baseUrl}/menus-contact-views/stats${qs ? `?${qs}` : ""}`)
}

export function queryMenusContactViewList(params?: { p?: number; location_id?: string; type?: string }) {
  const query = new URLSearchParams()
  if (params?.p !== undefined && params.p >= 2) query.set("p", String(params.p))
  if (params?.location_id) query.set("location_id", params.location_id)
  if (params?.type) query.set("type", params.type)
  const qs = query.toString()
  return api.get(`${baseUrl}/menus-contact-views/list${qs ? `?${qs}` : ""}`)
}

// Bookings (admin)
export function queryAdminBookings(params?: { type?: string; status?: string; location_id?: string; p?: number }) {
  const query = new URLSearchParams()
  if (params?.type) query.set("type", params.type)
  if (params?.status) query.set("status", params.status)
  if (params?.location_id) query.set("location_id", params.location_id)
  if (params?.p !== undefined && params.p >= 2) query.set("p", String(params.p))
  const qs = query.toString()
  return api.get(`${baseUrl}/booking/admin/list${qs ? `?${qs}` : ""}`)
}

export function queryAdminBooking(id: string) {
  return api.get(`${baseUrl}/booking/admin/${id}`)
}

export function updateBookingStatus(id: string, status: string, note?: string) {
  return api.put(`${baseUrl}/booking/admin/${id}/status`, { status, note })
}

export function queryAdminBookingEvents(status?: string) {
  const qs = status ? `?status=${status}` : ""
  return api.get(`${baseUrl}/booking/admin/events${qs}`)
}

export function createBookingEvent(data: {
  title: string
  description?: string
  client_id: string
  client_name: string
  brand_id?: string
  brand_name?: string
  product_id: string
  product_name: string
  product_slug: string
  product_type: string
  unit?: string
  name?: string
  unit_price: number
  deposit_per_unit: number
  min_quantity?: number
  max_quantity?: number
  total_available: number
  open_date: string
  close_date: string
  status?: string
  image_src?: string
  delivery_locations?: { id: string; name: string }[]
}) {
  return api.post(`${baseUrl}/booking/admin/events`, data)
}

export function updateBookingEvent(id: string, data: Partial<{
  title: string
  description: string
  client_id: string
  client_name: string
  brand_id: string
  brand_name: string
  product_id: string
  product_name: string
  product_slug: string
  product_type: string
  unit: string
  name: string
  status: string
  total_available: number
  unit_price: number
  deposit_per_unit: number
  min_quantity: number
  max_quantity: number
  open_date: string
  close_date: string
  image_src: string
  delivery_locations: { id: string; name: string }[]
  collection_locations: { id: string; name: string }[]
}>) {
  return api.put(`${baseUrl}/booking/admin/events/${id}`, data)
}

export function queryClientLocations() {
  return api.get(`${baseUrl}/booking/client-locations`)
}

export function createDeliveryLocation(data: {
  types?: string[]
  name: string
  address: string
  city: string
  time_slots: string[]
  phones: string[]
  latitude?: number
  longitude?: number
  active?: boolean
}) {
  return api.post(`${baseUrl}/booking/admin/client-locations`, data)
}

export function updateDeliveryLocation(id: string, data: Partial<{
  types: string[]
  name: string
  address: string
  city: string
  time_slots: string[]
  phones: string[]
  latitude: number
  longitude: number
  active: boolean
}>) {
  return api.put(`${baseUrl}/booking/admin/client-locations/${id}`, data)
}

// Livestock Poultry
export function queryLivestockPoultryProducts(pagination?: { p?: number; search?: string; seller_id?: string; brand_id?: string }) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.append("p", String(pagination.p))
  if (pagination?.search !== undefined && pagination.search.length >= 2) params.append("search", pagination.search)
  if (pagination?.seller_id) params.append("seller_id", pagination.seller_id)
  if (pagination?.brand_id) params.append("brand_id", pagination.brand_id)
  const qs = params.toString()
  return api.get(qs ? `${baseUrl}/user/livestock-poultry?${qs}` : `${baseUrl}/user/livestock-poultry`)
}

export function queryLivestockPoultryProduct(id: string) {
  return api.get(`${baseUrl}/user/livestock-poultry/${id}`)
}

export function addLivestockPoultryProduct(data: any) {
  return api.post(`${baseUrl}/user/livestock-poultry/add`, data)
}

export function updateLivestockPoultryProduct(data: any) {
  return api.post(`${baseUrl}/user/livestock-poultry/update`, data)
}

// Seed Products
export function querySeedProducts(pagination?: { p?: number; search?: string; seller_id?: string; brand_id?: string }) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.append("p", String(pagination.p))
  if (pagination?.search !== undefined && pagination.search.length >= 2) params.append("search", pagination.search)
  if (pagination?.seller_id) params.append("seller_id", pagination.seller_id)
  if (pagination?.brand_id) params.append("brand_id", pagination.brand_id)
  const qs = params.toString()
  return api.get(qs ? `${baseUrl}/user/seed-products?${qs}` : `${baseUrl}/user/seed-products`)
}

export function querySeedProduct(id: string) {
  return api.get(`${baseUrl}/user/seed-products/${id}`)
}

export function addSeedProduct(data: any) {
  return api.post(`${baseUrl}/user/seed-products/add`, data)
}

export function updateSeedProduct(data: any) {
  return api.post(`${baseUrl}/user/seed-products/update`, data)
}

// Breeds
export function queryBreeds(pagination?: { p?: number; search?: string; farm_produce_id?: string }) {
  let url = `${baseUrl}/breeds`
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.append("p", String(pagination.p))
  if (pagination?.search !== undefined && pagination.search.length >= 2) params.append("search", pagination.search)
  if (pagination?.farm_produce_id) params.append("farm_produce_id", pagination.farm_produce_id)
  const qs = params.toString()
  if (qs) url = `${baseUrl}/breeds?${qs}`
  return api.get(url)
}

export function queryBreed(id: string) {
  return api.get(`${baseUrl}/breeds/${id}`)
}

export function addBreed(data: { name: string; farm_produce_id: string; description?: string }) {
  return api.post(`${baseUrl}/breeds/`, data)
}

export function updateBreed(data: { id: string; name: string; farm_produce_id: string; description?: string }) {
  return api.put(`${baseUrl}/breeds/${data.id}`, data)
}

export function deleteBreed(id: string) {
  return api.delete(`${baseUrl}/breeds/${id}`)
}

// ── Tumira ────────────────────────────────────────────────────────────────────

type tumiraPagination = { p?: number; search?: string; limit?: number }

const tumiraAdminHeaders = { "X-Admin-Secret": tumiraSecret }

export function queryTumiraWards(pagination?: tumiraPagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.set("p", String(pagination.p))
  if (pagination?.search && pagination.search.length >= 2) params.set("search", pagination.search)
  if (pagination?.limit !== undefined) params.set("limit", String(pagination.limit))
  const qs = params.toString()
  return api.get(`${tumiraAdminUrl}/zones${qs ? `?${qs}` : ""}`, { headers: tumiraAdminHeaders })
}

export function queryTumiraCouriers(pagination?: tumiraPagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.set("p", String(pagination.p))
  if (pagination?.search && pagination.search.length >= 2) params.set("search", pagination.search)
  if (pagination?.limit !== undefined) params.set("limit", String(pagination.limit))
  const qs = params.toString()
  return api.get(`${tumiraAdminUrl}/couriers${qs ? `?${qs}` : ""}`, { headers: tumiraAdminHeaders })
}

export function queryTumiraCourierRates(pagination?: tumiraPagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.set("p", String(pagination.p))
  if (pagination?.search && pagination.search.length >= 2) params.set("search", pagination.search)
  if (pagination?.limit !== undefined) params.set("limit", String(pagination.limit))
  const qs = params.toString()
  return api.get(`${tumiraAdminUrl}/courier-rates${qs ? `?${qs}` : ""}`, { headers: tumiraAdminHeaders })
}

export function queryTumiraDeliveryPoints(pagination?: tumiraPagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.set("p", String(pagination.p))
  if (pagination?.search && pagination.search.length >= 2) params.set("search", pagination.search)
  if (pagination?.limit !== undefined) params.set("limit", String(pagination.limit))
  const qs = params.toString()
  return api.get(`${tumiraAdminUrl}/points${qs ? `?${qs}` : ""}`, { headers: tumiraAdminHeaders })
}

export function queryTumiraVanityCodes(pagination?: tumiraPagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.set("p", String(pagination.p))
  if (pagination?.search && pagination.search.length >= 2) params.set("search", pagination.search)
  if (pagination?.limit !== undefined) params.set("limit", String(pagination.limit))
  const qs = params.toString()
  return api.get(`${tumiraAdminUrl}/vanity${qs ? `?${qs}` : ""}`, { headers: tumiraAdminHeaders })
}

export function queryTumiraGeocodedAddresses(pagination?: tumiraPagination) {
  const params = new URLSearchParams()
  if (pagination?.p !== undefined && pagination.p >= 2) params.set("p", String(pagination.p))
  if (pagination?.search && pagination.search.length >= 2) params.set("search", pagination.search)
  if (pagination?.limit !== undefined) params.set("limit", String(pagination.limit))
  const qs = params.toString()
  return api.get(`${tumiraAdminUrl}/geocoded-addresses${qs ? `?${qs}` : ""}`, { headers: tumiraAdminHeaders })
}

export function queryTumiraCourierCollectionPoints(params?: { p?: number; limit?: number; courier_id?: string }) {
  const qs = new URLSearchParams()
  if (params?.p !== undefined && params.p >= 2) qs.set("p", String(params.p))
  if (params?.limit !== undefined) qs.set("limit", String(params.limit))
  if (params?.courier_id) qs.set("courier_id", params.courier_id)
  const q = qs.toString()
  return api.get(`${tumiraAdminUrl}/courier-collection-points${q ? `?${q}` : ""}`, { headers: tumiraAdminHeaders })
}

// Livestock price series
export function queryImportPriceSeries(data: { entries: unknown[]; overwrite: boolean }) {
  return api.post(`${baseUrl}/prices/series/import`, data)
}

export function queryPriceSeries(params?: { client_id?: string; category?: string; template_type?: string; search?: string }) {
  const qs = new URLSearchParams()
  if (params?.client_id) qs.set("client_id", params.client_id)
  if (params?.category) qs.set("category", params.category)
  if (params?.template_type) qs.set("template_type", params.template_type)
  if (params?.search) qs.set("search", params.search)
  const q = qs.toString()
  return api.get(`${baseUrl}/prices/series/all${q ? `?${q}` : ""}`)
}

export function queryTableReservations(params?: { status?: string; restaurant_id?: string; location_id?: string; p?: number }) {
  const qs = new URLSearchParams()
  if (params?.status) qs.set("status", params.status)
  if (params?.restaurant_id) qs.set("restaurant_id", params.restaurant_id)
  if (params?.location_id) qs.set("location_id", params.location_id)
  if (params?.p && params.p > 1) qs.set("p", params.p.toString())
  const q = qs.toString()
  return api.get(`${baseUrl}/table-reservations/admin/list${q ? `?${q}` : ""}`)
}

export function queryTableReservation(id: string) {
  return api.get(`${baseUrl}/table-reservations/admin/${id}`)
}

export function updateTableReservationStatus(id: string, status: string, admin_notes?: string) {
  return api.put(`${baseUrl}/table-reservations/admin/${id}/status`, { status, admin_notes: admin_notes ?? "" })
}
