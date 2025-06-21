import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

function extractRepoName(prompt: string): string | null {
  const regex = /([a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+)/;
  const match = prompt.match(regex);
  return match ? match[1] : null;
}

function getTechStack(language: string | null, fileList: string[]): string {
  const icons: Set<string> = new Set();
  const lang = language ? language.toLowerCase() : "";
  const files = fileList.map((f) => f.toLowerCase());

  if (files.includes("next.config.js") || files.includes("next.config.ts"))
    icons.add("⚡ Next.js");
  if (files.includes("astro.config.mjs")) icons.add("🌠 Astro");
  if (files.includes("vite.config.js") || files.includes("vite.config.ts"))
    icons.add("⚡ Vite");
  if (files.includes("remix.config.js")) icons.add("💿 Remix");
  if (
    files.includes("tailwind.config.js") ||
    files.includes("tailwind.config.ts")
  )
    icons.add("💨 Tailwind CSS");

  if (lang.includes("javascript")) icons.add("🟨 JavaScript");
  if (lang.includes("typescript")) icons.add("🟦 TypeScript");
  if (lang.includes("python")) icons.add("🐍 Python");
  if (lang.includes("go")) icons.add("🐹 Go");
  if (lang.includes("java")) icons.add("☕ Java");
  if (lang.includes("rust")) icons.add("🦀 Rust");

  if (files.includes("package.json") && !icons.has("⚡ Next.js"))
    icons.add("📦 Node.js");
  if (files.includes("dockerfile")) icons.add("🐳 Docker");

  return icons.size > 0 ? Array.from(icons).join(" · ") : "Tidak terdeteksi.";
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const repoName = extractRepoName(prompt);
    if (!repoName) {
      return NextResponse.json(
        {
          error:
            "Nama repositori dengan format 'user/repo' tidak ditemukan dalam prompt.",
        },
        { status: 400 }
      );
    }

    const [githubRes, contentsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${repoName}`, {
        headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` },
      }),
      fetch(`https://api.github.com/repos/${repoName}/contents/`, {
        headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` },
      }),
    ]);

    if (!githubRes.ok) {
      return NextResponse.json(
        { error: `Repo '${repoName}' tidak ditemukan.` },
        { status: 404 }
      );
    }
    const repoData = await githubRes.json();

    let fileList: string[] = [];
    if (contentsRes.ok) {
      const contentsData = await contentsRes.json();
      fileList = contentsData.map((item: { name: string }) => item.name);
    }

    const techStack = getTechStack(repoData.language, fileList);

    const detailedPrompt = `
      Anda adalah asisten AI pemrograman senior yang sangat membantu dan ahli dalam analisis kode.
      Gunakan informasi konteks di bawah ini untuk menjawab permintaan pengguna dengan akurat dan mendalam.

      == KONTEKS DARI REPOSITORI GITHUB ==
      - Nama Repo: ${repoData.name}
      - Deskripsi: ${repoData.description || "Tidak ada deskripsi."}
      - Bahasa Utama: ${repoData.language || "Tidak terdeteksi."}
      - Bintang: ${repoData.stargazers_count}
      - Tech Stack Terdeteksi: ${techStack}
      - Daftar File & Folder di Root: ${
        fileList.length > 0
          ? `\n  - ` + fileList.join("\n  - ")
          : "Tidak tersedia."
      }

      == PERMINTAAN PENGGUNA ==
      "${prompt}"

      == INSTRUKSI AKHIR ==
      - Jawablah permintaan pengguna di atas dengan sebaik-baiknya menggunakan konteks yang telah diberikan.
      - Format seluruh jawaban Anda HANYA dalam bentuk Markdown yang terstruktur dengan baik.
      - Jangan pernah menyertakan kalimat pembuka atau penutup seperti "Tentu, ini hasilnya" atau "Semoga membantu". Langsung berikan jawaban dalam format Markdown.
    `;

    const result = await model.generateContent(detailedPrompt);
    const response = await result.response;
    const aiMarkdown = response.text();

    return NextResponse.json({ markdown: aiMarkdown });
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
