import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

function extractRepoName(prompt: string): string | null {
  const regex = /([a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+)/;
  const match = prompt.match(regex);
  return match ? match[1] : null;
}

function formatRepoNameToTitle(repoName: string): string {
  return repoName
    .split(/[-_]/)
    .map((word) => {
      if (word.length <= 3) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function getTechStack(
  language: string | null,
  fileList: string[],
  dependencies: object,
  devDependencies: object
): string {
  const icons: Set<string> = new Set();
  const allDeps = { ...dependencies, ...devDependencies };

  if ("next" in allDeps) icons.add("Next.js");
  if ("react" in allDeps) icons.add("React");
  if ("express" in allDeps) icons.add("Express.js");
  if ("tailwindcss" in allDeps) icons.add("Tailwind CSS");
  if ("typescript" in allDeps) icons.add("TypeScript");
  if (language?.toLowerCase() === "javascript" && !icons.has("React"))
    icons.add("Node.js");

  return icons.size > 0 ? Array.from(icons).join(" · ") : "Tidak terdeteksi.";
}

function detectPackageManager(files: string[]): {
  installCmd: string;
  runCmd: string;
  name: string;
} {
  const lowercasedFiles = files.map((f) => f.toLowerCase());
  if (lowercasedFiles.includes("yarn.lock")) {
    return { installCmd: "yarn install", runCmd: "yarn dev", name: "Yarn" };
  }
  if (lowercasedFiles.includes("pnpm-lock.yaml")) {
    return { installCmd: "pnpm install", runCmd: "pnpm dev", name: "PNPM" };
  }
  if (lowercasedFiles.includes("bun.lockb")) {
    return { installCmd: "bun install", runCmd: "bun dev", name: "Bun" };
  }
  if (lowercasedFiles.includes("package.json")) {
    return { installCmd: "npm install", runCmd: "npm run dev", name: "NPM" };
  }
  return { installCmd: "N/A", runCmd: "N/A", name: "Tidak diketahui" };
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
        { error: "Format 'user/repo' tidak ditemukan." },
        { status: 400 }
      );
    }

    const GITHUB_API_HEADERS = {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
    };
    const [repoRes, rootContentsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${repoName}`, {
        headers: GITHUB_API_HEADERS,
      }),
      fetch(`https://api.github.com/repos/${repoName}/contents/`, {
        headers: GITHUB_API_HEADERS,
      }),
    ]);

    if (!repoRes.ok) {
      return NextResponse.json(
        { error: `Repo '${repoName}' tidak ditemukan.` },
        { status: 404 }
      );
    }

    const repoData = await repoRes.json();
    const rootContents = rootContentsRes.ok ? await rootContentsRes.json() : [];
    const fileList = rootContents.map((item: { name: string }) => item.name);

    let dependencies = {},
      devDependencies = {};
    const packageJsonFile = rootContents.find(
      (item: { name: string }) => item.name === "package.json"
    );
    if (packageJsonFile) {
      const packageJsonRes = await fetch(packageJsonFile.url, {
        headers: GITHUB_API_HEADERS,
      });
      if (packageJsonRes.ok) {
        const packageData = await packageJsonRes.json();
        const content = Buffer.from(packageData.content, "base64").toString(
          "utf-8"
        );
        const parsedContent = JSON.parse(content);
        dependencies = parsedContent.dependencies || {};
        devDependencies = parsedContent.devDependencies || {};
      }
    }

    const formattedTitle = formatRepoNameToTitle(repoData.name);
    const techStack = getTechStack(
      repoData.language,
      fileList,
      dependencies,
      devDependencies
    );
    const pm = detectPackageManager(fileList);

    const detailedPrompt = `
      [ROLE & PERSONA]
      You are "Genesis", a world-class Senior Technical Writer at Vercel. You are an expert in creating clear, compelling, and aesthetically pleasing README.md files. Your documentation is the gold standard.

      [GOLD STANDARD EXAMPLE - YOUR TARGET]
      Below is a perfect example of a README.md you have written before. Study its structure, tone, use of emojis, and clarity. Your generated output MUST match this level of quality.

      \`\`\`markdown
      # API Latihan TOEFL

      ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

      REST API sederhana yang menyediakan soal-soal latihan TOEFL...

      **Dokumentasi Live bisa diakses di:** [https://toefl-api.vercel.app/document](https://toefl-api.vercel.app/document)

      ## ✨ Fitur Utama
      - **Data Soal Lengkap**: ...
      - **Endpoint Fleksibel**: ...
      - **Perhitungan Skor Otomatis**: ...

      ## 💻 Teknologi yang Digunakan
      - **Backend**: Node.js, Express.js
      - **Data**: JSON statis

      ## 📂 Struktur Proyek
      \`\`\`
      /
      ├── public/
      │   └── index.html
      ├── data/
      │   └── soal.json
      ├── index.js
      └── package.json
      \`\`\`

      ## 🛠️ Cara Menjalankan Secara Lokal
      1.  **Clone repository ini:**
          \`\`\`bash
          git clone https://github.com/Roti18/toefl-api
          cd toefl-api
          \`\`\`
      2.  **Install semua dependency:**
          \`\`\`bash
          npm install
          \`\`\`
      3.  **Jalankan server development:**
          \`\`\`bash
          npm run dev
          \`\`\`
      \`\`\`
      --- End of Example ---

      [PROJECT CONTEXT TO DOCUMENT]
      - Formatted Title: ${formattedTitle}
      - Repository Name: ${repoData.full_name}
      - Description: ${repoData.description || "No description provided."}
      - Detected Tech Stack: ${techStack}
      - Detected Package Manager: ${pm.name}
      - Installation Command: ${pm.installCmd}
      - Run Command: ${pm.runCmd}
      - File Structure: ${fileList.join(", ")}

      [PRIMARY TASK]
      Based on the user's prompt below, perform ONE of the following:

      1.  **IF the prompt is general** (e.g., just the repo name, "create README"):
          Your main mission is to generate a **complete, professional README.md** for the provided project context.
          - **MANDATORY**: Emulate the structure and style of the "GOLD STANDARD EXAMPLE".
          - Use the "Formatted Title" as the main H1 header.
          - Create relevant sections like "✨ Fitur Utama", "💻 Teknologi yang Digunakan", "📂 Struktur Proyek", and "🛠️ Cara Menjalankan Secara Lokal".
          - Automatically generate shields.io badges for the detected tech stack.
          - The "Getting Started" section must use the correct, detected installation and run commands.

      2.  **IF the prompt is specific** (e.g., "explain the API"):
          Answer the specific question in a detailed, structured Markdown format, using the project context to inform your answer.

      [USER PROMPT]
      "${prompt}"

      [FINAL INSTRUCTION]
      Your entire output must be in Markdown format. Do NOT include any introductory text like "Sure, here is the README...". Start directly with the Markdown content.
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
