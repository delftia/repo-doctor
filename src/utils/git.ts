import { execFileSync } from "node:child_process";

export function runGit(root: string, args: string[]): string | null {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 8000
    }).trim();
  } catch {
    return null;
  }
}

export function isGitRepository(root: string): boolean {
  return runGit(root, ["rev-parse", "--is-inside-work-tree"]) === "true";
}

export function getTrackedFiles(root: string): string[] {
  const output = runGit(root, ["ls-files"]);
  if (!output) return [];
  return output.split(/\r?\n/).filter(Boolean);
}
