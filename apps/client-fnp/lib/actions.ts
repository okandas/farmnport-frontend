"use server"

import { auth, signIn, signOut } from "@/auth"
import { LoginFormData } from "@/lib/schemas"

export async function loginUser(payload: LoginFormData) {
    const response = await signIn('credentials', { email: payload.email, password: payload.password, redirect: false })
    return response
}

export async function logoutUser() {
    await signOut({ redirect: false })
}

export async function retrieveToken() {
    const session = await auth()
    const token = session?.access_token
    return token
}