import Link from "next/link";
import prisma from "@/lib/db";

export default async function Home() {
  const appNameSetting = await prisma.setting.findUnique({ where: { key: "appName" } });
  const appDescSetting = await prisma.setting.findUnique({ where: { key: "appDesc" } });

  const appName = appNameSetting?.value || "EduPresent";
  const appDesc = appDescSetting?.value || "Platform Presentasi Interaktif untuk Guru dan Siswa";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="glass p-10 md:p-16 max-w-4xl w-full mx-auto text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 drop-shadow-md">
          {appName}
        </h1>
        <p className="text-xl text-gray-800 mb-12 font-medium">
          {appDesc}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Siswa Card */}
          <div className="bg-white bg-opacity-70 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 flex flex-col">
            <div className="text-5xl mb-4">👨‍🎓</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Saya Siswa
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Bergabung ke kelas presentasi tanpa perlu mendaftar. Cukup masukkan
              nama dan token dari guru.
            </p>
            <div className="flex flex-col space-y-3 mt-auto">
              <Link
                href="/student/join"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200 h-full flex items-center justify-center"
              >
                Gabung Kelas
              </Link>
            </div>
          </div>

          {/* Guru Card */}
          <div className="bg-white bg-opacity-70 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:-translate-y-1">
            <div className="text-5xl mb-4">👨‍🏫</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Saya Guru</h2>
            <p className="text-gray-600 mb-6 text-sm">
              Masuk atau daftar untuk mengunggah materi presentasi dan
              membagikan token kepada siswa.
            </p>
            <div className="flex flex-col space-y-3">
              <Link
                href="/teacher/login"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
              >
                Masuk
              </Link>
              <Link
                href="/teacher/register"
                className="bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-3 px-6 rounded-lg transition duration-200"
              >
                Daftar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
