import { CommandCenterCategory } from "@/types/commandCenter";

export const commandCenterConfigFileHint = "src/data/commandCenterLinks.ts";

export const commandCenterCategories: CommandCenterCategory[] = [
  {
    id: "deploy",
    title: "Deploy & Hosting",
    description: "Rilis, domain, dan environment",
    items: [
      {
        id: "vercel",
        title: "Vercel",
        description: "Deploy frontend + logs",
        type: "external",
        url: "https://vercel.com/dashboard",
        tags: ["deploy", "hosting"],
      },
      {
        id: "github",
        title: "GitHub",
        description: "Repo, PR, Actions",
        type: "external",
        url: "https://github.com",
        tags: ["repo", "ci"],
      },
    ],
  },
  {
    id: "backend",
    title: "Backend",
    description: "Database, auth, functions",
    items: [
      {
        id: "supabase",
        title: "Supabase",
        description: "DB, Auth, Edge Functions",
        type: "external",
        url: "https://supabase.com/dashboard",
        tags: ["db", "auth"],
      },
    ],
  },
  {
    id: "product",
    title: "Produk & Dokumen",
    description: "Dokumentasi, to-do, dan aset",
    items: [
      {
        id: "notion",
        title: "Notion",
        description: "PRD, catatan, SOP",
        type: "external",
        url: "https://www.notion.so",
        tags: ["docs"],
      },
      {
        id: "figma",
        title: "Figma",
        description: "Desain dan prototyping",
        type: "external",
        url: "https://www.figma.com",
        tags: ["design"],
      },
    ],
  },
  {
    id: "internal",
    title: "Internal",
    description: "Shortcut ke fitur dalam aplikasi",
    items: [
      {
        id: "ai-studio-home",
        title: "AI Studio",
        description: "Kembali ke dashboard utama",
        type: "internal",
        url: "/",
        tags: ["internal"],
      },
      {
        id: "taskflow",
        title: "TaskFlow",
        description: "Tools eksternal (Lovable)",
        type: "external",
        url: "https://ebranxmels.lovable.app",
        tags: ["workflow"],
      },
    ],
  },
];

