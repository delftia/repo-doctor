import { AuditReport } from "../types/index.js";

export function printJson(report: AuditReport): void {
  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
}
