import { Check } from "../types/index.js";

export const packageJsonCheck: Check = {
  name: "package.json",
  category: "Project",
  async run(context) {
    if (!context.packageJson) {
      return { name: this.name, category: this.category, passed: 0, skipped: true, note: "Not a Node.js project", findings: [] };
    }

    const pkg = context.packageJson;
    const findings = [];
    let passed = 0;
    const fields = ["name", "version", "description", "license"];
    for (const field of fields) {
      if (typeof pkg[field] === "string" && pkg[field].trim()) passed += 1;
      else findings.push({ check: this.name, category: this.category, severity: field === "description" ? "warning" as const : "info" as const, message: `package.json is missing ${field}`, file: "package.json" });
    }

    if (pkg.repository) passed += 1;
    else findings.push({ check: this.name, category: this.category, severity: "info" as const, message: "package.json has no repository field", file: "package.json" });

    const scripts = pkg.scripts ?? {};
    if (scripts.test && !/no test specified/i.test(String(scripts.test))) passed += 1;
    else findings.push({ check: this.name, category: this.category, severity: "warning" as const, message: "No useful test script detected", file: "package.json" });

    return { name: this.name, category: this.category, findings, passed };
  }
};
