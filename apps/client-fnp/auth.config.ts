import { NextAuthConfig } from "next-auth";

export const authConfig = {
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/login"
    },
    callbacks: {
        async signIn({ user }) {
            return true
        },
        async redirect({ url, baseUrl }) {

            const newURL = new URL(url)
            const entity = newURL.searchParams.get('entity')
            const wantToSee = newURL.searchParams.get('wantToSee')

            if (wantToSee !== null && entity !== null ) {
                return `${newURL.origin}/${entity}/${wantToSee}`
            }

            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`
            // Allows callback URLs on the same origin
            else if (new URL(url).origin === baseUrl) return url
            return baseUrl
        },
    },
    providers: [],
    debug: false
} satisfies NextAuthConfig