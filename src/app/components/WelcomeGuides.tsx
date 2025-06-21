"use client";

import { useState, Fragment } from "react"; // useEffect tidak lagi dibutuhkan
import { Dialog, Transition } from "@headlessui/react";
import { Sparkles, FileText, X } from "lucide-react";

// Kunci localStorage sudah dihapus karena tidak digunakan lagi

export default function WelcomeGuide() {
  // 1. Ubah state awal menjadi 'true' agar modal langsung muncul saat halaman dimuat
  const [isOpen, setIsOpen] = useState(true);

  // 2. Seluruh blok `useEffect` yang memeriksa localStorage DIHAPUS dari sini.

  // 3. Sederhanakan fungsi handleClose
  const handleClose = () => {
    // Hanya perlu mengubah state, tidak perlu menyimpan ke localStorage
    setIsOpen(false);
  };

  // Logika JSX di bawah ini tidak ada yang berubah,
  // hanya bergantung pada state 'isOpen'.

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-2xl transform overflow-hidden rounded-xl bg-white p-8 text-left align-middle shadow-2xl transition-all dark:bg-gray-800 dark:border dark:border-gray-700">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                    <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="mt-4 text-2xl font-bold leading-6 text-gray-900 dark:text-white"
                  >
                    Selamat Datang di Markdown Generator!
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-gray-600 dark:text-gray-400">
                      Berikut panduan singkat untuk memulai.
                    </p>
                  </div>
                </div>

                <div className="mt-6 text-left space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300">
                      1
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">
                        Tulis di Kiri, Lihat di Kanan:
                      </span>{" "}
                      Panel editor ada di sebelah kiri dan panel preview ada di
                      sebelah kanan untuk melihat hasilnya secara real-time.
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <Sparkles className="flex-shrink-0 mt-1 h-5 w-5 text-yellow-500" />
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Gunakan Bantuan AI:</span>{" "}
                      Ingin membuat deskripsi, tabel, atau daftar? Cukup ketik
                      nama repositori GitHub (contoh: `vercel/next.js`) di form
                      tengah dan biarkan AI membantu Anda.
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300">
                      3
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">Toolbar Bantuan:</span>{" "}
                      Gunakan tombol-tombol di toolbar atas untuk menambahkan
                      format markdown seperti heading, bold, link, dan lainnya
                      dengan cepat.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                  >
                    Mengerti, Mulai Menulis!
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
