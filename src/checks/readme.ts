import { Check, CheckResult } from "../types/index.js";
import { readText } from "../utils/files.js";

export const readmeCheck: Check = {
  name: "README",
  category: "Documentation",
  async run(context): Promise<CheckResult> {
    const readme = context.files.find((f) => /^readme(?:\.md|\.txt)?$/i.test(f));
    if (!readme) {
      return {
        name: this.name,
        category: this.category,
        passed: 0,
        findings: [{
          check: this.name,
          category: this.category,
          severity: "error",
          message: "README file is missing",
          suggestion: "Add README.md with a description, installation and usage instructions."
        }]
      };
    }

    const text = readText(context.root, readme) ?? "";
    const sections = [
      { label: "installation section", regex: /^#{1,6}\s+(installation|install|setup|getting started)\b/im },
      { label: "usage section", regex: /^#{1,6}\s+(usage|examples?|quick start)\b/im }
    ];
    const findings = [];
    let passed = 1;
    for (const section of sections) {
      if (section.regex.test(text)) passed += 1;
      else findings.push({
        check: this.name,
        category: this.category,
        severity: "warning" as const,
        message: `README has no ${section.label}`,
        file: readme
      });
    }

    if (text.trim().length < 200) {
      findings.push({
        check: this.name,
        category: this.category,
        severity: "warning" as const,
        message: "README is very short",
        file: readme,
        suggestion: "Explain what the project does and include a minimal example."
      });
    } else {
      passed += 1;
    }

    return { name: this.name, category: this.category, findings, passed };
  }
};
