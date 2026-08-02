import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { markStudentActive, getActiveStudents, markTeacherActive, isTeacherActive } from "@/lib/presence";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const presentation = await prisma.presentation.findUnique({
    where: { token: params.token },
    select: { id: true, teacherId: true, currentPage: true, type: true, filePath: true, title: true, isActive: true },
  });

  if (!presentation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Update kehadiran siswa ke RAM HANYA JIKA mereka sedang fokus di layar
  const studentName = cookies().get("studentName")?.value;
  const deviceId = cookies().get("deviceId")?.value;
  const isFocused = request.nextUrl.searchParams.get("focused") === "true";
  
  if (studentName && deviceId && isFocused) {
    await markStudentActive(presentation.id, deviceId, studentName);
  }

  // Fetch active students dari database jika yang request adalah Guru
  let activeStudents: { name: string, isFocused: boolean }[] = [];
  const currentTeacherId = cookies().get("teacherId")?.value;
  const role = request.nextUrl.searchParams.get("role");
  
  if (role === "teacher" && currentTeacherId === presentation.teacherId) {
    await markTeacherActive(presentation.id);
    
    // 15000ms = 15 detik toleransi untuk mengurangi beban database
    activeStudents = await getActiveStudents(presentation.id, 15000);
  } else {
    // Siswa sedang meminta data -> Cek apakah guru sudah menekan Keluar (Tutup)
    if (presentation.isActive === false) {
      return NextResponse.json({ error: "Teacher offline", closed: true });
    }
  }

  // Modifikasi path agar selalu menggunakan API route khusus (mencegah cache 'Content unavailable' pada VPS)
  const modifiedPresentation = { ...presentation, activeStudents };
  if (modifiedPresentation.filePath?.startsWith('/uploads/')) {
    modifiedPresentation.filePath = modifiedPresentation.filePath.replace('/uploads/', '/api/uploads/');
  }

  return NextResponse.json(modifiedPresentation);
}
