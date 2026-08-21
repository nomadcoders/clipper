import { spawnSync } from "node:child_process";

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(
  command,
  [
    "wrangler",
    "d1",
    "migrations",
    "apply",
    "DB",
    "--local",
    "--config",
    "wrangler.jsonc",
  ],
  { cwd: process.cwd(), stdio: "inherit" },
);

if (result.error) throw result.error;
process.exit(result.status ?? 1);
