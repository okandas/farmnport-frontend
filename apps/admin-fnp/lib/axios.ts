import axios, { InternalAxiosRequestConfig } from "axios"
import Cookies from "js-cookie"

const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3744"

export const authorizedHTTPClient = axios.create({
  baseURL: base,
})

authorizedHTTPClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get("cl_jtkn")

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`
  }

  return config
})
