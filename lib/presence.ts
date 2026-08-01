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

export function getActiveStudents(presentationId: string, maxAgeMs = 10000): string[] {
  const now = Date.now();
  const active: string[] = [];

  activeStudentsMap.forEach((lastSeen, key) => {
    // Jika data ini milik presentasi yang sedang dicek
    if (key.startsWith(`${presentationId}::`)) {
      if (now - lastSeen <= maxAgeMs) {
        // Siswa aktif dalam batas waktu, ambil namanya
        active.push(key.split('::')[1]);
      } else {
        // Jika sudah lebih dari batas waktu, hapus dari memori untuk menghemat RAM
        activeStudentsMap.delete(key);
      }
    }
  });

  return active;
}

export function markTeacherActive(presentationId: string) {
  // Angka 1 menandakan secara eksplisit DIBUKA
  activeTeachersMap.set(presentationId, 1);
}

export function markTeacherClosed(presentationId: string) {
  // Angka 0 menandakan secara eksplisit DITUTUP (Tombol Keluar Ditekan)
  activeTeachersMap.set(presentationId, 0);
}

export function isTeacherActive(presentationId: string): boolean {
  // Selama belum ada perintah DITUTUP (0), maka selalu dianggap AKTIF (termasuk jika server baru nyala)
  return activeTeachersMap.get(presentationId) !== 0;
}
