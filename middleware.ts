import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Get the pathname
  const path = req.nextUrl.pathname

  // Allow public routes and API routes
  const isPublicPath = path === "/login" || path === "/error"
  const isApiPath = path.startsWith("/api/")
  const isStaticPath = path.startsWith("/_next/") || path.includes("/favicon.ico") || path.startsWith("/images/")

  // If it's a public path or API route, allow access
  if (isPublicPath || isApiPath || isStaticPath) {
    return NextResponse.next()
  }

  // If user is not authenticated, redirect to login
  if (!token) {
    const url = new URL("/login", req.url)
    url.searchParams.set("callbackUrl", path)
    return NextResponse.redirect(url)
  }

  // If user is authenticated and trying to access login, redirect to home
  if (token && path === "/login") {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/auth).*)"],
}

