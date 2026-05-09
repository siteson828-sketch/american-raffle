import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req as typeof req & { auth: { user?: { mustChangePassword?: boolean } } | null };

  const isChangePassword = nextUrl.pathname === "/change-password";
  const isAuth = nextUrl.pathname.startsWith("/api/auth") || nextUrl.pathname.startsWith("/api/change-password");

  if (isChangePassword || isAuth) return NextResponse.next();

  if (session?.user?.mustChangePassword) {
    return NextResponse.redirect(new URL("/change-password", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
