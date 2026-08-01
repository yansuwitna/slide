"use client";

import { useFormState } from "react-dom";
import { joinPresentation } from "@/app/actions";
import Link from "next/link";
import { useState } from "react";

export default function Join() {
  const [error, setError] = useState("");

  const handleSubmit = async (formData: FormData) => {
    const res = await joinPresentation(formData);
    if (res?.error) setError(res.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Gabung Kelas
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form action={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nama Siswa
            </label>
            <input
              name="name"
              type="text"
              required
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Token Kelas
            </label>
            <input
              name="token"
              type="text"
              required
              placeholder="Masukkan 6 digit token"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 uppercase font-mono"
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg w-full transition duration-200"
          >
            Masuk Kelas
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <Link href="/" className="text-gray-500 hover:underline">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
