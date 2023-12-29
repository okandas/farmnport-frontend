import axios, { InternalAxiosRequestConfig } from "axios"
import Cookies from "js-cookie"

import { PaginationModel } from "@/lib/schemas"

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

export function queryBuyers(pagintion?: PaginationModel) {
    var url: string

    if (pagintion?.p !== undefined && pagintion.p >= 2) {
        url = `${baseUrl}/buyer/all?p=${pagintion.p}`
    } else {
        url = `${baseUrl}/buyer/all`
    }

    // if (pagintion?.search !== undefined && pagintion.search.length >= 2) {
    //     url = `${baseUrl}/buyer/all?search=${pagintion.search}`
    // }

    return api.get(url)
}
