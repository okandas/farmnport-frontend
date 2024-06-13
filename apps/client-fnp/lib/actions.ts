"use server"

import { auth, signIn, signOut } from "@/auth"
import { AuthenticatedUser, LoginFormData, ResetFormData } from "@/lib/schemas"


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

export async function retrieveUser() {
    const session = await auth()
    let user: AuthenticatedUser
    const sessionUser = session?.user

    if (sessionUser !== undefined) {

        user = {
            ...sessionUser
        }
        
    } else {
        user = undefined
    }
    return user
}