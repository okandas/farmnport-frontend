"use server"

import { signIn, signOut } from "@/auth"
import { AppURL, LoginFormData } from "@/lib/schemas"

export async function loginUser(payload: LoginFormData) {
    const rseponse = await signIn('credentials', { email: payload.email, password: payload.password, redirect: false })
    return rseponse
}

export async function logoutUser() {
    await signOut({ redirect: false })
}