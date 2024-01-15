import axios, { InternalAxiosRequestConfig } from "axios"
import Cookies from "js-cookie"
import * as z from "zod"



import { PaginationModel, AuthSchema, LoginFormData, BaseURL } from "@/lib/schemas"
import { resolve } from "path"

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
        url = `${BaseURL}/buyer/all?p=${pagintion.p}`
    } else {
        url = `${BaseURL}/buyer/all`
    }

    // if (pagintion?.search !== undefined && pagintion.search.length >= 2) {
    //     url = `${baseUrl}/buyer/all?search=${pagintion.search}`
    // }

    return api.get(url)
}

export function clientLogin(data: LoginFormData) {
    var url = `${BaseURL}/client/login`
    return api.post(url, data)
}


