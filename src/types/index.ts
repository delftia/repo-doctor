export type Severity = "info" | "warning" | "error" | "critical";
export type Category = "Security" | "Documentation" | "Git hygiene" | "Dependencies" | "CI/CD" | "Project";

export interface Finding {
  check: string;
  category: Category;
  severity: Severity;
  message: string;
  file?: string;
  suggestion?: string;
}

export interface CheckResult {
  name: string;
  category: Category;
  findings: Finding[];
  passed: number;
  skipped?: boolean;
  note?: string;
}

export interface RepoDoctorConfig {
  minScore: number;
  maxFileSizeMb: number;
  ignore: string[];
}

export interface RepositoryContext {
  root: string;
  files: string[];
  trackedFiles: string[];
  isGitRepository: boolean;
  config: RepoDoctorConfig;
  packageJson?: Record<string, any>;
}

export interface AuditReport {
  root: string;
  score: number;
  grade: "Excellent" | "Good" | "Fair" | "Poor" | "Critical";
  categoryScores: Record<Category, number>;
  results: CheckResult[];
  findings: Finding[];
  passed: number;
  counts: Record<Severity, number>;
  generatedAt: string;
}

export interface Check {
  name: string;
  category: Category;
  run(context: RepositoryContext): Promise<CheckResult>;
}
