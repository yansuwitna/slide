"use client";

import { useState } from "react";
import { saveSettingsAction } from "./actions";
import Swal from "sweetalert2";

export default function SettingsForm({ initialName, initialDesc }: { initialName: string, initialDesc: string }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await saveSettingsAction(formData);
    
    if (res.success) {
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Pengaturan aplikasi berhasil disimpan!",
        confirmButtonColor: "#3085d6",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal menyimpan pengaturan.",
      });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 font-bold mb-2">Nama Aplikasi</label>
        <input 
          type="text" 
          name="appName" 
          defaultValue={initialName} 
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-gray-700 font-bold mb-2">Deskripsi (Slogan)</label>
        <input 
          type="text" 
          name="appDesc" 
          defaultValue={initialDesc} 
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <button 
        type="submit" 
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition disabled:bg-gray-400"
      >
        {loading ? "Menyimpan..." : "Simpan Pengaturan"}
      </button>
    </form>
  );
}
