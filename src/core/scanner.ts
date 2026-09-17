import { allChecks } from "../checks/index.js";
import { buildReport } from "./score.js";
import { RepositoryContext, AuditReport } from "../types/index.js";

export interface ScanOptions {
  securityOnly?: boolean;
}

export async function scanRepository(context: RepositoryContext, options: ScanOptions = {}): Promise<AuditReport> {
  const checks = options.securityOnly
    ? allChecks.filter((check) => check.category === "Security")
    : allChecks;

  const results = [];
  for (const check of checks) {
    results.push(await check.run(context));
  }
  return buildReport(context.root, results);
}
