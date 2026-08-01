"use client";

import { useFormState } from "react-dom";
import { loginTeacher } from "@/app/actions";
import Link from "next/link";
import { useState } from "react";

export default function Login() {
  const [error, setError] = useState("");

  const handleSubmit = async (formData: FormData) => {
    const res = await loginTeacher(formData);
    if (res?.error) setError(res.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Login Guru
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form action={handleSubmit}>
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
            Masuk
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Belum punya akun?{" "}
          <Link href="/teacher/register" className="text-blue-600 font-bold">
            Daftar
          </Link>
        </div>
      </div>
    </div>
  );
}
