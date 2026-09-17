import * as fs from "node:fs";
import * as path from "node:path";
import { Check } from "../types/index.js";
import { getFileSize, isProbablyTextFile } from "../utils/files.js";

const patterns: Array<{ name: string; regex: RegExp }> = [
  { name: "OpenAI API key", regex: /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g },
  { name: "GitHub token", regex: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b/g },
  { name: "GitHub fine-grained token", regex: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g },
  { name: "AWS access key", regex: /\bAKIA[0-9A-Z]{16}\b/g },
  { name: "Private key", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { name: "Credential-bearing database URL", regex: /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s:/]+:[^\s@/]+@[^\s]+/gi }
];

export const secretsCheck: Check = {
  name: "Secret scan",
  category: "Security",
  async run(context) {
    const candidates = (context.isGitRepository ? context.trackedFiles : context.files)
      .filter(isProbablyTextFile)
      .filter((file) => getFileSize(context.root, file) <= 2 * 1024 * 1024);

    const findings = [];
    let scanned = 0;
    for (const file of candidates) {
      let text: string;
      try { text = fs.readFileSync(path.join(context.root, file), "utf8"); } catch { continue; }
      scanned += 1;
      for (const pattern of patterns) {
        pattern.regex.lastIndex = 0;
        if (pattern.regex.test(text)) {
          findings.push({
            check: this.name,
            category: this.category,
            severity: "critical" as const,
            message: `Possible ${pattern.name} detected`,
            file,
            suggestion: "Revoke/rotate the credential if it is real, remove it from the repository and use environment variables."
          });
        }
      }
    }

    return { name: this.name, category: this.category, findings, passed: Math.max(1, scanned - findings.length) };
  }
};
