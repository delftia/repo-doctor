import { AuditReport, Category, CheckResult, Finding } from "../types/index.js";

const PENALTY = { info: 0, warning: 3, error: 9, critical: 20 } as const;
const categories: Category[] = ["Security", "Documentation", "Git hygiene", "Dependencies", "CI/CD", "Project"];

export function buildReport(root: string, results: CheckResult[]): AuditReport {
  const findings = results.flatMap((result) => result.findings);
  const counts = {
    info: findings.filter((f) => f.severity === "info").length,
    warning: findings.filter((f) => f.severity === "warning").length,
    error: findings.filter((f) => f.severity === "error").length,
    critical: findings.filter((f) => f.severity === "critical").length
  };

  const score = Math.max(0, 100 - findings.reduce((sum, finding) => sum + PENALTY[finding.severity], 0));
  const categoryScores = Object.fromEntries(categories.map((category) => {
    const categoryFindings = findings.filter((finding) => finding.category === category);
    const value = Math.max(0, 100 - categoryFindings.reduce((sum, finding) => sum + PENALTY[finding.severity], 0));
    return [category, value];
  })) as Record<Category, number>;

  const grade = score >= 90 ? "Excellent" : score >= 80 ? "Good" : score >= 70 ? "Fair" : score >= 50 ? "Poor" : "Critical";
  return {
    root,
    score,
    grade,
    categoryScores,
    results,
    findings,
    passed: results.reduce((sum, result) => sum + result.passed, 0),
    counts,
    generatedAt: new Date().toISOString()
  };
}
