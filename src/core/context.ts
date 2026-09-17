import * as fs from "node:fs";
import * as path from "node:path";
import { RepositoryContext, RepoDoctorConfig } from "../types/index.js";
import { getTrackedFiles, isGitRepository } from "../utils/git.js";
import { readJson, walkFiles } from "../utils/files.js";

const DEFAULT_CONFIG: RepoDoctorConfig = {
  minScore: 75,
  maxFileSizeMb: 20,
  ignore: []
};

export function createContext(inputPath: string): RepositoryContext {
  const root = path.resolve(inputPath);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    throw new Error(`Directory not found: ${root}`);
  }

  const userConfig = readJson<Partial<RepoDoctorConfig>>(root, ".repo-doctor.json") ?? {};
  const config: RepoDoctorConfig = {
    ...DEFAULT_CONFIG,
    ...userConfig,
    ignore: Array.isArray(userConfig.ignore) ? userConfig.ignore : []
  };

  const git = isGitRepository(root);
  const files = walkFiles(root, config.ignore);
  const trackedFiles = git ? getTrackedFiles(root) : files;
  const packageJson = readJson<Record<string, any>>(root, "package.json") ?? undefined;

  return { root, files, trackedFiles, isGitRepository: git, config, packageJson };
}
