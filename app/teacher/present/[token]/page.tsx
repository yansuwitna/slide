"use client";

import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { updatePage, closePresentationAction } from "@/app/actions";
import Link from "next/link";
import Swal from "sweetalert2";

// Use CDN for pdf worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PresenterView({ params }: { params: { token: string } }) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [presentation, setPresentation] = useState<any>(null);
  const [activeStudents, setActiveStudents] = useState<{ name: string, isFocused: boolean }[]>([]);
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth;
      // Kurangi lebar sidebar (256px) di layar desktop (md: >= 768px), plus padding
      const availableWidth = width >= 768 ? width - 256 - 64 : width - 40; 
      setContainerWidth(availableWidth > 800 ? 800 : availableWidth);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    const fetchPres = () => {
      fetch(`/api/presentation/${params.token}?t=${Date.now()}&role=teacher`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setPresentation(data);
            // setPageNumber is intentionally omitted here for the teacher so it doesn't fight local state
            // before updating, but wait, if the teacher opens in two tabs, syncing is good.
            // But we don't want to reset page if they are clicking fast.
            // Let's just update active students.
            if (data.activeStudents) setActiveStudents(data.activeStudents);
            
            setInitialLoaded((prev) => {
              if (!prev) {
                setPageNumber(data.currentPage);
              }
              return true;
            });
          }
        });
    };
    
    fetchPres();
    const interval = setInterval(fetchPres, 1000);
    return () => clearInterval(interval);
  }, [params.token]);

  const changePage = async (offset: number) => {
    const newPage = pageNumber + offset;
    if (newPage > 0 && (!numPages || newPage <= numPages)) {
      setPageNumber(newPage);
      // Sync to server
      await updatePage(params.token, newPage);
    }
  };

  const resetToPage1 = async () => {
    if (pageNumber !== 1) {
      setPageNumber(1);
      await updatePage(params.token, 1);
    }
  };

  const handleExit = () => {
    Swal.fire({
      title: 'Akhiri Presentasi?',
      text: "Siswa akan dikeluarkan dari halaman presentasi secara otomatis.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Akhiri',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        closePresentationAction(presentation.id);
      }
    });
  };

  if (!presentation) return <div className="text-center p-10 font-bold text-xl">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex flex-col md:flex-row justify-between items-center shadow-md gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-xl font-bold">{presentation.title}</h1>
          <p className="text-sm text-gray-400">Token Siswa: <span className="text-yellow-400 font-mono text-lg ml-2">{params.token}</span></p>
        </div>
        
        <div className="flex items-center space-x-4 bg-gray-700 px-4 py-2 rounded-lg">
          <button
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            className="bg-blue-600 disabled:bg-gray-600 px-4 py-2 rounded font-bold transition"
          >
            &larr; Prev
          </button>
          <span className="font-mono text-lg">
            {pageNumber} / {numPages || "?"}
          </span>
          <button
            onClick={() => changePage(1)}
            disabled={pageNumber >= (numPages || 1)}
            className="bg-blue-600 disabled:bg-gray-600 px-4 py-2 rounded font-bold transition"
          >
            Next &rarr;
          </button>
          <button
            onClick={resetToPage1}
            disabled={pageNumber === 1}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 px-4 py-2 rounded font-bold transition text-gray-900 disabled:text-white ml-2"
            title="Kembali ke halaman 1"
          >
            Ke Awal
          </button>
        </div>
        
        <button
          onClick={handleExit}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded font-bold transition"
        >
          Keluar
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Presenter Canvas */}
        <div className="flex-1 flex justify-center items-center p-4 overflow-auto">
          <div className="bg-white p-2 rounded-lg shadow-2xl max-w-full">
            <Document
              file={presentation.filePath}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              className="flex justify-center"
            >
              <Page pageNumber={pageNumber} renderTextLayer={false} renderAnnotationLayer={false} width={containerWidth} className="max-w-full" />
            </Document>
          </div>
        </div>

        {/* Sidebar: Active Students */}
        <div className="w-full md:w-64 bg-gray-800 md:border-l border-t md:border-t-0 border-gray-700 flex flex-col h-48 md:h-auto shrink-0">
          <div className="p-4 bg-gray-900 border-b border-gray-700 flex justify-between items-center">
            <h2 className="font-bold text-gray-300">Siswa Aktif ({activeStudents.filter(s => s.isFocused).length})</h2>
            <div title={presentation.redisOk ? "Redis Terhubung (Realtime Lancar)" : "Redis Terputus (Realtime Lambat)"} className={`w-3 h-3 rounded-full ${presentation.redisOk ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {activeStudents.length === 0 ? (
              <p className="text-gray-500 text-sm text-center italic mt-4">Belum ada siswa yang bergabung...</p>
            ) : (
              activeStudents.map((student, idx) => (
                <div key={idx} className={`flex items-center space-x-2 bg-gray-700 px-3 py-2 rounded-lg ${student.isFocused ? '' : 'opacity-60'}`}>
                  <div className={`w-2 h-2 rounded-full ${student.isFocused ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className={`text-sm font-medium text-gray-200 truncate ${student.isFocused ? '' : 'line-through text-gray-400'}`}>
                    {student.name}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
