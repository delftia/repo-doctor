import { Check } from "../types/index.js";

export const envTrackedCheck: Check = {
  name: "Tracked environment files",
  category: "Security",
  async run(context) {
    if (!context.isGitRepository) {
      return { name: this.name, category: this.category, passed: 0, skipped: true, note: "Not a Git repository", findings: [] };
    }

    const envFiles = context.trackedFiles.filter((file) => /(^|\/)\.env(?:\..+)?$/i.test(file) && !/\.env\.example$/i.test(file));
    if (envFiles.length === 0) return { name: this.name, category: this.category, findings: [], passed: 1 };

    return {
      name: this.name, category: this.category, passed: 0,
      findings: envFiles.map((file) => ({
        check: this.name,
        category: this.category,
        severity: "critical" as const,
        message: "Environment file is tracked by Git",
        file,
        suggestion: `Remove it from Git history/index and add it to .gitignore.`
      }))
    };
  }
};
