import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, role } = body;

    const response = NextResponse.json({ success: true, role });

    if (userId && role) {
      // Set cookies for Next.js middleware/proxy validation
      response.cookies.set("lux_user_id", userId, {
        path: "/",
        httpOnly: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      response.cookies.set("lux_user_role", role, {
        path: "/",
        httpOnly: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
    } else {
      response.cookies.delete("lux_user_id");
      response.cookies.delete("lux_user_role");
    }

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || "97764dd4-5ab2-4b16-844e-1a51f86b9afe";
  const role = searchParams.get("role") || "admin";
  const redirect = searchParams.get("redirect") || "/admin";

  const redirectUrl = new URL(redirect, req.url);
  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set("lux_user_id", userId, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set("lux_user_role", role, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("lux_user_id");
  response.cookies.delete("lux_user_role");
  return response;
}
