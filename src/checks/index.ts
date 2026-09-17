import { Check } from "../types/index.js";
import { readmeCheck } from "./readme.js";
import { licenseCheck } from "./license.js";
import { gitignoreCheck } from "./gitignore.js";
import { envTrackedCheck } from "./env-tracked.js";
import { secretsCheck } from "./secrets.js";
import { packageJsonCheck } from "./package-json.js";
import { dependenciesCheck } from "./dependencies.js";
import { ciCheck } from "./ci.js";
import { largeFilesCheck } from "./large-files.js";
import { junkFilesCheck } from "./junk-files.js";

export const allChecks: Check[] = [
  readmeCheck,
  licenseCheck,
  gitignoreCheck,
  envTrackedCheck,
  secretsCheck,
  packageJsonCheck,
  dependenciesCheck,
  ciCheck,
  largeFilesCheck,
  junkFilesCheck
];
