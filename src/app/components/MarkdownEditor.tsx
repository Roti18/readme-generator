"use client";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import CopyButton from "./CopyButton";
import WelcomeGuide from "./WelcomeGuides";
import { ThemeSwitcher } from "./ThemeSwitcher";
import ConfirmModal from "./ConfirmModal";
import {
  FileText,
  Eye,
  Heading2,
  Bold,
  Italic,
  Link,
  Code,
  MessageSquareQuote,
  List,
  Sparkles,
  AlertCircle,
} from "lucide-react";

const defaultMarkdown = `# Welcome to Markdown Generator

## What is this?
This is a **live markdown editor** that allows you to write and preview markdown in real-time.

### Features
- ✅ Live preview
- ✅ Dark mode support
- ✅ Copy to clipboard
- ✅ Responsive design
- ✅ Auto-save to localStorage
- ✅ Formatting shortcuts

### Example Code Block
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
\`\`\`

---

**Start editing** the left panel to see your markdown come to life! 🚀
`;

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState("");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("markdown-content");
    if (saved) {
      setMarkdown(saved);
    } else {
      setMarkdown(defaultMarkdown);
    }
  }, []);

  useEffect(() => {
    if (markdown) {
      localStorage.setItem("markdown-content", markdown);
    }
  }, [markdown]);

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setMarkdown("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menghasilkan konten.");
      }

      setMarkdown(data.markdown);
      setAiPrompt("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan yang tidak diketahui.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = () => {
    setIsClearConfirmOpen(true);
  };

  const executeClear = () => {
    setMarkdown("");
    localStorage.removeItem("markdown-content");
    setIsClearConfirmOpen(false);
  };

  const handleResetDemo = () => {
    setMarkdown(defaultMarkdown);
  };

  const handleInsertMarkdown = (
    prefix: string,
    suffix: string = "",
    placeholder: string = ""
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);

    let newText;
    let cursorPos;

    if (selectedText) {
      newText = `${markdown.substring(
        0,
        start
      )}${prefix}${selectedText}${suffix}${markdown.substring(end)}`;
      cursorPos = start + prefix.length + selectedText.length + suffix.length;
    } else {
      newText = `${markdown.substring(
        0,
        start
      )}${prefix}${placeholder}${suffix}${markdown.substring(start)}`;
      cursorPos = start + prefix.length;
    }

    setMarkdown(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos + placeholder.length);
    }, 0);
  };

  return (
    <div className="flex flex-col h-screen">
      <WelcomeGuide />

      <ConfirmModal
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={executeClear}
        title="Hapus Semua Konten?"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Aksi ini tidak dapat diurungkan. Seluruh tulisan Anda di editor akan
          hilang permanen. Anda yakin ingin melanjutkan?
        </p>
      </ConfirmModal>

      <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 p-4 border-b dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold">Readme Generator</h1>
        </div>
        <div className="flex items-center gap-3">
          <CopyButton text={markdown} />
          <button
            onClick={handleResetDemo}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleClearAll}
            className="px-3 py-2 text-sm font-medium bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 rounded-lg transition-colors"
          >
            Clear
          </button>
          <div className="border-l h-6 dark:border-zinc-700"></div>
          <ThemeSwitcher />
        </div>
      </div>

      <div className="flex md:flex-row flex-col items-center justify-between gap-4 p-2 border-b dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
        <div className="flex flex-wrap justify-center md:justify-start items-center gap-1">
          <button
            onClick={() => handleInsertMarkdown("## ", "", "Heading")}
            className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-md"
          >
            <Heading2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => handleInsertMarkdown("**", "**", "bold text")}
            className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-md"
          >
            <Bold className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => handleInsertMarkdown("*", "*", "italic text")}
            className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-md"
          >
            <Italic className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => handleInsertMarkdown("> ", "", "Quote")}
            className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-md"
          >
            <MessageSquareQuote className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() =>
              handleInsertMarkdown("[", "](https://)", "link text")
            }
            className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-md"
          >
            <Link className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => handleInsertMarkdown("- ", "", "List item")}
            className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-md"
          >
            <List className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => handleInsertMarkdown("```\n", "\n```", "code")}
            className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-md"
          >
            <Code className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="flex flex-col items-end">
          <form onSubmit={handleAiSubmit} className="flex w-full">
            <input
              type="text"
              placeholder="Analisis repo..."
              className="w-full md:w-96 px-3 py-2 text-sm bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-r-md transition-colors disabled:opacity-50"
              disabled={!aiPrompt.trim() || isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span>{isLoading ? "Loading..." : "Generate"}</span>
            </button>
          </form>
          {error && (
            <div className="mt-2 flex items-center gap-2 text-sm text-red-500">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      <div className="md:hidden flex border-b dark:border-zinc-800">
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === "edit"
              ? "text-blue-600 border-b-2 border-blue-500"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <FileText className="h-4 w-4" /> Edit
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === "preview"
              ? "text-blue-600 border-b-2 border-blue-500"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <Eye className="h-4 w-4" /> Preview
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div
          className={`w-full md:w-1/2 flex flex-col border-r dark:border-zinc-800 ${
            activeTab === "preview" && "hidden md:flex"
          }`}
        >
          <div className="hidden md:flex items-center gap-2 p-3 bg-gray-50 dark:bg-zinc-900/50 border-b dark:border-zinc-800">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Editor
            </span>
          </div>
          <textarea
            ref={textareaRef}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Start typing your markdown here..."
            className="flex-1 p-4 bg-transparent resize-none focus:outline-none font-mono text-sm leading-relaxed"
            spellCheck={false}
          />
        </div>
        <div
          className={`w-full md:w-1/2 flex flex-col ${
            activeTab === "edit" && "hidden md:flex"
          }`}
        >
          <div className="hidden md:flex items-center gap-2 p-3 bg-gray-50 dark:bg-zinc-900/50 border-b dark:border-zinc-800">
            <Eye className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Preview
            </span>
          </div>
          <div className="flex-1 overflow-auto p-4 bg-transparent">
            {markdown.trim() ? (
              <div className="markdown-content">
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw]}
                  remarkPlugins={[remarkGfm]}
                >
                  {markdown}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start typing to see your markdown preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
