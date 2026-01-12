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
  FormProductModel,
  ImageModel,
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

export function addAgroChemical(data: FormProductModel) {
  let url = `${baseUrl}/user/agrochemicals/add`
  return api.post(url, data)
}

export function queryAgroChemical(id: string) {
  const url = `${baseUrl}/user/agrochemicals/${id}`
  return api.get(url)
}

export function updateAgroChemical(data: FormProductModel) {
  let url = `${baseUrl}/user/agrochemicals/update`
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
