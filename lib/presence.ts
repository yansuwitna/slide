import prisma from "./db";

export async function markStudentActive(presentationId: string, deviceId: string, studentName: string) {
  const existing = await prisma.participant.findFirst({
    where: { presentationId, deviceId }
  });

  if (existing) {
    await prisma.participant.update({
      where: { id: existing.id },
      data: { name: studentName, lastSeen: new Date() }
    });
  } else {
    await prisma.participant.create({
      data: { presentationId, deviceId, name: studentName, lastSeen: new Date() }
    });
  }
}

export async function getActiveStudents(presentationId: string, maxAgeMs = 3000): Promise<{ name: string, isFocused: boolean }[]> {
  const participants = await prisma.participant.findMany({
    where: { presentationId }
  });

  const now = Date.now();
  const students: { name: string, isFocused: boolean }[] = [];

  for (const p of participants) {
    const isFocused = now - p.lastSeen.getTime() <= maxAgeMs;
    // Tampilkan jika pernah join (bisa diatur jika ingin menyembunyikan yg tidak aktif lama)
    // Untuk saat ini kita tampilkan semua, isFocused akan menentukan status online
    students.push({
      name: p.name,
      isFocused
    });
  }

  return students;
}

export async function markTeacherActive(presentationId: string) {
  // Hanya memperbarui timestamp di level presentasi jika diperlukan, 
  // namun umumnya isActive di presentation sudah cukup.
}

export async function markTeacherClosed(presentationId: string) {
  // Siswa akan otomatis dihapus jika menggunakan onDelete: Cascade (jika presentation dihapus),
  // atau biarkan saja data partisipan tersimpan sebagai riwayat.
}

export async function isTeacherActive(presentationId: string): Promise<boolean> {
  const pres = await prisma.presentation.findUnique({
    where: { id: presentationId },
    select: { isActive: true }
  });
  return pres?.isActive ?? false;
}
