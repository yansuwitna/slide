import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { markStudentActive, getActiveStudents, markTeacherActive, isTeacherActive } from "@/lib/presence";
import { checkRedisStatus } from "@/lib/redis";

export const dynamic = 'force-dynamic';

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
    try {
      await markStudentActive(presentation.id, deviceId, studentName);
    } catch (error) {
      console.error("Error marking student active:", error);
    }
  }

  // Fetch active students dari database jika yang request adalah Guru
  let activeStudents: { name: string, isFocused: boolean }[] = [];
  const currentTeacherId = cookies().get("teacherId")?.value;
  const role = request.nextUrl.searchParams.get("role");
  
  if (role === "teacher" && currentTeacherId === presentation.teacherId) {
    try {
      await markTeacherActive(presentation.id);
      
      const timeoutSetting = await prisma.setting.findUnique({ where: { key: "presenceTimeout" } });
      const timeoutValue = timeoutSetting?.value ? parseInt(timeoutSetting.value) : 2000;
      
      activeStudents = await getActiveStudents(presentation.id, timeoutValue);
    } catch (e) {
      console.error("Error fetching from Redis:", e);
    }
  } else {
    // Siswa sedang meminta data -> Cek apakah guru sudah menekan Keluar (Tutup)
    // SEMENTARA SAYA MATIKAN PENGECEKAN INI UNTUK MEMBUKTIKAN APAKAH SERVER MENJALANKAN KODE BARU ATAU LAMA
    /*
    if (presentation.isActive === false) {
      console.log(`Student kicked out from ${params.token} because presentation.isActive is false in DB!`);
      return NextResponse.json({ error: "Teacher offline", closed: true });
    }
    */
  }

  const redisOk = await checkRedisStatus();

  // Modifikasi path agar selalu menggunakan API route khusus (mencegah cache 'Content unavailable' pada VPS)
  const modifiedPresentation = { ...presentation, activeStudents, redisOk };
  if (modifiedPresentation.filePath?.startsWith('/uploads/')) {
    modifiedPresentation.filePath = modifiedPresentation.filePath.replace('/uploads/', '/api/uploads/');
  }

  return NextResponse.json(modifiedPresentation);
}
