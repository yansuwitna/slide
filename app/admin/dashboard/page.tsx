import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutTeacher } from "@/app/actions";
import ResetPasswordButton from "./ResetPasswordButton";
import DeleteTeacherButton from "./DeleteTeacherButton";
import SettingsForm from "./SettingsForm";
import { checkRedisStatus } from "@/lib/redis";

export default async function AdminDashboard() {
  const adminId = cookies().get("adminId")?.value;
  if (!adminId) redirect("/teacher/login");

  const admin = await prisma.user.findUnique({ where: { id: adminId } });
  if (admin?.username !== "admin") redirect("/teacher/login");

  const redisOk = await checkRedisStatus();

  const teachers = await prisma.user.findMany({
    where: { username: { not: "admin" } },
    include: {
      presentations: true,
    },
    orderBy: { username: "asc" }
  });

  const appNameSetting = await prisma.setting.findUnique({ where: { key: "appName" } });
  const appDescSetting = await prisma.setting.findUnique({ where: { key: "appDesc" } });
  const presenceTimeoutSetting = await prisma.setting.findUnique({ where: { key: "presenceTimeout" } });

  const currentAppName = appNameSetting?.value || "EduPresent";
  const currentAppDesc = appDescSetting?.value || "Platform Presentasi Interaktif untuk Guru dan Siswa";
  const currentTimeout = presenceTimeoutSetting?.value || "2000";

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10 bg-white/50 backdrop-blur p-4 rounded-xl shadow">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard Admin
          </h1>
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-sm text-gray-600 font-medium">Status Server Redis (Kehadiran Realtime):</span>
            {redisOk ? (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div> NORMAL
              </span>
            ) : (
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold flex items-center animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div> TERPUTUS
              </span>
            )}
          </div>
        </div>
        <form action={logoutTeacher}>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
            Logout
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl mb-8 border-t-4 border-blue-500">
        <h2 className="text-2xl font-bold mb-6 text-blue-800">Pengaturan Aplikasi</h2>
        <SettingsForm initialName={currentAppName} initialDesc={currentAppDesc} initialTimeout={currentTimeout} />
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold mb-6">Daftar Guru Terdaftar</h2>
        
        {teachers.length === 0 ? (
          <p className="text-gray-500">Belum ada guru yang mendaftar.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Nama</th>
                  <th className="py-3 px-6 text-left">Username</th>
                  <th className="py-3 px-6 text-center">Jumlah Presentasi</th>
                  <th className="py-3 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {teachers.map((t) => (
                  <tr key={t.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <span className="font-bold">{t.name || "-"}</span>
                    </td>
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <span>{t.username}</span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">
                        {t.presentations.length}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex justify-center items-center">
                        <ResetPasswordButton teacherId={t.id} username={t.username} />
                        <DeleteTeacherButton teacherId={t.id} name={t.name} username={t.username} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
