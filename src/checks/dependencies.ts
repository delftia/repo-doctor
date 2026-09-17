import { execFileSync } from "node:child_process";
import { Check } from "../types/index.js";

export const dependenciesCheck: Check = {
  name: "Dependencies",
  category: "Dependencies",
  async run(context) {
    if (!context.packageJson) {
      return { name: this.name, category: this.category, passed: 0, skipped: true, note: "Not a Node.js project", findings: [] };
    }

    const findings = [];
    let passed = 0;
    const hasLock = context.files.some((f) => ["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lock", "bun.lockb"].includes(f));
    if (hasLock) passed += 1;
    else findings.push({ check: this.name, category: this.category, severity: "warning" as const, message: "No dependency lockfile detected", suggestion: "Commit a lockfile for reproducible installs." });

    try {
      const raw = execFileSync("npm", ["outdated", "--json"], {
        cwd: context.root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
        timeout: 12000
      });
      const data = raw.trim() ? JSON.parse(raw) : {};
      const names = Object.keys(data);
      if (names.length === 0) passed += 1;
      else findings.push({
        check: this.name,
        category: this.category,
        severity: names.length >= 10 ? "warning" as const : "info" as const,
        message: `${names.length} outdated ${names.length === 1 ? "dependency" : "dependencies"} detected`,
        suggestion: `Run npm outdated to review: ${names.slice(0, 8).join(", ")}${names.length > 8 ? "…" : ""}`
      });
    } catch (error: any) {
      // npm outdated exits with code 1 when outdated packages exist; stdout may still contain valid JSON.
      const stdout = typeof error?.stdout === "string" ? error.stdout.trim() : "";
      if (stdout) {
        try {
          const data = JSON.parse(stdout);
          const names = Object.keys(data);
          if (names.length > 0) {
            findings.push({ check: this.name, category: this.category, severity: names.length >= 10 ? "warning" as const : "info" as const, message: `${names.length} outdated ${names.length === 1 ? "dependency" : "dependencies"} detected`, suggestion: `Run npm outdated to review: ${names.slice(0, 8).join(", ")}${names.length > 8 ? "…" : ""}` });
          } else passed += 1;
        } catch {
          findings.push({ check: this.name, category: this.category, severity: "info" as const, message: "Could not query npm registry for outdated dependencies" });
        }
      } else {
        findings.push({ check: this.name, category: this.category, severity: "info" as const, message: "Could not query npm registry for outdated dependencies" });
      }
    }

    return { name: this.name, category: this.category, findings, passed };
  }
};
