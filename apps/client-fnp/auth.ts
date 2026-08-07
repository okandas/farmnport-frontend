import NextAuth, { Session, User } from "next-auth";
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import jwt_decode from "jwt-decode"
import { Debug, Secret } from "@/lib/schemas"
import { captureException } from "@sentry/nextjs";
import { logtail } from "@/lib/logger";


declare module "next-auth" {
    interface User {
        bad_participant: boolean
        admin: boolean
        is_internal: boolean
        banned: boolean
        subscription_active: boolean
        exp: number
        iat: number
        iss: string
        subject: string
        username: string
        type: string
        token: string
        email?: string | null
        emailVerified?: Date | null
        impersonated_by?: string
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
            id: "credentials",
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
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            id: "impersonate",
            async authorize(credentials: any) {
                try {
                    const token = credentials.token as string
                    if (!token) return null

                    // Verify the token is valid by calling a protected backend endpoint
                    const verifyUrl = `${BaseURL}/client/aggregates/dashboard`
                    const verifyResponse = await fetch(verifyUrl, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                        },
                    })

                    if (!verifyResponse.ok) {
                        captureException({
                            message: 'Impersonate token failed backend verification',
                            status: verifyResponse.status,
                        })
                        return null
                    }

                    const decodedSession = jwt_decode<User & { impersonated_by?: string }>(token)

                    if (!decodedSession.impersonated_by) {
                        return null
                    }

                    decodedSession.token = token
                    decodedSession.name = decodedSession.username
                    return decodedSession
                } catch (error) {
                    captureException({
                        message: 'Error in impersonate credentials provider',
                        error: error,
                    })
                    return null
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // For OAuth providers (Google/Facebook), exchange profile for farmnport JWT
            if (account?.provider === "google") {
                try {
                    const email = profile?.email || user.email
                    const name = profile?.name || user.name
                    if (!email || !name) return false

                    const res = await fetch(`${BaseURL}/client/oauth`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            provider: account.provider,
                            email,
                            name,
                        }),
                    })

                    if (!res.ok) return false

                    const data = await res.json()
                    const decoded = jwt_decode<User>(data.token)
                    decoded.token = data.token
                    decoded.name = decoded.username

                    // Attach decoded farmnport user to the user object so jwt callback can pick it up
                    Object.assign(user, decoded)
                } catch (err) {
                    captureException({ message: "OAuth backend exchange failed", error: err })
                    return false
                }
            }
            return true
        },
        async redirect({ url, baseUrl }) {

            // Allow relative callback URLs first (before URL parsing)
            if (url.startsWith("/")) return `${baseUrl}${url}`

            try {
                const newURL = new URL(url)
                const entity = newURL.searchParams.get('entity')
                const wantToSee = newURL.searchParams.get('wantToSee')

                if (wantToSee !== null && entity !== null) {
                    return `${newURL.origin}/${entity}/${wantToSee}`
                }

                // Allows callback URLs on the same origin
                if (newURL.origin === baseUrl) return url
            } catch {
                // Fall through to default
            }

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
    },
    logger: {
      async error(error) {
        await logtail.error(error)
      },
      async warn(code) {
        await logtail.warn(code)
      },
      async debug(code, metadata) {
        await logtail.debug(code)
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
