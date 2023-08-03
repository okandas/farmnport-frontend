import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt_decode from "jwt-decode"

import { AuthenticatedUser } from "./lib/schemas"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const cookie = request.cookies.get("cl_jtkn")
  const isToken = !!cookie

  const isAuthPage = request.nextUrl.pathname === "/"

  if (isAuthPage && !isToken) {
    return NextResponse.next()
  }

  if (!isAuthPage && !isToken) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (isAuthPage) {
    if (isToken) {
      const token = cookie?.value

      const decodedSession = jwt_decode<AuthenticatedUser>(token)

      console.log(decodedSession)

      if (decodedSession.admin) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      } else {
        return NextResponse.redirect(new URL("/", request.url))
      }
    }
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/"],
}
