import { Check } from "../types/index.js";
import { getFileSize } from "../utils/files.js";

export const largeFilesCheck: Check = {
  name: "Large files",
  category: "Git hygiene",
  async run(context) {
    const maxBytes = context.config.maxFileSizeMb * 1024 * 1024;
    const source = context.isGitRepository ? context.trackedFiles : context.files;
    const large = source
      .map((file) => ({ file, size: getFileSize(context.root, file) }))
      .filter((item) => item.size > maxBytes)
      .sort((a, b) => b.size - a.size);

    if (large.length === 0) return { name: this.name, category: this.category, findings: [], passed: 1 };
    return {
      name: this.name,
      category: this.category,
      passed: 0,
      findings: large.slice(0, 20).map(({ file, size }) => ({
        check: this.name,
        category: this.category,
        severity: "warning" as const,
        message: `Large tracked file: ${(size / 1024 / 1024).toFixed(1)} MB`,
        file,
        suggestion: "Consider Git LFS, external storage, compression, or excluding generated assets."
      }))
    };
  }
};
