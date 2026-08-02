import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import DeleteButton from "./DeleteButton";
import CreatePresentationForm from "./CreatePresentationForm";

export default async function Dashboard() {
  const teacherId = cookies().get("teacherId")?.value;
  if (!teacherId) redirect("/teacher/login");

  const user = await prisma.user.findUnique({
    where: { id: teacherId },
    include: {
      presentations: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) redirect("/teacher/login");

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10 bg-white/50 backdrop-blur p-4 rounded-xl shadow">
        <h1 className="text-3xl font-bold text-gray-800">
          Halo, Guru {user.name || user.username}!
        </h1>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Buat Presentasi */}
        <div className="bg-white p-8 rounded-2xl shadow-xl lg:col-span-1 h-fit">
          <h2 className="text-2xl font-bold mb-6">Mulai Presentasi Baru</h2>
          <CreatePresentationForm />
        </div>

        {/* Daftar Presentasi Aktif */}
        <div className="bg-white p-8 rounded-2xl shadow-xl lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Riwayat Presentasi</h2>
          {user.presentations.length === 0 ? (
            <p className="text-gray-500">Belum ada presentasi.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.presentations.map((pres) => (
                <div key={pres.id} className="border p-5 rounded-xl bg-gray-50 hover:bg-gray-100 transition shadow-sm">
                  <h3 className="font-bold text-lg mb-2">{pres.title}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                      Token: {pres.token}
                    </span>
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <Link
                      href={`/teacher/present/${pres.token}`}
                      className="block text-center flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold"
                    >
                      Buka
                    </Link>
                    <div className="flex-1">
                      <DeleteButton presentationId={pres.id} title={pres.title} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
