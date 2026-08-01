"use client";

import Swal from "sweetalert2";
import { deletePresentationAction } from "./actions";

export default function DeleteButton({ presentationId, title }: { presentationId: string; title: string }) {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      html: `Anda akan menghapus presentasi <b>${title}</b>.<br/>Tindakan ini tidak dapat dibatalkan!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      await deletePresentationAction(presentationId);
      Swal.fire("Terhapus!", "Presentasi telah berhasil dihapus.", "success");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="block text-center bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold w-full"
    >
      Hapus
    </button>
  );
}
