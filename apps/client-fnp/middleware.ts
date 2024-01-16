import { NextResponse } from "next/server"
import { NextAuthRequest } from "next-auth/lib"
import { auth as middleware } from "@/auth"
import { AppURL } from "@/lib/schemas"

export default middleware((request: NextAuthRequest) => {
  const pathname = request.nextUrl.pathname

  if ((pathname === '/login' || pathname === '/signup') && request.auth?.user !== undefined) {

    var url = `${AppURL}/buyer`

    return NextResponse.redirect(url)

  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}