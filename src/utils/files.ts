import * as fs from "node:fs";
import * as path from "node:path";

const ALWAYS_SKIP = new Set([".git", "node_modules", ".next", ".nuxt", ".cache"]);

export function toPosix(value: string): string {
  return value.split(path.sep).join("/");
}

export function fileExists(root: string, relative: string): boolean {
  return fs.existsSync(path.join(root, relative));
}

export function readText(root: string, relative: string): string | null {
  try {
    return fs.readFileSync(path.join(root, relative), "utf8");
  } catch {
    return null;
  }
}

export function readJson<T = any>(root: string, relative: string): T | null {
  const text = readText(root, relative);
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export function walkFiles(root: string, ignores: string[] = []): string[] {
  const output: string[] = [];
  const ignored = ignores.map(normalizePattern);

  function visit(current: string): void {
    let entries: any[];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (ALWAYS_SKIP.has(entry.name)) continue;
      const absolute = path.join(current, entry.name);
      const relative = toPosix(path.relative(root, absolute));
      if (matchesAny(relative, ignored)) continue;
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile()) output.push(relative);
    }
  }

  visit(root);
  return output.sort();
}

function normalizePattern(pattern: string): RegExp {
  const escaped = toPosix(pattern)
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "§§DOUBLESTAR§§")
    .replace(/\*/g, "[^/]*")
    .replace(/§§DOUBLESTAR§§/g, ".*");
  return new RegExp(`^${escaped}$`);
}

function matchesAny(relative: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(relative));
}

export function isProbablyTextFile(file: string): boolean {
  const ext = path.extname(file).toLowerCase();
  const name = path.basename(file).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".pdf", ".zip", ".gz", ".7z", ".rar", ".mp4", ".mov", ".avi", ".mp3", ".wav", ".woff", ".woff2", ".ttf", ".eot", ".exe", ".dll", ".so", ".dylib", ".db", ".sqlite"].includes(ext)) return false;
  return !name.endsWith(".lock") || name === "package-lock.json";
}

export function getFileSize(root: string, relative: string): number {
  try {
    return fs.statSync(path.join(root, relative)).size;
  } catch {
    return 0;
  }
}
