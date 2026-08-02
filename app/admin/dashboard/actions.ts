"use server";

import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function resetTeacherPassword(teacherId: string, newPassword: string) {
  const adminId = cookies().get("adminId")?.value;
  if (!adminId) throw new Error("Not authorized");

  const admin = await prisma.user.findUnique({ where: { id: adminId } });
  if (admin?.username !== "admin") throw new Error("Not authorized");

  await prisma.user.update({
    where: { id: teacherId },
    data: { password: newPassword },
  });

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/admin/dashboard");
}

export async function deleteTeacherAction(teacherId: string) {
  const adminId = cookies().get("adminId")?.value;
  if (!adminId) throw new Error("Not authorized");

  const admin = await prisma.user.findUnique({ where: { id: adminId } });
  if (admin?.username !== "admin") throw new Error("Not authorized");

  // Fetch all presentations to delete physical files
  const presentations = await prisma.presentation.findMany({
    where: { teacherId },
  });

  for (const pres of presentations) {
    if (pres.type === "pdf" && pres.filePath) {
      try {
        const fullPath = join(process.cwd(), "public", pres.filePath);
        if (existsSync(fullPath)) {
          await unlink(fullPath);
        }
      } catch (e) {
        console.error("Gagal menghapus file saat hapus guru:", e);
      }
    }
  }

  // Delete all presentations (participants will cascade automatically based on schema)
  await prisma.presentation.deleteMany({
    where: { teacherId },
  });

  // Delete teacher account
  await prisma.user.delete({
    where: { id: teacherId },
  });

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/admin/dashboard");
}

export async function saveSettingsAction(formData: FormData) {
  const adminId = cookies().get("adminId")?.value;
  if (!adminId) return { error: "Not authorized" };

  const admin = await prisma.user.findUnique({ where: { id: adminId } });
  if (admin?.username !== "admin") return { error: "Not authorized" };

  const appName = formData.get("appName") as string;
  const appDesc = formData.get("appDesc") as string;
  const presenceTimeout = formData.get("presenceTimeout") as string;

  if (appName) {
    await prisma.setting.upsert({
      where: { key: "appName" },
      update: { value: appName },
      create: { key: "appName", value: appName },
    });
  }
  
  if (appDesc) {
    await prisma.setting.upsert({
      where: { key: "appDesc" },
      update: { value: appDesc },
      create: { key: "appDesc", value: appDesc },
    });
  }

  if (presenceTimeout) {
    await prisma.setting.upsert({
      where: { key: "presenceTimeout" },
      update: { value: presenceTimeout },
      create: { key: "presenceTimeout", value: presenceTimeout },
    });
  }

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/");
  revalidatePath("/admin/dashboard");
  return { success: true };
}
