import axios, { InternalAxiosRequestConfig } from "axios"

import { PaginationModel, ResetFormData, LoginFormData, SignUpFormData, BaseURL, FeatureFlags } from "@/lib/schemas"
import { retrieveToken } from "@/lib/actions"

let api = axios.create({})

api.interceptors.request.use(async(config: InternalAxiosRequestConfig) => {

    const token = await retrieveToken()

    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`
    }

    return config
})

export function queryClient(slug: string) {

  let url = `${BaseURL}/client/${slug}`

  return api.get(url)
}

export function queryClients(slug: string, pagination?: PaginationModel) {
    let url: string

    if (pagination?.p !== undefined && pagination.p >= 2) {
        url = `${BaseURL}/${slug}/all?p=${pagination.p}`
    } else {
        url = `${BaseURL}/${slug}/all`
    }

    // if (pagination?.search !== undefined && pagination.search.length >= 2) {
    //     url = `${baseUrl}/buyer/all?search=${pagination.search}`
    // }

    return api.get(url)
}


export function queryClientsByProduct(slug: string, product: string, pagination?: PaginationModel) {
  let url: string

  if (pagination?.p !== undefined && pagination.p >= 2) {
    url = `${BaseURL}/${slug}/${product}?p=${pagination.p}`
  } else {
    url = `${BaseURL}/${slug}/${product}`
  }

  // if (pagination?.search !== undefined && pagination.search.length >= 2) {
  //     url = `${baseUrl}/buyer/all?search=${pagination.search}`
  // }

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
