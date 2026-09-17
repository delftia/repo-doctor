import * as path from "node:path";
import { Check } from "../types/index.js";

const junkNames = new Set([".ds_store", "thumbs.db", "desktop.ini"]);

export const junkFilesCheck: Check = {
  name: "Junk files",
  category: "Git hygiene",
  async run(context) {
    const source = context.isGitRepository ? context.trackedFiles : context.files;
    const junk = source.filter((file) => {
      const name = path.basename(file).toLowerCase();
      return junkNames.has(name) || /\.(?:log|tmp|swp)$/i.test(name);
    });

    if (junk.length === 0) return { name: this.name, category: this.category, findings: [], passed: 1 };
    return {
      name: this.name,
      category: this.category,
      passed: 0,
      findings: junk.slice(0, 30).map((file) => ({
        check: this.name,
        category: this.category,
        severity: "warning" as const,
        message: "Junk/generated file is tracked",
        file,
        suggestion: "Remove it from Git and add an appropriate .gitignore rule."
      }))
    };
  }
};
