import NextAuth, { AuthError, User } from "next-auth";
import { authConfig } from "@/auth.config";
import Credentials from 'next-auth/providers/credentials'
import axios, { isAxiosError } from "axios"
import jwt_decode from "jwt-decode"
declare module "next-auth" {
    interface User {
        admin: boolean;
        banned: boolean;
        exp: number;
        iat: number;
        iss: string;
        subject: string;
        username: string;
        token: string
    }

    interface Session {
        user?: User
        access_token?: string
    }

}

import { BaseURL } from "@/lib/schemas"

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {

                const email = credentials.email as string
                const password = credentials.password as string

                const data = { email, password }

                var url = `${BaseURL}/client/login`

                try {
                    const response = await axios.post(url, data)

                    if (response.status === 200) {
                        const decodedSession = jwt_decode<User>(response.data.token)
                        decodedSession.token = response.data.token
                        decodedSession.name = decodedSession.username
                        return decodedSession
                    }

                    return null

                } catch (error) {
                    // @ts-expect-error
                    const formatted = new AuthError(error)

                    if (isAxiosError(formatted.cause?.err)) {
                        console.log(formatted.cause?.err.response?.statusText)
                    }

                    // @ts-expect-error
                    throw new Error(error)

                }
            }
        })],
    callbacks: {
        async jwt({ token, user }) {

            if (user) {
                token.user = user
            }

            return token
        },
        async session({ session, token }) {

            if (token.user) {

                const user = token.user as User
                session.user = user
                session.access_token = user.token
            }

            return session
        }
    }
})