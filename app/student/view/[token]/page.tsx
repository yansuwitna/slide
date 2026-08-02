"use client";

import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import Link from "next/link";
import Swal from "sweetalert2";
import { logoutStudentAction } from "@/app/actions";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function StudentView({ params }: { params: { token: string } }) {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [presentation, setPresentation] = useState<any>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);

  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth;
      setContainerWidth(width > 850 ? 800 : width - 40);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    // Initial fetch
    const fetchPres = () => {
      // Selalu lakukan fetch agar presentasi tetap bergerak (tersinkronisasi)
      // Namun, kita kirimkan status apakah siswa sedang fokus (klik layar) atau tidak ke server
      const isFocused = document.hasFocus();
      
      fetch(`/api/presentation/${params.token}?t=${Date.now()}&focused=${isFocused}&role=student`)
        .then((res) => res.json())
        .then((data) => {
          if (data.closed) {
            Swal.fire({
              icon: 'info',
              title: 'Presentasi Selesai',
              text: 'Guru telah menutup presentasi ini.',
              timer: 2000,
              showConfirmButton: false,
            }).then(() => {
              logoutStudentAction();
            });
            return;
          }
          if (!data.error) {
            setPresentation(data);
            setPageNumber(data.currentPage);
          }
        });
    };

    fetchPres();

    // Polling every 1 second
    const interval = setInterval(fetchPres, 1000);
    return () => clearInterval(interval);
  }, [params.token]);

  if (!presentation) return <div className="text-center p-10 font-bold text-xl">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 flex flex-col md:flex-row justify-between items-center shadow-md gap-4">
        <h1 className="text-xl font-bold text-gray-800 text-center md:text-left">{presentation.title}</h1>
        
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold">
          Halaman {pageNumber}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex justify-center items-center p-4 overflow-auto">
        <div className="bg-white p-2 rounded-lg shadow-xl max-w-full pointer-events-none">
          <Document
            file={presentation.filePath}
            className="flex justify-center"
          >
            <Page pageNumber={pageNumber} renderTextLayer={false} renderAnnotationLayer={false} width={containerWidth} className="max-w-full" />
          </Document>
        </div>
      </div>
    </div>
  );
}
