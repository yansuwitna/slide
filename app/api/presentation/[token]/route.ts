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
  const isFocused = request.nextUrl.searchParams.get("focused") === "true";
  
  if (studentName && isFocused) {
    markStudentActive(presentation.id, studentName);
  }

  // Fetch active students dari RAM jika yang request adalah Guru
  let activeStudents: string[] = [];
  const currentTeacherId = cookies().get("teacherId")?.value;
  const role = request.nextUrl.searchParams.get("role");
  
  if (role === "teacher" && currentTeacherId === presentation.teacherId) {
    // Guru sedang meminta data -> Tandai guru aktif
    markTeacherActive(presentation.id);
    
    // 2000ms = 2 detik toleransi (super ketat)
    activeStudents = getActiveStudents(presentation.id, 2000);
  } else {
    // Siswa sedang meminta data -> Cek apakah guru sudah menekan Keluar (Tutup)
    // Cek dulu dari Database (paling kuat karena sync lintas proses VPS PM2)
    if (presentation.isActive === false) {
      return NextResponse.json({ error: "Teacher offline", closed: true });
    }
    
    // Jika di database masih aktif, cek fallback dari RAM (opsional, tapi baik untuk menjaga redundansi)
    const teacherOnline = isTeacherActive(presentation.id);
    if (!teacherOnline) {
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
