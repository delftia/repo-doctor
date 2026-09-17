import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const cli = path.join(root, "dist", "cli.js");

test("prints version", () => {
  const output = execFileSync(process.execPath, [cli, "--version"], { encoding: "utf8" }).trim();
  assert.equal(output, "1.0.0");
});

test("can scan itself as JSON", () => {
  const output = execFileSync(process.execPath, [cli, root, "--json"], { encoding: "utf8" });
  const report = JSON.parse(output);
  assert.equal(typeof report.score, "number");
  assert.ok(Array.isArray(report.results));
  assert.ok(report.results.length >= 8);
});
