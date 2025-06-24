import { NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  GenerateContentResult,
} from "@google/generative-ai";

const MODEL_NAME = process.env.GEMINI_MODEL_NAME || "gemini-1.5-flash-latest";
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const CACHE_DURATION = 10 * 60 * 1000;

interface GitHubFile {
  path: string;
  size?: number;
}
interface GitHubTreeItem {
  path: string;
  type: "blob" | "tree";
  size?: number;
}
interface GitHubRepoData {
  full_name: string;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  default_branch: string;
}
interface AnalysisResult {
  repoData: GitHubRepoData;
  techStack: TechStack;
  insights: Record<string, boolean | string>;
  packageManager: Record<string, string>;
  fileTree: string;
  keyFileContents: Record<string, string>;
}
type FileTreeNode = {
  [key: string]: FileTreeNode;
};
interface TechStack {
  languages: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
  deployment: string[];
  styling: string[];
  linting: string[];
}
interface CacheEntry {
  data: AnalysisResult;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function extractRepoName(prompt: string): string | null {
  const patterns = [
    /github\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)/,
    /([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)/,
  ];
  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match && match[1]) return match[1].replace(/\.git$/, "");
  }
  return null;
}

function formatRepoNameToTitle(repoName: string): string {
  return repoName
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function comprehensiveProjectAnalysis(
  repoName: string,
  headers: Record<string, string>
): Promise<AnalysisResult> {
  console.log(`🚀 Memulai analisis komprehensif untuk ${repoName}...`);

  const repoRes = await fetch(`https://api.github.com/repos/${repoName}`, {
    headers,
  });
  if (!repoRes.ok)
    throw new Error(`Repo ${repoName} tidak ditemukan atau akses ditolak.`);
  const repoData: GitHubRepoData = await repoRes.json();

  const treeRes = await fetch(
    `https://api.github.com/repos/${repoName}/git/trees/${repoData.default_branch}?recursive=1`,
    { headers }
  );
  if (!treeRes.ok)
    throw new Error(`Gagal mengambil tree file untuk ${repoName}.`);
  const treeData = await treeRes.json();
  if (treeData.truncated) {
    console.warn(
      `⚠️ Peringatan: Daftar file untuk ${repoName} terpotong karena terlalu banyak file.`
    );
  }

  const allFiles: GitHubFile[] = treeData.tree
    .filter((item: GitHubTreeItem) => item.type === "blob")
    .map((item: GitHubTreeItem) => ({ path: item.path, size: item.size }));

  const criticalFiles = [
    "package.json",
    "composer.json",
    "README.md",
    "README.mdx",
    "vercel.json",
    "netlify.toml",
    "dockerfile",
    "docker-compose.yml",
    "tsconfig.json",
    "jsconfig.json",
    "vite.config.ts",
    "webpack.config.js",
    "next.config.js",
    "next.config.mjs",
    "prisma/schema.prisma",
    ".env.example",
    "requirements.txt",
    "pom.xml",
  ];

  const filesToRead = allFiles
    .filter((f) => criticalFiles.includes(f.path.split("/").pop() || ""))
    .slice(0, 10);

  const keyFileContents: Record<string, string> = {};
  await Promise.all(
    filesToRead.map(async (file) => {
      try {
        const contentRes = await fetch(
          `https://api.github.com/repos/${repoName}/contents/${file.path}`,
          { headers }
        );
        if (!contentRes.ok) return;
        const contentData = await contentRes.json();
        if (contentData.content) {
          keyFileContents[file.path] = Buffer.from(
            contentData.content,
            "base64"
          ).toString("utf-8");
        }
      } catch (error) {
        console.error(`Gagal membaca konten dari ${file.path}`, error);
      }
    })
  );

  const techStack: TechStack = {
    languages: [],
    frameworks: [],
    databases: [],
    tools: [],
    deployment: [],
    styling: [],
    linting: [],
  };
  const insights: Record<string, boolean | string> = {
    isMonorepo: false,
    hasTests: false,
    hasCI: false,
    hasAPI: false,
    architecture: "Unknown",
  };

  const packageJsonContent = Object.values(keyFileContents).find((content) => {
    try {
      const json = JSON.parse(content);
      return json.name && (json.dependencies || json.devDependencies);
    } catch {
      return false;
    }
  });

  let allDeps: Record<string, string> = {};
  if (packageJsonContent) {
    try {
      const pkg = JSON.parse(packageJsonContent);
      allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    } catch (error) {
      console.error("Tidak dapat mem-parsing package.json", error);
    }
  }

  const depMappings: Record<
    keyof Omit<TechStack, "languages">,
    Record<string, string>
  > = {
    frameworks: {
      react: "React",
      next: "Next.js",
      vue: "Vue",
      nuxt: "Nuxt.js",
      svelte: "SvelteKit",
      express: "Express",
      nestjs: "NestJS",
      fastify: "Fastify",
      angular: "Angular",
      laravel: "Laravel",
    },
    databases: {
      prisma: "Prisma",
      mongoose: "Mongoose",
      "drizzle-orm": "Drizzle ORM",
      typeorm: "TypeORM",
      sequelize: "Sequelize",
      "firebase-admin": "Firebase",
    },
    tools: {
      husky: "Husky",
      turbo: "Turborepo",
      jest: "Jest",
      vitest: "Vitest",
      cypress: "Cypress",
      storybook: "Storybook",
      vite: "Vite",
      webpack: "Webpack",
    },
    deployment: { vercel: "Vercel", netlify: "Netlify" },
    styling: {
      tailwindcss: "Tailwind CSS",
      "styled-components": "Styled C.",
      sass: "Sass",
      less: "Less",
      antd: "Ant Design",
      "@mui/material": "MUI",
      "shadcn-ui": "shadcn/ui",
    },
    linting: { eslint: "ESLint", prettier: "Prettier" },
  };

  Object.keys(allDeps).forEach((dep) => {
    for (const category in depMappings) {
      const cat = category as keyof typeof depMappings;
      const mappings = depMappings[cat];
      if (Object.prototype.hasOwnProperty.call(mappings, dep)) {
        techStack[cat].push(mappings[dep]);
      }
    }
  });

  allFiles.forEach((file) => {
    const p = file.path.toLowerCase();
    if (p.endsWith(".py")) techStack.languages.push("Python");
    if (p.endsWith(".go")) techStack.languages.push("Go");
    if (p.endsWith(".java")) techStack.languages.push("Java");
    if (p.endsWith(".rs")) techStack.languages.push("Rust");
    if (p.endsWith(".php")) techStack.languages.push("PHP");
    if (p.includes("test") || p.includes("spec")) insights.hasTests = true;
    if (p.includes(".github/workflows")) insights.hasCI = true;
    if (
      p.includes("/api/") ||
      p.includes("/routes/") ||
      p.includes("/controllers/")
    )
      insights.hasAPI = true;
    if (
      p.startsWith("packages/") ||
      p.includes("lerna.json") ||
      p.includes("pnpm-workspace.yaml")
    )
      insights.isMonorepo = true;
    if (p.includes("dockerfile")) techStack.deployment.push("Docker");
  });
  techStack.languages = [...new Set(techStack.languages)];
  if (repoData.language && !techStack.languages.includes(repoData.language)) {
    techStack.languages.unshift(repoData.language);
  }

  if (insights.isMonorepo) insights.architecture = "Monorepo";
  else if (techStack.frameworks.includes("Next.js"))
    insights.architecture = "Full-stack Framework (Next.js)";
  else if (
    techStack.frameworks.some((f) =>
      ["Express", "NestJS", "Fastify", "Laravel"].includes(f)
    )
  )
    insights.architecture = "Backend Service / API";
  else if (
    techStack.frameworks.some((f) =>
      ["React", "Vue", "SvelteKit", "Angular"].includes(f)
    )
  )
    insights.architecture = "Single Page Application (SPA)";

  const fileTree = formatFileTree(allFiles.map((f) => f.path).slice(0, 150));
  const packageManager = detectPackageManager(allFiles.map((f) => f.path));

  console.log(`✅ Analisis untuk ${repoName} selesai.`);
  return {
    repoData,
    techStack,
    insights,
    packageManager,
    fileTree,
    keyFileContents,
  };
}

function formatFileTree(paths: string[]): string {
  const tree: FileTreeNode = {};
  paths.forEach((path) => {
    let currentLevel = tree;
    path.split("/").forEach((part) => {
      if (!currentLevel[part]) currentLevel[part] = {};
      currentLevel = currentLevel[part];
    });
  });

  const generateTree = (node: FileTreeNode, prefix = ""): string => {
    let result = "";
    const entries = Object.keys(node);
    entries.forEach((entry, i) => {
      const isLast = i === entries.length - 1;
      const connector = isLast ? "└── " : "├── ";
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      result += `${prefix}${connector}${entry}\n`;
      if (Object.keys(node[entry]).length > 0) {
        result += generateTree(node[entry], newPrefix);
      }
    });
    return result;
  };
  return "/\n" + generateTree(tree);
}

function detectPackageManager(filePaths: string[]): Record<string, string> {
  if (filePaths.some((p) => p.endsWith("yarn.lock")))
    return { name: "Yarn", install: "yarn install", dev: "yarn dev" };
  if (filePaths.some((p) => p.endsWith("pnpm-lock.yaml")))
    return { name: "PNPM", install: "pnpm install", dev: "pnpm dev" };
  if (filePaths.some((p) => p.endsWith("bun.lockb")))
    return { name: "Bun", install: "bun install", dev: "bun dev" };
  return { name: "NPM", install: "npm install", dev: "npm run dev" };
}

async function generateContentWithRetry(
  prompt: string
): Promise<GenerateContentResult> {
  let attempt = 0;
  while (attempt < 3) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (error: unknown) {
      attempt++;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("503") && attempt < 3) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.warn(
          `Model AI overload. Mencoba lagi dalam ${Math.round(
            delay / 1000
          )} detik...`
        );
        await new Promise((res) => setTimeout(res, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Model AI gagal merespons setelah beberapa kali percobaan.");
}

export async function POST(request: Request) {
  try {
    const { prompt: userDirective } = await request.json();
    if (!userDirective) {
      return NextResponse.json({ error: "Prompt dibutuhkan" }, { status: 400 });
    }

    const repoName = extractRepoName(userDirective);
    if (!repoName) {
      return NextResponse.json(
        { error: "Format repo tidak valid atau tidak ditemukan." },
        { status: 400 }
      );
    }

    const GITHUB_API_HEADERS = {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      "User-Agent": "Readme-Generator-App",
    };

    const cacheKey = `analysis_v8_${repoName}`;
    let analysis: AnalysisResult;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`✅ Menyajikan analisis untuk ${repoName} dari cache.`);
      analysis = cached.data;
    } else {
      analysis = await comprehensiveProjectAnalysis(
        repoName,
        GITHUB_API_HEADERS
      );
      cache.set(cacheKey, { data: analysis, timestamp: Date.now() });
    }

    const formattedTitle = formatRepoNameToTitle(analysis.repoData.name);

    console.log("🤖 Membuat prompt tunggal dan efisien untuk AI penulis...");

    const finalPrompt = `
      Anda adalah "Genesis," seorang penulis teknis AI kelas dunia dan arsitek perangkat lunak senior. Misi Anda adalah membuat file README.md yang menakjubkan, berwawasan, dan komprehensif berdasarkan analisis terstruktur dari repositori GitHub yang disediakan di bawah ini.

      **Tujuan Utama:** Hasilkan file README.md yang lengkap dan siap pakai dalam format Markdown.

      **Aturan Format & Gaya Wajib:**
      1.  **Judul:** Mulailah dengan judul H1: "# ✨ ${formattedTitle}".
      2.  **Lencana (Badges):** Segera setelah judul, buat baris lencana dari shields.io yang relevan untuk teknologi terpenting yang teridentifikasi (misalnya, bahasa, kerangka kerja utama, linter).
      3.  **Deskripsi Proyek:** Gunakan blockquote Markdown (\`>\`) untuk deskripsi proyek. Jika deskripsi "N/A", buat ringkasan satu kalimat yang ringkas berdasarkan nama repositori dan tumpukan teknologi.
      4.  **Header Bagian:** Semua header H2 HARUS diawali dengan emoji deskriptif. Gunakan yang berikut:
          - \`✨ Fitur Utama\`
          - \`🛠️ Tumpukan Teknologi\`
          - \`🏛️ Tinjauan Arsitektur\`
          - \`🚀 Memulai\`
          - \`📂 Struktur File\`
      5.  **Bagian Fitur Utama:**
          - Ini adalah bagian yang paling penting. JANGAN hanya mendaftar file.
          - **Anda WAJIB mensintesis dan menyimpulkan fitur tingkat tinggi** dari nama file, tumpukan teknologi, dan konten file kunci.
          - Contoh: Jika Anda melihat 'src/routes/auth/jwt.ts' dan 'prisma/schema.prisma', Anda HARUS menyimpulkan fitur seperti "**Otentikasi JWT yang Aman:** Mengelola pendaftaran pengguna, login, dan rute yang dilindungi menggunakan JSON Web Tokens."
          - Sajikan fitur sebagai daftar berpoin. Gunakan format tebal untuk nama fitur.
      6.  **Bagian Tumpukan Teknologi:**
          - Buat tabel menggunakan sintaks tabel Markdown standar.
          - Tabel harus memiliki tiga kolom: 'Kategori', 'Teknologi', dan 'Catatan'.
          - Isi tabel ini secara logis berdasarkan data tumpukan teknologi yang disediakan.
      7.  **Bagian Memulai:**
          - Berikan langkah-langkah penyiapan yang jelas dan bernomor.
          - Sertakan kloning repositori, instalasi dependensi (menggunakan perintah manajer paket yang terdeteksi), dan menjalankan server pengembangan.
          - Semua perintah harus ada di dalam blok kode \`\`\`bash.
      8.  **Bagian Struktur File:**
          - Sertakan pohon file ASCII yang disediakan di dalam blok kode \`\`\` tanpa penentu bahasa.
          - Tambahkan penjelasan singkat tingkat tinggi tentang direktori utama (misalnya, 'src', 'packages', 'public').

      **DATA ANALISIS MENTAH (Gunakan ini untuk membangun README):**
      <analysis>
        <repo_info>
          <name>${analysis.repoData.full_name}</name>
          <description>${analysis.repoData.description || "N/A"}</description>
          <language>${analysis.repoData.language || "N/A"}</language>
          <stars>${analysis.repoData.stargazers_count}</stars>
        </repo_info>
        <tech_stack>
          ${Object.entries(analysis.techStack)
            .filter(([, v]) => v.length > 0)
            .map(([k, v]) => `<${k}>${(v as string[]).join(", ")}</${k}>`)
            .join("\n")}
        </tech_stack>
        <insights>
          ${Object.entries(analysis.insights)
            .map(([k, v]) => `<${k}>${v}</${k}>`)
            .join("\n")}
        </insights>
        <getting_started>
          <package_manager>${analysis.packageManager.name}</package_manager>
          <install_command>${analysis.packageManager.install}</install_command>
          <run_command>${analysis.packageManager.dev}</run_command>
        </getting_started>
        <file_tree>
        ${analysis.fileTree}
        </file_tree>
        <key_file_contents>
        ${JSON.stringify(analysis.keyFileContents)}
        </key_file_contents>
      </analysis>
      
      Sekarang, hasilkan file README.md yang lengkap.
    `;

    console.log("✍️ Menjalankan generator AI dengan satu panggilan efisien...");
    const writerResult = await generateContentWithRetry(finalPrompt);
    const aiMarkdown = writerResult.response.text();

    return NextResponse.json({ markdown: aiMarkdown });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan yang tidak terduga.";
    console.error("❌ Gagal pada handler utama:", error);

    if (
      errorMessage.includes("429") ||
      errorMessage.toLowerCase().includes("quota")
    ) {
      return NextResponse.json(
        {
          error:
            "Kuota permintaan harian ke AI telah terlampaui. Silakan coba lagi besok atau tingkatkan paket Anda.",
        },
        { status: 429 }
      );
    }
    if (
      errorMessage.includes("503") ||
      errorMessage.toLowerCase().includes("overloaded")
    ) {
      return NextResponse.json(
        { error: "Model AI sedang sibuk. Silakan coba beberapa saat lagi." },
        { status: 503 }
      );
    }
    if (errorMessage.toLowerCase().includes("repo tidak ditemukan")) {
      return NextResponse.json(
        {
          error:
            "Repositori tidak ditemukan. Pastikan nama sudah benar dan repositori bersifat publik.",
        },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
