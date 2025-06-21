"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyButton({ text }: { text: string }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`relative inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 focus:ring-blue-500 disabled:opacity-70
        ${
          isCopied
            ? "bg-green-600 text-white"
            : "bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200"
        }
      `}
      disabled={isCopied}
    >
      {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      <span>{isCopied ? "Copied!" : "Copy"}</span>
    </button>
  );
}
