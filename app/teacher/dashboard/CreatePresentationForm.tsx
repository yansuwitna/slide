"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function CreatePresentationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const file = formData.get("file") as File;
    
    if (!title || !file || file.size === 0) {
      Swal.fire("Error", "Harap isi judul dan pilih file PDF.", "error");
      return;
    }

    const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const fileSizeText = fileSizeInMB === "0.00" ? `${(file.size / 1024).toFixed(2)} KB` : `${fileSizeInMB} MB`;

    const result = await Swal.fire({
      title: "Buat Presentasi?",
      html: `Judul: <b>${title}</b><br/>File: <b>${file.name}</b><br/>Ukuran: <b>${fileSizeText}</b><br/><br/>Pastikan file yang dipilih sudah benar.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Buat!",
      cancelButtonText: "Batal",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      setUploadProgress(0);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload-presentation", true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            router.push(`/teacher/present/${response.token}`);
          } else {
            setIsLoading(false);
            setUploadProgress(0);
            Swal.fire("Gagal", response.error || "Gagal mengupload", "error");
          }
        } else {
          setIsLoading(false);
          setUploadProgress(0);
          Swal.fire("Gagal", "Terjadi kesalahan pada server", "error");
        }
      };

      xhr.onerror = () => {
        setIsLoading(false);
        setUploadProgress(0);
        Swal.fire("Gagal", "Terjadi kesalahan jaringan", "error");
      };

      xhr.send(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      <div>
        <label className="block text-gray-700 font-bold mb-2">Judul</label>
        <input
          name="title"
          required
          className="w-full border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          placeholder="Contoh: Biologi Bab 1"
          disabled={isLoading}
        />
      </div>
      <input type="hidden" name="type" value="pdf" />

      <div>
        <label className="block text-gray-700 font-bold mb-2">Upload File PDF</label>
        <input
          name="file"
          type="file"
          accept=".pdf"
          required
          className="w-full border p-3 rounded-lg bg-gray-50 mb-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full text-white font-bold py-3 rounded-lg relative overflow-hidden flex items-center justify-center space-x-2 transition ${
          isLoading ? "bg-gray-200 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
        }`}
      >
        {isLoading ? (
          <>
            {/* Progress Bar Background (Biru) */}
            <div 
              className="absolute left-0 top-0 bottom-0 bg-blue-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
            
            <div className="relative z-10 flex items-center space-x-2 text-gray-800">
              <svg className="animate-spin h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Mengupload... {uploadProgress}%</span>
            </div>
          </>
        ) : (
          <span>Buat Presentasi</span>
        )}
      </button>
    </form>
  );
}
