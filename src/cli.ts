#!/usr/bin/env node
import * as fs from "node:fs";
import * as path from "node:path";
import { createContext } from "./core/context.js";
import { scanRepository } from "./core/scanner.js";
import { printJson } from "./reporters/json.js";
import { printReport } from "./reporters/terminal.js";

interface CliOptions {
  target: string;
  json: boolean;
  summary: boolean;
  security: boolean;
  ci: boolean;
  minScore?: number;
}

function help(): void {
  console.log(`Repo Doctor — audit a Git repository\n\nUsage:\n  repo-doctor [path] [options]\n  repo-doctor scan [path] [options]\n  repo-doctor init [path]\n\nOptions:\n  --summary            Print only scores and issue counts\n  --json               Output machine-readable JSON\n  --security           Run security checks only\n  --ci                 Exit with code 1 when score is below threshold\n  --min-score <0-100>  Override minimum CI score\n  -h, --help           Show help\n  -v, --version        Show version\n\nExamples:\n  repo-doctor .\n  repo-doctor . --security\n  repo-doctor . --json\n  repo-doctor . --ci --min-score 80`);
}

function version(): void {
  console.log("1.0.0");
}

function parseArgs(argv: string[]): CliOptions | { command: "init"; target: string } | { command: "help" } | { command: "version" } {
  const args = [...argv];
  if (args.includes("-h") || args.includes("--help")) return { command: "help" };
  if (args.includes("-v") || args.includes("--version")) return { command: "version" };

  let command = "scan";
  if (args[0] === "scan" || args[0] === "init") command = args.shift()!;

  let target = ".";
  if (args[0] && !args[0].startsWith("-")) target = args.shift()!;
  if (command === "init") return { command: "init", target };

  let minScore: number | undefined;
  const minIndex = args.indexOf("--min-score");
  if (minIndex >= 0) {
    const raw = args[minIndex + 1];
    minScore = Number(raw);
    if (!Number.isFinite(minScore) || minScore < 0 || minScore > 100) throw new Error("--min-score must be a number from 0 to 100");
  }

  return {
    target,
    json: args.includes("--json"),
    summary: args.includes("--summary"),
    security: args.includes("--security"),
    ci: args.includes("--ci"),
    minScore
  };
}

function initConfig(target: string): void {
  const root = path.resolve(target);
  const destination = path.join(root, ".repo-doctor.json");
  if (!fs.existsSync(root)) throw new Error(`Directory not found: ${root}`);
  if (fs.existsSync(destination)) throw new Error(`Config already exists: ${destination}`);
  fs.writeFileSync(destination, JSON.stringify({ minScore: 75, maxFileSizeMb: 20, ignore: [] }, null, 2) + "\n");
  console.log(`Created ${destination}`);
}

async function main(): Promise<void> {
  try {
    const parsed = parseArgs(process.argv.slice(2));
    if ("command" in parsed) {
      if (parsed.command === "help") return help();
      if (parsed.command === "version") return version();
      if (parsed.command === "init") return initConfig(parsed.target);
    }

    const context = createContext(parsed.target);
    const report = await scanRepository(context, { securityOnly: parsed.security });
    if (parsed.json) printJson(report);
    else printReport(report, parsed.summary);

    if (parsed.ci) {
      const threshold = parsed.minScore ?? context.config.minScore;
      if (report.score < threshold || report.counts.critical > 0) process.exitCode = 1;
    }
  } catch (error: any) {
    console.error(`Repo Doctor error: ${error?.message ?? String(error)}`);
    process.exitCode = 2;
  }
}

await main();
