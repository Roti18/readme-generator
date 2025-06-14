"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import CopyButton from "./CopyButton";
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

### Lists
1. First item
2. Second item
   - Nested item
   - Another nested item

### Links and Images
[Visit Google](https://google.com)

### Blockquote
> This is a blockquote. It can be used to highlight important information or quotes.

### Table
| Name | Age | City |
|------|-----|------|
| Alice | 25 | Jakarta |
| Bob | 30 | Surabaya |

---

**Start editing** the left panel to see your markdown come to life! 🚀
`;

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState("");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all content?")) {
      setMarkdown("");
      localStorage.removeItem("markdown-content");
    }
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
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Markdown Generator
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <CopyButton text={markdown} />
          <button
            onClick={handleResetDemo}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            Reset Demo
          </button>
          <button
            onClick={handleClearAll}
            className="px-3 py-2 text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-lg transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="flex md:flex-row flex-row items-center justify-between gap-4 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 responsive-toolbar">
        <div className="flex flex-wrap justify-center md:justify-start items-center gap-2">
          <button
            onClick={() => handleInsertMarkdown("## ", "", "Heading")}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
          >
            <Heading2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => handleInsertMarkdown("**", "**", "bold text")}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
          >
            <Bold className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => handleInsertMarkdown("*", "*", "italic text")}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
          >
            <Italic className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => handleInsertMarkdown("> ", "", "Quote")}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
          >
            <MessageSquareQuote className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() =>
              handleInsertMarkdown("[", "](https://)", "link text")
            }
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
          >
            <Link className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => handleInsertMarkdown("- ", "", "List item")}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
          >
            <List className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => handleInsertMarkdown("```\n", "\n```", "code")}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
          >
            <Code className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        <div className="flex justify-center md:justify-end">
          <div className="bg-gray-900 px-5 py-3 rounded-xl font-bold shadow-xl cursor-pointer hover:bg-gray-950 transition-colors duration-200 ease-in-out">
            <a href="#">Gunakan AI?</a>
          </div>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="md:hidden flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === "edit"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          <FileText className="h-4 w-4" />
          Edit
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === "preview"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        <div
          className={`w-full md:w-1/2 flex flex-col border-r border-gray-200 dark:border-gray-700 ${
            activeTab === "preview" ? "hidden md:flex" : ""
          }`}
        >
          <div className="hidden md:flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Markdown Editor
            </span>
          </div>

          <textarea
            ref={textareaRef}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Start typing your markdown here..."
            className="flex-1 p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none focus:outline-none font-mono text-sm leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Preview Panel */}
        <div
          className={`w-full md:w-1/2 flex flex-col ${
            activeTab === "edit" ? "hidden md:flex" : ""
          }`}
        >
          <div className="hidden md:flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Preview
            </span>
          </div>

          <div className="flex-1 overflow-auto p-4 bg-white dark:bg-gray-900">
            {markdown.trim() ? (
              <div className="markdown-content">
                <ReactMarkdown>{markdown}</ReactMarkdown>
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
