import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

type JWTPayload = {
  userId: string;
  role: "ADMIN" | "CASHIER";
  iat: number;
  exp: number;
};

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // Jika belum login, redirect ke login
  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Jika sudah login, cek role
  if (token) {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const role = decoded.role;

      // Cashier tidak boleh akses admin
      if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
        return NextResponse.redirect(
          new URL("/dashboard/cashier", req.url)
        );
      }

      // Admin tidak perlu masuk ke cashier (optional, tapi lebih clean)
      if (pathname.startsWith("/dashboard/cashier") && role === "ADMIN") {
        return NextResponse.redirect(
          new URL("/dashboard/admin", req.url)
        );
      }
    } catch (err) {
      // Kalau token rusak → paksa logout
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete("token");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};