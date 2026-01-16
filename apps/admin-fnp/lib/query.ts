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
}

export function queryUsers(pagination?: pagination) {
  let url: string

  if (pagination?.p !== undefined && pagination.p >= 2) {
    url = `${baseUrl}/user/clients?p=${pagination.p}`
  } else {
    url = `${baseUrl}/user/clients`
  }

  if (pagination?.search !== undefined && pagination.search.length >= 2) {
    url = `${baseUrl}/user/clients?search=${pagination.search}`
  }

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
  let url: string

  if (pagination?.p !== undefined && pagination.p >= 2) {
    url = `${baseUrl}/prices/get/producer_prices?p=${pagination.p}`
  } else {
    url = `${baseUrl}/prices/get/producer_prices`
  }

  if (pagination?.search !== undefined && pagination.search.length >= 2) {
    url = `${baseUrl}/prices/get/producer_prices?search=${pagination.search}`
  }

  return api.get(url)
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
  let url: string

  if (pagination?.p !== undefined && pagination.p >= 2) {
    url = `${baseUrl}/user/agrochemicals?p=${pagination.p}`
  } else {
    url = `${baseUrl}/user/agrochemicals`
  }

  if (pagination?.search !== undefined && pagination.search.length >= 2) {
    url = `${baseUrl}/user/agrochemicals?search=${pagination.search}`
  }

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
  let url: string

  if (pagination?.p !== undefined && pagination.p >= 2) {
    url = `${baseUrl}/user/brands?p=${pagination.p}`
  } else {
    url = `${baseUrl}/user/brands`
  }

  if (pagination?.search !== undefined && pagination.search.length >= 2) {
    url = `${baseUrl}/user/brands?search=${pagination.search}`
  }

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
  let url: string

  if (pagination?.p !== undefined && pagination.p >= 2) {
    url = `${baseUrl}/user/agrochemical-categories?p=${pagination.p}`
  } else {
    url = `${baseUrl}/user/agrochemical-categories`
  }

  if (pagination?.search !== undefined && pagination.search.length >= 2) {
    url = `${baseUrl}/user/agrochemical-categories?search=${pagination.search}`
  }

  return api.get(url)
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
  let url: string

  if (pagination?.p !== undefined && pagination.p >= 2) {
    url = `${baseUrl}/user/agrochemical-active-ingredients?p=${pagination.p}`
  } else {
    url = `${baseUrl}/user/agrochemical-active-ingredients`
  }

  if (pagination?.search !== undefined && pagination.search.length >= 2) {
    url = `${baseUrl}/user/agrochemical-active-ingredients?search=${pagination.search}`
  }

  return api.get(url)
}

export function queryAgroChemicalActiveIngredient(id: string) {
  const url = `${baseUrl}/user/agrochemical-active-ingredients/${id}`
  return api.get(url)
}

export function queryAgroChemicalTargets(pagination?: pagination) {
  let url: string

  if (pagination?.p !== undefined && pagination.p >= 2) {
    url = `${baseUrl}/user/agrochemical-targets?p=${pagination.p}`
  } else {
    url = `${baseUrl}/user/agrochemical-targets`
  }

  if (pagination?.search !== undefined && pagination.search.length >= 2) {
    url = `${baseUrl}/user/agrochemical-targets?search=${pagination.search}`
  }

  return api.get(url)
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

export function queryFarmProduceCategories(pagination?: pagination) {
  let url: string

  if (pagination?.p !== undefined && pagination.p >= 2) {
    url = `${baseUrl}/farmproducecategories?p=${pagination.p}`
  } else {
    url = `${baseUrl}/farmproducecategories`
  }

  if (pagination?.search !== undefined && pagination.search.length >= 2) {
    url = `${baseUrl}/farmproducecategories?search=${pagination.search}`
  }

  return api.get(url)
}

export function queryFarmProduce(pagination?: pagination) {
  let url: string

  if (pagination?.p !== undefined && pagination.p >= 2) {
    url = `${baseUrl}/farmproduce?p=${pagination.p}`
  } else {
    url = `${baseUrl}/farmproduce`
  }

  if (pagination?.search !== undefined && pagination.search.length >= 2) {
    url = `${baseUrl}/farmproduce?search=${pagination.search}`
  }

  return api.get(url)
}
