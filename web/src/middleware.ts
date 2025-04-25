import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { AUTH_TOKEN } from "./static"

export function middleware(req: NextRequest) {
  // Get the auth token from cookies
  const token = req.cookies.get(AUTH_TOKEN)?.value

  // Define the protected route
  const protectedRoutes = [/^\/course\/[^/]+\/[^/]+$/]

  // Check if the request matches the protected route
  if (protectedRoutes.some((r) => r.test(req.nextUrl.pathname))) {
    // If no token, redirect to /login
    if (!token) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("next", req.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Allow the request to proceed
  return NextResponse.next()
}

// Apply middleware only to specific routes
export const config = {
  matcher: ["/course/:course/:topic"],
}
