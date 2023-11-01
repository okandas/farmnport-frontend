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


var base = process.env.NEXT_PUBLIC_BASE_URL
var version = "/v1"
var baseUrl = base + version

var api = axios.create({})

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
export function queryLogin(data: FormData) {
  var url = `${baseUrl}/user/signin`
  return api.post<LoginResponse>(url, data)
}

type pagintion = {
  p?: number
  search?: string
}

export function queryUsers(pagintion?: pagintion) {
  var url: string

  if (pagintion?.p !== undefined && pagintion.p >= 2) {
    url = `${baseUrl}/user/clients?p=${pagintion.p}`
  } else {
    url = `${baseUrl}/user/clients`
  }

  if (pagintion?.search !== undefined && pagintion.search.length >= 2) {
    url = `${baseUrl}/user/clients?search=${pagintion.search}`
  }

  return api.get(url)
}

export function queryUserProductPriceList(clientID?: string) {
  const url = `${baseUrl}/prices/get/${clientID}/producer_price`
  return api.get(url)
}

export function queryProducerPriceLists(pagintion?: pagintion) {
  var url: string

  if (pagintion?.p !== undefined && pagintion.p >= 2) {
    url = `${baseUrl}/prices/get/producer_prices?p=${pagintion.p}`
  } else {
    url = `${baseUrl}/prices/get/producer_prices`
  }

  // if (pagintion?.search !== undefined && pagintion.search.length >= 2) {
  //   url = `${baseUrl}/user/clients?search=${pagintion.search}`
  // }

  return api.get(url)
}

export function queryUser(name: string) {
  const url = `${baseUrl}/user/${name}`
  return api.get(url)
}

export function createClient(data: EditApplicationUser) {
  var url = `${baseUrl}/user/add_client`
  return api.post(url, data)
}

export function updateClient(data: EditApplicationUser) {
  var url = `${baseUrl}/user/update_client`
  return api.post(url, data)
}

export function verifyClient(data: ApplicationUserID) {
  var url = `${baseUrl}/user/verify_client`
  return api.post<ApplicationUser>(url, data)
}

export function createClientProductPriceList(data: ProducerPriceList) {
  var url = `${baseUrl}/prices/add/producer_price`
  return api.post(url, data)
}

export function updateClientProductPriceList(data: ProducerPriceList) {
  var url = `${baseUrl}/prices/up/producer_price`
  return api.post(url, data)
}

export function queryProducts(pagintion?: pagintion) {
  var url: string

  if (pagintion?.p !== undefined && pagintion.p >= 2) {
    url = `${baseUrl}/user/products?p=${pagintion.p}`
  } else {
    url = `${baseUrl}/user/products`
  }

  if (pagintion?.search !== undefined && pagintion.search.length >= 2) {
    url = `${baseUrl}/user/products?search=${pagintion.search}`
  }

  return api.get(url)
}

export function createProduct(data: FormProductModel) {
  var url = `${baseUrl}/user/products/add`
  return api.post(url, data)
}

export function queryProduct(id: string) {
  const url = `${baseUrl}/user/products/${id}`
  return api.get(url)
}

export function updateProduct(data: FormProductModel) {
  var url = `${baseUrl}/user/products/update`
  return api.post(url, data)
}

export function uploadImages(data: FormData) {
  var url = `${baseUrl}/user/image/uploads`
  return api.post(url, data)
}

export function removeImage(data: ImageModel) {
  var url = `${baseUrl}/user/image/remove`
  return api.post(url, data)
}