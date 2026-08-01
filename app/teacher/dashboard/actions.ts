"use server";

import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function createPresentationAction(formData: FormData) {
  const teacherId = cookies().get("teacherId")?.value;
  if (!teacherId) throw new Error("Not logged in");

  const title = formData.get("title") as string;
  const type = "pdf";
  const file = formData.get("file") as File;
  
  if (!file || file.size === 0) {
    return { error: "File PDF harus diupload" };
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
      type,
      filePath,
      token,
      teacherId,
    },
  });

  redirect(`/teacher/present/${token}`);
}

export async function deletePresentationAction(id: string) {
  const teacherId = cookies().get("teacherId")?.value;
  if (!teacherId) throw new Error("Not logged in");

  const presentation = await prisma.presentation.findUnique({
    where: { id, teacherId },
  });

  if (!presentation) throw new Error("Presentation not found");

  await prisma.presentation.delete({
    where: { id, teacherId },
  });
  
  if (presentation.type === "pdf" && presentation.filePath) {
    try {
      const fullPath = join(process.cwd(), "public", presentation.filePath);
      if (existsSync(fullPath)) {
        await unlink(fullPath);
      }
    } catch (e) {
      console.error("Gagal menghapus file:", e);
    }
  }

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/teacher/dashboard");
}
