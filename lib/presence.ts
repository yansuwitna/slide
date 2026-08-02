// File ini berfungsi sebagai memori sementara (RAM) untuk melacak kehadiran siswa
// tanpa membebani database utama. Sangat cocok untuk skala sekolah (ribuan siswa).

// Mendeklarasikan global variable agar tidak kereset saat Next.js re-compile (hot-reload) di tahap development.
const globalAny: any = global;

export const activeStudentsMap: Map<string, number> = globalAny.activeStudentsMap || new Map();
export const activeTeachersMap: Map<string, number> = globalAny.activeTeachersMap || new Map();

if (process.env.NODE_ENV !== "production") {
  globalAny.activeStudentsMap = activeStudentsMap;
  globalAny.activeTeachersMap = activeTeachersMap;
}

export function markStudentActive(presentationId: string, studentName: string) {
  // Simpan waktu terakhir siswa terlihat (timestamp) dengan kunci gabungan presentasi + nama
  activeStudentsMap.set(`${presentationId}::${studentName}`, Date.now());
}

export function getActiveStudents(presentationId: string, maxAgeMs = 3000): { name: string, isFocused: boolean }[] {
  const now = Date.now();
  const students: { name: string, isFocused: boolean }[] = [];

  activeStudentsMap.forEach((lastSeen, key) => {
    // Jika data ini milik presentasi yang sedang dicek
    if (key.startsWith(`${presentationId}::`)) {
      const isFocused = now - lastSeen <= maxAgeMs;
      // Jangan hapus dari memori, tetap kembalikan tapi dengan isFocused = false
      students.push({
        name: key.split('::')[1],
        isFocused,
      });
    }
  });

  return students;
}

export function clearPresentationStudents(presentationId: string) {
  activeStudentsMap.forEach((_, key) => {
    if (key.startsWith(`${presentationId}::`)) {
      activeStudentsMap.delete(key);
    }
  });
}

export function markTeacherActive(presentationId: string) {
  // Angka 1 menandakan secara eksplisit DIBUKA
  activeTeachersMap.set(presentationId, 1);
}

export function markTeacherClosed(presentationId: string) {
  // Angka 0 menandakan secara eksplisit DITUTUP (Tombol Keluar Ditekan)
  activeTeachersMap.set(presentationId, 0);
  
  // Hapus semua siswa dari memori ketika presentasi ditutup
  clearPresentationStudents(presentationId);
}

export function isTeacherActive(presentationId: string): boolean {
  // Selama belum ada perintah DITUTUP (0), maka selalu dianggap AKTIF (termasuk jika server baru nyala)
  return activeTeachersMap.get(presentationId) !== 0;
}
