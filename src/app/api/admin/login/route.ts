import { NextRequest, NextResponse } from "next/server";
import { getAppSettings } from "@/lib/settings";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const settings = await getAppSettings();
    const expectedUser = settings.adminUsername;
    const expectedPass = settings.adminPassword;

    if (username === expectedUser && password === expectedPass) {
      const response = NextResponse.json({ success: true });
      response.cookies.set("admin_token", "authenticated_admin", {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: "lax",
      });
      return response;
    }

    return NextResponse.json(
      { success: false, error: "Invalid User ID or Password. Please check your credentials." },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token");
  if (token && token.value === "authenticated_admin") {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set("admin_token", "", {
    path: "/",
    maxAge: 0,
  });
  return response;
}
