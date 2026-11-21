import fs from "node:fs";
import path from "node:path";
import { Marked, type Tokens } from "marked";

// Blog articles are markdown files in content/blog/<slug>.md, read at build time (no database).
// Each file starts with YAML-style front matter. Values are plain text, or JSON-style
// quoted strings / arrays, e.g.  title: "..."  and  tags: ["a", "b"].

const DIR = path.join(process.cwd(), "content", "blog");
const REQUIRED = ["title", "slug", "description", "category", "author", "published", "updated", "factsChecked"] as const;
const ISO = /^\d{4}-\d{2}-\d{2}$/;

export type Post = {
  slug: string;
  title: string;
  description: string;
  category: string;
  author: string;
  /** YYYY-MM-DD */
  published: string;
  /** YYYY-MM-DD */
  updated: string;
  /** Free text, e.g. "2026-11-18 to 2026-11-20" */
  factsChecked: string;
  tags: string[];
  readingMinutes: number;
  /** Article HTML before the "Sources" section */
  bodyHtml: string;
  /** The "## Sources ..." section and anything after it (rendered in its own box), or "" */
  sourcesHtml: string;
};

function parseFrontMatter(raw: string, file: string) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) throw new Error(`Blog: ${file} has no front matter`);
  const data: Record<string, unknown> = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const i = line.indexOf(":");
    if (i < 1) throw new Error(`Blog: ${file}: bad front matter line "${line}"`);
    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim();
    data[key] = /^["[]/.test(value) ? JSON.parse(value) : value;
  }
  return { data, content: raw.slice(m[0].length) };
}

function escapeAttr(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

// External links open in a new tab (and say so to screen readers); tables get a scroll wrapper
// that keyboard users can focus, so wide tables scroll sideways on phones instead of the page.
const marked = new Marked({
  gfm: true,
  renderer: {
    link(this: { parser: { parseInline: (t: Tokens.Link["tokens"]) => string } }, { href, title, tokens }: Tokens.Link) {
      const text = this.parser.parseInline(tokens);
      const external = /^https?:\/\//i.test(href);
      const t = title ? ` title="${escapeAttr(title)}"` : "";
      return external
        ? `<a href="${escapeAttr(href)}"${t} target="_blank" rel="noopener noreferrer">${text}<span class="sr-only"> (opens in a new tab)</span></a>`
        : `<a href="${escapeAttr(href)}"${t}>${text}</a>`;
    },
  },
});

function render(md: string) {
  const html = marked.parse(md, { async: false }) as string;
  return html
    .replace(/<table>/g, '<div class="tableWrap" role="region" aria-label="Table (scrolls sideways)" tabindex="0"><table>')
    .replace(/<\/table>/g, "</table></div>");
}

function load(file: string): Post {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
  const { data, content } = parseFrontMatter(raw, file);
  for (const k of REQUIRED) {
    if (typeof data[k] !== "string" || !(data[k] as string).trim()) throw new Error(`Blog: ${file} is missing "${k}"`);
  }
  for (const k of ["published", "updated"] as const) {
    if (!ISO.test(data[k] as string)) throw new Error(`Blog: ${file}: "${k}" must be YYYY-MM-DD`);
  }
  if (`${data.slug}.md` !== file) throw new Error(`Blog: ${file}: slug "${data.slug}" must match the file name`);

  // The sources section gets its own box at the end
  const at = content.search(/^## Sources\b/m);
  const body = at === -1 ? content : content.slice(0, at);
  const sources = at === -1 ? "" : content.slice(at);
  const words = content.replace(/[#>*_`|[\]()-]/g, " ").split(/\s+/).filter(Boolean).length;

  return {
    slug: data.slug as string,
    title: data.title as string,
    description: data.description as string,
    category: data.category as string,
    author: data.author as string,
    published: data.published as string,
    updated: data.updated as string,
    factsChecked: data.factsChecked as string,
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    readingMinutes: Math.max(1, Math.ceil(words / 200)),
    bodyHtml: render(body),
    sourcesHtml: sources ? render(sources) : "",
  };
}

let cache: Post[] | null = null;

/** All articles, newest first (by updated date, then published date) */
export function allPosts(): Post[] {
  if (!cache) {
    const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => f.endsWith(".md")) : [];
    cache = files
      .map(load)
      .sort((a, b) => b.updated.localeCompare(a.updated) || b.published.localeCompare(a.published));
  }
  return cache;
}

export function getPost(slug: string) {
  return allPosts().find((p) => p.slug === slug) ?? null;
}
