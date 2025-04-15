import NextAuth, { Session, User } from "next-auth";
import Credentials from 'next-auth/providers/credentials'
import jwt_decode from "jwt-decode"
import { Debug, Secret } from "@/lib/schemas"
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
    secret: Secret,
    trustHost: true,
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/login"
    },
    providers: [
        Credentials({
            async authorize(credentials: any) {

                const email = credentials.email as string
                const password = credentials.password as string

                const data = { email, password }

                const url = `${BaseURL}/client/login`

                let status = ''
                let code = 0
                let headers = {}
                let reqUrl = ''


                try {

                    const rawResponse = await fetch(url, {
                        method: 'POST',
                        headers: {
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });

                    code = rawResponse.status
                    status = rawResponse.statusText
                    headers = rawResponse.headers
                    reqUrl = rawResponse.url


                    const response = await rawResponse.json();


                    if (response.code !== 200) {
                        const errObj = {
                            message: 'Error in Authorize credentials provider (response)',
                            error: response,
                            code: code,
                            status: status,
                            headers: headers,
                            requests: {
                              reqUrl: reqUrl,
                              url: url
                            }
                        }
                        captureException(errObj)
                            return null
                    }

                    const decodedSession = jwt_decode<User>(response.token)
                    decodedSession.token = response.token
                    decodedSession.name = decodedSession.username
                    return decodedSession



                } catch (error) {
                    const errObj = {
                        message: 'Error in Authorize credentials provider (catch)',
                        error: error,
                        code: code,
                        status: status,
                        headers: headers,
                        requests: {
                          reqUrl: reqUrl,
                          url: url
                        }
                    }
                    captureException(errObj)
                    return null
                }
            }
        })
    ],
    callbacks: {
        async signIn() {
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

export const handleTokenRefresh = async (token: string, session: Session | null) => {

    const decodedUser = jwt_decode<User>(token)
    decodedUser.token = token
    decodedUser.name = decodedUser.username

    console.log(decodedUser, "decodedUser")
    console.log(session, "currentSession")

    const user = decodedUser
    const id = user.id as string
    const name = user.name as string
    const email = user.email != null || user.email != undefined ? user.email : ''
    const emailVerified = user.emailVerified != null || user.emailVerified != undefined ? user.emailVerified : null

    if (session != null) {

        session.user = { ...user, id, name, email, emailVerified }
        session.access_token = user.token

    }
}
