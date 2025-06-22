"use client";

import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FileText, X, Sparkles } from "lucide-react";

export default function WelcomeGuide() {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
  };

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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
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
              <Dialog.Panel className="relative w-full max-w-2xl transform overflow-hidden rounded-xl bg-white dark:bg-zinc-900 p-8 text-left align-middle shadow-2xl transition-all border border-gray-200 dark:border-zinc-800">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
                  aria-label="Tutup"
                >
                  <X className="h-6 w-6" />
                </button>
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-full">
                    <FileText className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="mt-4 text-2xl font-bold leading-6 text-gray-900 dark:text-white"
                  >
                    Selamat Datang di Readme Generator!
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-gray-600 dark:text-gray-400">
                      Berikut panduan singkat untuk memulai.
                    </p>
                  </div>
                </div>

                <div className="mt-8 text-left space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-gray-200 dark:bg-zinc-800 text-xs font-bold text-gray-600 dark:text-gray-300">
                      1
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Tulis di Kiri, Lihat di Kanan:
                      </span>{" "}
                      Panel editor ada di sebelah kiri dan panel preview ada di
                      sebelah kanan untuk melihat hasilnya secara real-time.
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <Sparkles className="flex-shrink-0 mt-1 h-5 w-5 text-blue-500" />
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Gunakan Bantuan AI:
                      </span>{" "}
                      Ingin membuat deskripsi atau tabel? Cukup ketik nama
                      repositori GitHub (contoh: `vercel/next.js`) di form dan
                      biarkan AI membantu Anda.
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-gray-200 dark:bg-zinc-800 text-xs font-bold text-gray-600 dark:text-gray-300">
                      3
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Toolbar Bantuan:
                      </span>{" "}
                      Gunakan tombol-tombol di toolbar atas untuk menambahkan
                      format markdown seperti heading, bold, dan link dengan
                      cepat.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleClose}
                    className="px-8 py-3 font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
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
