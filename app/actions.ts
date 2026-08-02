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

  // Validasi Password Kuat
  if (password.length < 8) {
    return { error: "Password minimal harus 8 karakter" };
  }
  if (!/[A-Z]/.test(password)) {
    return { error: "Password harus mengandung minimal satu huruf kapital (A-Z)" };
  }
  if (!/[a-z]/.test(password)) {
    return { error: "Password harus mengandung minimal satu huruf kecil (a-z)" };
  }
  if (!/[0-9]/.test(password)) {
    return { error: "Password harus mengandung minimal satu angka (0-9)" };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { error: "Password harus mengandung minimal satu karakter unik/spesial (contoh: !@#$)" };
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
  const teacherId = cookies().get("teacherId")?.value;
  if (teacherId) {
    await prisma.presentation.updateMany({
      where: { teacherId, isActive: true },
      data: { isActive: false }
    });
  }
  
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
      isActive: true,
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
  await prisma.presentation.update({
    where: { id: presentationId },
    data: { isActive: false },
  });
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

  let deviceId = cookies().get("deviceId")?.value;
  if (!deviceId) {
    deviceId = Math.random().toString(36).substring(2, 15);
    cookies().set("deviceId", deviceId);
  }

  const existingParticipant = await prisma.participant.findFirst({
    where: {
      presentationId: presentation.id,
      deviceId: deviceId
    }
  });

  if (existingParticipant) {
    await prisma.participant.update({
      where: { id: existingParticipant.id },
      data: { name: name, lastSeen: new Date() }
    });
  } else {
    await prisma.participant.create({
      data: { name, presentationId: presentation.id, deviceId: deviceId },
    });
  }

  cookies().set("studentName", name);
  redirect(`/student/view/${token}`);
}

export async function logoutStudentAction() {
  cookies().delete("studentName");
  redirect("/");
}
