import NextAuth, { User } from "next-auth";
import Credentials from 'next-auth/providers/credentials'
import axios, { isAxiosError } from "axios"
import jwt_decode from "jwt-decode"
import { Debug } from "@/lib/schemas"
import { captureException } from "@sentry/nextjs";

declare module "next-auth" {
    interface User {
        bad_participant: boolean
        admin: boolean
        banned: boolean
        exp: number
        iat: number
        iss: string
        subject: string
        username: string
        token: string
        email?: string | null
        emailVerified?: Date | null
    }

    interface Session {
        user?: User | null
        access_token?: string
    }

}

import { BaseURL } from "@/lib/schemas"


export const { auth, signIn, signOut, handlers } = NextAuth({
    debug: Debug,
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/login"
    },
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
                    captureException(error)
                    return null
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user }) {
            return true
        },
        async redirect({ url, baseUrl }) {

            const newURL = new URL(url)
            const entity = newURL.searchParams.get('entity')
            const wantToSee = newURL.searchParams.get('wantToSee')

            if (wantToSee !== null && entity !== null) {
                return `${newURL.origin}/${entity}/${wantToSee}`
            }

            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`
            // Allows callback URLs on the same origin
            else if (new URL(url).origin === baseUrl) return url
            return baseUrl
        },
        async jwt({ token, user }) {

            if (user) {
                token.user = user
            }

            return token
        },
        async session({ session, token }) {

            if (token.user) {

                const user = token.user as User
                const id = user.id as string
                const name = user.name as string
                const email = user.email != null || user.email != undefined ? user.email : ''
                const emailVerified = user.emailVerified != null || user.emailVerified != undefined ? user.emailVerified : null
                session.user = { ...user, id, name, email, emailVerified }
                session.access_token = user.token
            }

            return session
        }
    }
})