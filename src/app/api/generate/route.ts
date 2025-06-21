import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

function extractRepoName(prompt: string): string | null {
  const regex = /([a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+)/;
  const match = prompt.match(regex);
  return match ? match[1] : null;
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

    const githubResponse = await fetch(
      `https://api.github.com/repos/${repoName}`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    if (!githubResponse.ok) {
      return NextResponse.json(
        { error: `Repo '${repoName}' tidak ditemukan.` },
        { status: 404 }
      );
    }
    const repoData = await githubResponse.json();
    const repoContext = {
      name: repoData.name,
      description: repoData.description,
      language: repoData.language,
      stars: repoData.stargazers_count,
    };

    let fileList: string[] = [];
    try {
      const contentsResponse = await fetch(
        `https://api.github.com/repos/${repoName}/contents/`,
        {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (contentsResponse.ok) {
        const contentsData = await contentsResponse.json();
        fileList = contentsData.map((item: { name: string }) => item.name);
      }
    } catch (e) {
      console.log(`error: ${e}`);
      console.log(
        `Gagal mengambil struktur file untuk repo ${repoName}. Melanjutkan tanpa data file.`
      );
    }

    function getTechStackIcons(language: string, fileList: string[]): string {
      const icons: string[] = [];

      // Bahasa utama
      const lang = language.toLowerCase();
      if (lang.includes("javascript")) icons.push("🟨 JavaScript");
      if (lang.includes("typescript")) icons.push("🟦 TypeScript");
      if (lang.includes("python")) icons.push("🐍 Python");
      if (lang.includes("go")) icons.push("💙 Go");
      if (lang.includes("java")) icons.push("☕ Java");

      // File/folder-based stack detection
      const files = fileList.map((f) => f.toLowerCase());
      if (files.includes("next.config.js") || files.includes("next.config.ts"))
        icons.push("⚡ Next.js");
      if (files.includes("package.json")) icons.push("📦 Node.js");
      if (files.includes("app") || files.includes("routes"))
        icons.push("🌐 Express.js");
      if (files.includes("dockerfile")) icons.push("🐳 Docker");
      if (files.includes("vite.config.js")) icons.push("⚡ Vite");
      if (files.includes("astro.config.mjs")) icons.push("🌠 Astro");

      return icons.length > 0 ? icons.join(" · ") : "Tidak terdeteksi.";
    }

    const techStackIcons = getTechStackIcons(repoContext.language, fileList);

    const detailedPrompt = `
Anda adalah seorang software engineer berpengalaman dan penulis dokumentasi teknis. 
Tugas Anda adalah menghasilkan dokumentasi dalam format Markdown berdasarkan prompt berikut:

"${prompt}"

Berikut adalah informasi dari repositori GitHub yang perlu Anda gunakan sebagai referensi:

Repositori bernama "${repoContext.name}" menggunakan bahasa ${
      repoContext.language
    }, dan memiliki ${repoContext.stars} bintang. ${
      repoContext.description
        ? `Deskripsi repositori: "${repoContext.description}".`
        : `Repositori ini tidak memiliki deskripsi.`
    }

Struktur file/folder di root repositori ini: ${
      fileList.length > 0
        ? fileList.join(", ")
        : "tidak tersedia atau gagal dimuat."
    }

Berikut tech stack yang kemungkinan digunakan:
${techStackIcons}

💡 *Instruksi penting:*  
- Buat dokumen dalam format Markdown.  
- Jika ada framework/tools seperti Next.js, Express, Node.js, dsb., **tampilkan logo atau badge-nya di awal markdown** agar terlihat lebih profesional dan menarik.  
- Gunakan heading, list, dan format markdown lainnya agar mudah dibaca.  
- Jangan tulis apapun selain markdown.

Silakan hasilkan dokumentasi sekarang.
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
