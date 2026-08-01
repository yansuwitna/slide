"use client";

import Swal from "sweetalert2";
import { deleteTeacherAction } from "./actions";

export default function DeleteTeacherButton({ teacherId, name, username }: { teacherId: string, name: string, username: string }) {
  const handleDelete = async () => {
    const displayName = name || username;
    const result = await Swal.fire({
      title: "Hapus Guru?",
      html: `Anda yakin ingin menghapus akun guru <b>${displayName}</b>?<br/><br/><span style="color:red">PERINGATAN: Semua presentasi dan file PDF milik guru ini juga akan ikut terhapus secara permanen!</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus Semua!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await deleteTeacherAction(teacherId);
        Swal.fire("Terhapus!", "Akun guru dan seluruh datanya telah berhasil dihapus.", "success");
      } catch (e) {
        Swal.fire("Gagal", "Terjadi kesalahan saat menghapus guru.", "error");
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-1 px-3 rounded shadow ml-2"
    >
      Hapus
    </button>
  );
}
