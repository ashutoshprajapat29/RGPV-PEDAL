import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
        adminUsername: settings.adminUsername,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { whatsappPhone, campusName, newUsername, currentPassword, newPassword } = body;

    const currentSettings = await getAppSettings();
    const dataToUpdate: any = {};

    // 1. Update WhatsApp Phone (can be updated independently without password)
    if (whatsappPhone !== undefined && whatsappPhone !== null) {
      const cleanPhone = String(whatsappPhone).replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        return NextResponse.json(
          { error: "Please enter a valid WhatsApp mobile number with at least 10 digits." },
          { status: 400 }
        );
      }
      dataToUpdate.whatsappPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    }

    // 2. Update Campus Name
    if (campusName !== undefined && campusName.trim()) {
      dataToUpdate.campusName = campusName.trim();
    }

    // 3. Update Admin Username
    if (newUsername !== undefined && newUsername.trim()) {
      if (newUsername.trim().length < 3) {
        return NextResponse.json(
          { error: "User ID must be at least 3 characters long." },
          { status: 400 }
        );
      }
      dataToUpdate.adminUsername = newUsername.trim();
    }

    // 4. Update Password (ONLY if newPassword is provided and non-empty)
    if (newPassword && newPassword.trim().length > 0) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Please enter your Current Password to authorize setting a new password." },
          { status: 400 }
        );
      }

      if (currentPassword !== currentSettings.adminPassword) {
        return NextResponse.json(
          { error: "Current password does not match. Please verify your current password." },
          { status: 400 }
        );
      }

      if (newPassword.trim().length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      dataToUpdate.adminPassword = newPassword.trim();
    }

    const updated = await prisma.appSetting.update({
      where: { id: "default" },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully!",
      settings: {
        whatsappPhone: updated.whatsappPhone,
        campusName: updated.campusName,
        adminUsername: updated.adminUsername,
      },
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
