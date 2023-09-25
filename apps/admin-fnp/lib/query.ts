import axios, { InternalAxiosRequestConfig } from "axios"
import Cookies from "js-cookie"
import * as z from "zod"

import {
  AdminApplicationUserID,
  AdminAuthSchema,
  AdminEditApplicationUser,
  ApplicationUser,
  LoginResponse,
  ProducerPriceList,
  ProducerPriceListsResponse,
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

type FormData = z.infer<typeof AdminAuthSchema>

// Administrator
export function queryAdminLogin(data: FormData) {
  var url = `${baseUrl}/user/signin`
  return api.post<LoginResponse>(url, data)
}

type pagintion = {
  p?: number
  search?: string
}

export function queryUsersAsAdmin(pagintion?: pagintion) {
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

export function queryUserProductPriceListAsAdmin(clientID?: string) {
  const url = `${baseUrl}/prices/get/${clientID}/producer_price`
  return api.get(url)
}

export function queryProducerPriceListsAsAdmin(pagintion?: pagintion) {
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

export function queryUserAsAdmin(name: string) {
  const url = `${baseUrl}/user/${name}`
  return api.get(url)
}

export function createClientAsAdmin(data: AdminEditApplicationUser) {
  var url = `${baseUrl}/user/add_client`
  return api.post(url, data)
}

export function updateClientAsAdmin(data: AdminEditApplicationUser) {
  var url = `${baseUrl}/user/update_client`
  return api.post(url, data)
}

export function verifyClientAsAdmin(data: AdminApplicationUserID) {
  var url = `${baseUrl}/user/verify_client`
  return api.post<ApplicationUser>(url, data)
}

export function createClientProductPriceListAsAdmin(data: ProducerPriceList) {
  var url = `${baseUrl}/prices/add/producer_price`
  return api.post(url, data)
}

export function updateClientProductPriceListAsAdmin(data: ProducerPriceList) {
  var url = `${baseUrl}/prices/up/producer_price`
  return api.post(url, data)
}
