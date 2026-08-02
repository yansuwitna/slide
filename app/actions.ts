"use server";

import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { markTeacherClosed } from "@/lib/presence";

// ======== AUTH ACTIONS ========

export async function registerTeacher(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string || "";

  if (!username || !password || !name) {
    return { error: "Semua field harus diisi" };
  }

  try {
    const user = await prisma.user.create({
      data: { username, password, name }, // Hashing is skipped for simplicity in this demo, but should be added
    });
    return { success: true };
  } catch (e) {
    return { error: "Username sudah digunakan" };
  }
}

export async function loginTeacher(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || user.password !== password) {
    return { error: "Username atau password salah" };
  }

  if (username === "admin") {
    cookies().set("adminId", user.id);
    redirect("/admin/dashboard");
  }

  cookies().set("teacherId", user.id);
  redirect("/teacher/dashboard");
}

export async function logoutTeacher() {
  cookies().delete("teacherId");
  cookies().delete("adminId");
  redirect("/");
}

// ======== PRESENTATION ACTIONS ========

export async function createPresentation(title: string, type: string, filePath: string) {
  const teacherId = cookies().get("teacherId")?.value;
  if (!teacherId) throw new Error("Not logged in");

  const token = Math.random().toString(36).substring(2, 8).toUpperCase();

  const presentation = await prisma.presentation.create({
    data: {
      title,
      type,
      filePath,
      token,
      teacherId,
    },
  });

  return presentation.token;
}

export async function updatePage(token: string, page: number) {
  await prisma.presentation.update({
    where: { token },
    data: { currentPage: page },
  });
}

export async function closePresentationAction(presentationId: string) {
  markTeacherClosed(presentationId);
  redirect("/teacher/dashboard");
}

// ======== STUDENT ACTIONS ========

export async function joinPresentation(formData: FormData) {
  const name = formData.get("name") as string;
  const token = formData.get("token") as string;

  const presentation = await prisma.presentation.findUnique({
    where: { token },
  });

  if (!presentation) {
    return { error: "Token presentasi tidak valid" };
  }

  await prisma.participant.create({
    data: { name, presentationId: presentation.id },
  });

  cookies().set("studentName", name);
  redirect(`/student/view/${token}`);
}

export async function logoutStudentAction() {
  cookies().delete("studentName");
  redirect("/");
}
