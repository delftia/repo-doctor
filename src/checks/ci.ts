import { Check } from "../types/index.js";

export const ciCheck: Check = {
  name: "CI/CD",
  category: "CI/CD",
  async run(context) {
    const providers: string[] = [];
    if (context.files.some((f) => f.startsWith(".github/workflows/") && /\.ya?ml$/i.test(f))) providers.push("GitHub Actions");
    if (context.files.includes(".gitlab-ci.yml")) providers.push("GitLab CI");
    if (context.files.includes("Jenkinsfile")) providers.push("Jenkins");
    if (context.files.some((f) => f.startsWith(".circleci/"))) providers.push("CircleCI");

    if (providers.length > 0) return { name: this.name, category: this.category, findings: [], passed: providers.length };
    return {
      name: this.name,
      category: this.category,
      passed: 0,
      findings: [{ check: this.name, category: this.category, severity: "warning", message: "No CI/CD configuration detected", suggestion: "Add a workflow that builds/tests the project on push and pull requests." }]
    };
  }
};
