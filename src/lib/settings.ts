import { prisma } from "@/lib/prisma";

export async function getAppSettings() {
  let settings = await prisma.appSetting.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    settings = await prisma.appSetting.create({
      data: {
        id: "default",
        adminUsername: process.env.ADMIN_USERNAME || "admin",
        adminPassword: process.env.ADMIN_PASSWORD || "rgpvadmin@2026",
        whatsappPhone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "919876543210",
        campusName: process.env.NEXT_PUBLIC_CAMPUS_NAME || "RGPV Bhopal",
      },
    });
  }

  return settings;
}
