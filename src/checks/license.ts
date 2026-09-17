import { Check } from "../types/index.js";
import { readText } from "../utils/files.js";

export const licenseCheck: Check = {
  name: "License",
  category: "Documentation",
  async run(context) {
    const file = context.files.find((f) => /^license(?:\.md|\.txt)?$/i.test(f));
    if (!file) {
      return {
        name: this.name, category: this.category, passed: 0,
        findings: [{ check: this.name, category: this.category, severity: "warning", message: "LICENSE file is missing", suggestion: "Add a license if the repository is intended for public use." }]
      };
    }

    const text = (readText(context.root, file) ?? "").toLowerCase();
    let detected = "Unknown";
    if (text.includes("mit license")) detected = "MIT";
    else if (text.includes("apache license")) detected = "Apache-2.0";
    else if (text.includes("gnu general public license")) detected = "GPL";
    else if (text.includes("redistribution and use in source and binary forms")) detected = "BSD";

    return {
      name: this.name,
      category: this.category,
      passed: 1,
      findings: detected === "Unknown" ? [{ check: this.name, category: this.category, severity: "info", message: "License exists but its type was not recognized", file }] : []
    };
  }
};
