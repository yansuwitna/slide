import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const teacherId = cookies().get("teacherId")?.value;
    if (!teacherId) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const file = formData.get("file") as File;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "File PDF harus diupload" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
    await writeFile(join(uploadDir, filename), buffer);
    const filePath = `/uploads/${filename}`;

    const token = Math.random().toString(36).substring(2, 8).toUpperCase();

    await prisma.presentation.create({
      data: {
        title,
        type: "pdf",
        filePath,
        token,
        teacherId,
      },
    });

    return NextResponse.json({ token, success: true });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Upload gagal" }, { status: 500 });
  }
}
