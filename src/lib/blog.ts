import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { AUTHOR_NAME } from "@/lib/site";

// Entradas del blog: archivos .md en src/content/blog con una cabecera simple entre líneas "---".
// Los borradores (draft: true) no se publican; con BLOG_DRAFTS=1 se ven en local para revisarlos.
export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string; // AAAA-MM-DD
  updated: string;
  author: string;
  tags: string[];
  draft: boolean;
  body: string;
};

const DIR = path.join(process.cwd(), "src/content/blog");
export const AUTHOR = AUTHOR_NAME;

function parse(file: string): Post {
  const raw = readFileSync(path.join(DIR, file), "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`Blog post without front matter: ${file}`);
  const meta: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"|"$/g, "");
  }
  for (const k of ["title", "description", "date"]) if (!meta[k]) throw new Error(`Blog post ${file} is missing "${k}"`);
  return {
    slug: file.replace(/\.md$/, ""),
    title: meta.title,
    description: meta.description,
    date: meta.date,
    updated: meta.updated || meta.date,
    author: meta.author || AUTHOR,
    tags: (meta.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean),
    draft: meta.draft === "true",
    body: m[2].trim(),
  };
}

export function getPosts(): Post[] {
  let files: string[] = [];
  try {
    files = readdirSync(DIR).filter((f) => f.endsWith(".md"));
  } catch {}
  return files
    .map(parse)
    .filter((p) => !p.draft || process.env.BLOG_DRAFTS === "1")
    .sort((a, b) => b.date.localeCompare(a.date));
}

export const getPost = (slug: string) => getPosts().find((p) => p.slug === slug);
