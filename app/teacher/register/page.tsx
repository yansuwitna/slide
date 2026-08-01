"use client";

import { registerTeacher } from "@/app/actions";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function Register() {
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const res = await registerTeacher(formData);
    if (res?.error) setError(res.error);
    if (res?.success) {
      await Swal.fire({
        title: "Pendaftaran Berhasil!",
        text: "Akun Anda telah sukses dibuat. Silakan login.",
        icon: "success",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
      router.push("/teacher/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Daftar Guru
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form action={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nama Lengkap
            </label>
            <input
              name="name"
              type="text"
              required
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <input
              name="username"
              type="text"
              required
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-full transition duration-200"
          >
            Daftar
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Sudah punya akun?{" "}
          <Link href="/teacher/login" className="text-blue-600 font-bold">
            Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
