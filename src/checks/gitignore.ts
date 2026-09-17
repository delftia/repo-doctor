import { Check } from "../types/index.js";
import { readText } from "../utils/files.js";

export const gitignoreCheck: Check = {
  name: ".gitignore",
  category: "Git hygiene",
  async run(context) {
    const text = readText(context.root, ".gitignore");
    if (text === null) {
      return {
        name: this.name, category: this.category, passed: 0,
        findings: [{ check: this.name, category: this.category, severity: "error", message: ".gitignore is missing", suggestion: "Create .gitignore before committing generated files or secrets." }]
      };
    }

    const required = [".env", "*.log"];
    if (context.packageJson) required.push("node_modules");
    if (context.files.some((f) => f.endsWith(".py"))) required.push("__pycache__");
    const normalized = text.split(/\r?\n/).map((line) => line.trim().replace(/\/$/, ""));
    const findings = [];
    let passed = 1;

    for (const item of required) {
      const exists = normalized.some((line) => line === item || (item === ".env" && /^\.env(?:\.\*)?$/.test(line)));
      if (exists) passed += 1;
      else findings.push({ check: this.name, category: this.category, severity: "warning" as const, message: `${item} is not ignored`, file: ".gitignore" });
    }

    return { name: this.name, category: this.category, findings, passed };
  }
};
