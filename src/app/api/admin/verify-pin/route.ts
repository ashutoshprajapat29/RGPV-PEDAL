import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json();
    const correctPin = process.env.ADMIN_PIN || "1234";

    if (pin === correctPin) {
      const response = NextResponse.json({ success: true });
      response.cookies.set("admin_token", "authenticated_admin", {
        httpOnly: false,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return response;
    }

    return NextResponse.json(
      { success: false, error: "Incorrect Admin PIN code. Please try again." },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token");
  if (token && token.value === "authenticated_admin") {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false });
}
