import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import prisma from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  let appName = "EduPresent";
  let appDesc = "Platform Presentasi Interaktif untuk Guru dan Siswa";

  try {
    const nameSetting = await prisma.setting.findUnique({ where: { key: "appName" } });
    if (nameSetting) appName = nameSetting.value;

    const descSetting = await prisma.setting.findUnique({ where: { key: "appDesc" } });
    if (descSetting) appDesc = descSetting.value;
  } catch (error) {
    // Abaikan error (berguna saat build pertama kali jika DB belum siap)
  }

  return {
    title: appName,
    description: appDesc,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
