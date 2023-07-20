import axios, { InternalAxiosRequestConfig } from "axios"
import Cookies from "js-cookie"
import * as z from "zod"

import { adminAuthSchema } from "@/lib/schemas"

var base = process.env.NEXT_PUBLIC_BASE_URL
var version = "v1/"
var baseUrl = base + version

var api = axios.create({})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  var token = null

  // Get token in current cookies

  token = Cookies.get("cl_jtkn")

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`
  }

  return config
})

type FormData = z.infer<typeof adminAuthSchema>

type LoginResponse = {
  token: string
}

// Administrator
export function queryAdminLogin(data: FormData) {
  var url = baseUrl + "user/signin"
  return api.post<LoginResponse>(url, data)
}
