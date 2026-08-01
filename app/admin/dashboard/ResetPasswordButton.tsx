"use client";

import Swal from "sweetalert2";
import { resetTeacherPassword } from "./actions";

export default function ResetPasswordButton({ teacherId, username }: { teacherId: string, username: string }) {
  const handleReset = async () => {
    const { value: newPassword } = await Swal.fire({
      title: "Reset Password",
      input: "password",
      inputLabel: `Masukkan password baru untuk Guru: ${username}`,
      inputPlaceholder: "Password baru",
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      inputValidator: (value) => {
        if (!value) {
          return "Password tidak boleh kosong!";
        }
      }
    });

    if (newPassword) {
      await resetTeacherPassword(teacherId, newPassword);
      Swal.fire("Berhasil", "Password telah direset.", "success");
    }
  };

  return (
    <button
      onClick={handleReset}
      className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-bold py-1 px-3 rounded shadow"
    >
      Reset Password
    </button>
  );
}
