import { NextResponse } from "next/server";
import { getAppSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getAppSettings();
    return NextResponse.json(
      {
        whatsappPhone: settings.whatsappPhone,
        campusName: settings.campusName,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { whatsappPhone: "919876543210", campusName: "RGPV Bhopal" },
      { status: 200 }
    );
  }
}
