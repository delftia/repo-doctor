// Minimal Node.js declarations keep the source build lightweight and avoid
// requiring runtime dependencies. The CLI itself only uses built-in modules.
declare var process: any;
declare module "node:fs" { const value: any; export = value; }
declare module "node:path" { const value: any; export = value; }
declare module "node:child_process" { export const execFileSync: any; }
