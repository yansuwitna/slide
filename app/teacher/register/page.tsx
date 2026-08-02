"use client";

import { registerTeacher } from "@/app/actions";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function Register() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

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

  const reqLength = password.length >= 8;
  const reqUpper = /[A-Z]/.test(password);
  const reqLower = /[a-z]/.test(password);
  const reqNum = /[0-9]/.test(password);
  const reqSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isValid = reqLength && reqUpper && reqLower && reqNum && reqSpecial;

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
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="shadow appearance-none border rounded w-full py-3 px-4 pr-12 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 hover:text-blue-600 focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            
            <ul className="text-xs mt-3 space-y-1 font-medium">
              <li className={reqLength ? "text-green-600" : "text-red-500"}>
                {reqLength ? "✓" : "✗"} Minimal 8 karakter
              </li>
              <li className={reqUpper ? "text-green-600" : "text-red-500"}>
                {reqUpper ? "✓" : "✗"} Mengandung huruf kapital (A-Z)
              </li>
              <li className={reqLower ? "text-green-600" : "text-red-500"}>
                {reqLower ? "✓" : "✗"} Mengandung huruf kecil (a-z)
              </li>
              <li className={reqNum ? "text-green-600" : "text-red-500"}>
                {reqNum ? "✓" : "✗"} Mengandung angka (0-9)
              </li>
              <li className={reqSpecial ? "text-green-600" : "text-red-500"}>
                {reqSpecial ? "✓" : "✗"} Mengandung karakter spesial (!@# dsb)
              </li>
            </ul>
          </div>
          {isValid ? (
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-full transition duration-200"
            >
              Daftar
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="bg-gray-400 text-white font-bold py-3 px-6 rounded-lg w-full cursor-not-allowed"
            >
              Penuhi syarat password
            </button>
          )}
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
