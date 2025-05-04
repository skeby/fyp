import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_TOKEN } from "./static";

export function middleware(req: NextRequest) {
  // Get the auth token from cookies
  const token = req.cookies.get(AUTH_TOKEN)?.value;
  console.log("auth token key", AUTH_TOKEN);

  // Define the protected route
  const protectedRoutes: (RegExp | string)[] = [/^\/course\/[^/]+\/[^/]+$/];
  const authRoutes: (RegExp | string)[] = ["/login", "/signup"];

  console.log("token", token);
  console.log("req.nextUrl.pathname", req.nextUrl.pathname);
  // Check if the request matches the protected route
  if (
    protectedRoutes.some((r) =>
      typeof r === "string"
        ? r === req.nextUrl.pathname
        : r.test(req.nextUrl.pathname),
    )
  ) {
    // If no token, redirect to /login
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (
    authRoutes.some((r) =>
      typeof r === "string"
        ? r === req.nextUrl.pathname
        : r.test(req.nextUrl.pathname),
    )
  ) {
    if (token) {
      const courseUrl = new URL("/course", req.url);
      return NextResponse.redirect(courseUrl);
    }
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Apply middleware only to specific routes
// export const config = {
//   matcher: ["/course/:course/:topic"],
// };
