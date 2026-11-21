import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { supabase } from "@/lib/supabase";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    // Local uploads directory fallback
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "bikes");
    if (!supabase) {
      await mkdir(uploadsDir, { recursive: true });
    }

    for (const file of files) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `File type ${file.type} is not supported. Please upload JPG, PNG, or WebP.` },
          { status: 400 }
        );
      }

      // Max file size: 10MB
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image file exceeds 10MB limit." },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const rawBuffer = Buffer.from(bytes);

      // Automatically compress and resize to max 1280px width, progressive JPEG ~80KB
      let uploadBuffer = rawBuffer;
      let contentType = file.type;
      let ext = path.extname(file.name) || ".jpg";

      try {
        uploadBuffer = await sharp(rawBuffer)
          .resize({ width: 1280, withoutEnlargement: true })
          .jpeg({ quality: 82, progressive: true, mozjpeg: true })
          .toBuffer();
        contentType = "image/jpeg";
        ext = ".jpg";
      } catch (sharpError) {
        console.warn("Sharp optimization skipped, using original buffer:", sharpError);
      }

      // Safe filename with extension
      const uniqueName = `bike-${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;

      if (supabase) {
        // Direct upload to Supabase Storage bucket 'bikes'
        const { error: uploadError } = await supabase.storage
          .from("bikes")
          .upload(uniqueName, uploadBuffer, {
            contentType,
            upsert: true,
          });

        if (uploadError) {
          console.error("Supabase Storage error:", uploadError);
          throw new Error("Supabase upload failed: " + uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from("bikes")
          .getPublicUrl(uniqueName);

        uploadedUrls.push(publicUrlData.publicUrl);
      } else {
        // Local filesystem storage
        const filePath = path.join(uploadsDir, uniqueName);
        await writeFile(filePath, uploadBuffer);
        uploadedUrls.push(`/uploads/bikes/${uniqueName}`);
      }
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      count: uploadedUrls.length,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload files. Please try again." },
      { status: 500 }
    );
  }
}
