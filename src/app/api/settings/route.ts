import { NextResponse } from "next/server";
import { getAppSettings } from "@/lib/settings";

export async function GET() {
  try {
    const settings = await getAppSettings();
    return NextResponse.json({
      whatsappPhone: settings.whatsappPhone,
      campusName: settings.campusName,
    });
  } catch (error) {
    return NextResponse.json(
      { whatsappPhone: "919876543210", campusName: "RGPV Bhopal" },
      { status: 200 }
    );
  }
}
