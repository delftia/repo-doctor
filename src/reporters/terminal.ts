import * as path from "node:path";
import { AuditReport, Finding, Severity } from "../types/index.js";

const useColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
const code = (n: number, text: string) => useColor ? `\u001b[${n}m${text}\u001b[0m` : text;
const bold = (text: string) => code(1, text);
const dim = (text: string) => code(2, text);
const green = (text: string) => code(32, text);
const yellow = (text: string) => code(33, text);
const red = (text: string) => code(31, text);
const magenta = (text: string) => code(35, text);
const cyan = (text: string) => code(36, text);

function severityLabel(severity: Severity): string {
  const labels: Record<Severity, string> = {
    info: cyan("INFO"),
    warning: yellow("WARN"),
    error: red("ERROR"),
    critical: magenta("CRITICAL")
  };
  return labels[severity];
}

function scoreColor(score: number, value: string): string {
  if (score >= 90) return green(value);
  if (score >= 70) return yellow(value);
  return red(value);
}

function bar(score: number): string {
  const filled = Math.round(score / 10);
  return `${"█".repeat(filled)}${"░".repeat(10 - filled)}`;
}

function printFinding(finding: Finding): void {
  const where = finding.file ? ` ${dim(finding.file)}` : "";
  console.log(`  ${severityLabel(finding.severity).padEnd(useColor ? 20 : 10)} ${finding.message}${where}`);
  if (finding.suggestion) console.log(`             ${dim("↳ " + finding.suggestion)}`);
}

export function printReport(report: AuditReport, summaryOnly = false): void {
  console.log();
  console.log(bold("🩺 Repo Doctor"));
  console.log(dim(`Repository: ${path.basename(report.root)} (${report.root})`));
  console.log();

  if (!summaryOnly) {
    for (const result of report.results) {
      const status = result.skipped ? dim("SKIP") : result.findings.some((f) => f.severity === "critical" || f.severity === "error") ? red("ISSUES") : result.findings.length ? yellow("WARN") : green("PASS");
      console.log(`${status.padEnd(useColor ? 18 : 8)} ${bold(result.name)}${result.note ? dim(` — ${result.note}`) : ""}`);
      for (const finding of result.findings) printFinding(finding);
    }
    console.log();
  }

  console.log(bold("Category scores"));
  for (const [category, score] of Object.entries(report.categoryScores)) {
    console.log(`  ${category.padEnd(15)} ${scoreColor(score, bar(score))} ${String(score).padStart(3)}/100`);
  }

  console.log();
  console.log(bold("Overall"));
  console.log(`  ${scoreColor(report.score, bar(report.score))} ${scoreColor(report.score, `${report.score}/100 ${report.grade}`)}`);
  console.log();
  console.log(`  ${green(`${report.passed} passed`)}  ${magenta(`${report.counts.critical} critical`)}  ${red(`${report.counts.error} errors`)}  ${yellow(`${report.counts.warning} warnings`)}  ${cyan(`${report.counts.info} info`)}`);
  console.log();
}
