import axios, { InternalAxiosRequestConfig } from "axios"
import Cookies from "js-cookie"
import * as z from "zod"

import {
  AdminAuthSchema,
  ClientDataResponse,
  LoginResponse,
} from "@/lib/schemas"

var base = process.env.NEXT_PUBLIC_BASE_URL
var version = "v1/"
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
  var url = baseUrl + "user/signin"
  return api.post<LoginResponse>(url, data)
}

type pagintion = {
  p?: number
}

export function queryUsersAsAdmin(pagintion?: pagintion) {
  var url: string

  if (pagintion?.p !== undefined && pagintion.p >= 2) {
    url = baseUrl + "user/clients" + `?p=${pagintion.p}`
  } else {
    url = baseUrl + "user/clients"
  }

  return api.get<ClientDataResponse>(url)
}
