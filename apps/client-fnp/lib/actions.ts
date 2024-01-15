"use server"

import { signIn, signOut } from "@/auth"
import { AppURL, LoginFormData } from "@/lib/schemas"

export async function loginUser(payload: LoginFormData) {
    const reponse = await signIn('credentials', { email: payload.email, password: payload.password, redirect: false })
}

export async function logoutUser() {

    var url = `${AppURL}`
    await signOut({ redirectTo: url })

    
}