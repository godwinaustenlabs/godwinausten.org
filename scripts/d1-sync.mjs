#!/usr/bin/env node
/**
 * Local <-> remote D1 synchronisation.
 *
 * INACTIVE: no D1 database is provisioned yet (see docs/cloudflare-resources.md
 * and docs/data-layer.md). This script exists so that when D1 does arrive, the
 * workflow is already decided and nobody invents a one-off `wrangler d1 execute`
 * incantation under deadline pressure.
 *
 * Turning it on:
 *   1. npx wrangler d1 create <name>          (ask for the name first)
 *   2. Add the d1_databases binding to wrangler.jsonc + a registry row
 *   3. Set D1_BINDING / D1_NAME below
 *
 * Commands:
 *   pull    remote -> local: dumps remote and loads it into .wrangler/state
 *   push    local  -> remote: applies pending migrations to remote (never a dump)
 *   studio  opens a local SQL shell against the local database
 *
 * Direction rule: schema flows local -> remote through MIGRATIONS ONLY.
 * Data flows remote -> local. `push` never writes rows, so a local experiment
 * can never clobber production data.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";

const D1_NAME = process.env.D1_NAME ?? null;
const DUMP_DIR = ".d1-dumps";

if (!D1_NAME) {
  console.error(
    [
      "",
      "  No D1 database is configured yet.",
      "",
      "  This project deliberately has no database. If you now need one:",
      "    1. Decide D1 vs Durable Object SQLite — see docs/data-layer.md.",
      "    2. Ask for the name, then: npx wrangler d1 create <name>",
      "    3. Add the binding to wrangler.jsonc and a row to docs/cloudflare-resources.md",
      "    4. Set D1_NAME in .dev.vars (and re-run this script)",
      "",
    ].join("\n"),
  );
  process.exit(1);
}

const run = (args) => {
  const result = spawnSync("npx", ["wrangler", ...args], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

const command = process.argv[2];

switch (command) {
  case "pull": {
    if (!existsSync(DUMP_DIR)) mkdirSync(DUMP_DIR, { recursive: true });
    const file = `${DUMP_DIR}/${D1_NAME}-${new Date().toISOString().slice(0, 10)}.sql`;
    console.log(`→ dumping remote ${D1_NAME} to ${file}`);
    run(["d1", "export", D1_NAME, "--remote", "--output", file]);
    console.log(`→ loading ${file} into the local database`);
    run(["d1", "execute", D1_NAME, "--local", "--file", file]);
    break;
  }

  case "push": {
    console.log(`→ applying pending migrations to remote ${D1_NAME}`);
    run(["d1", "migrations", "list", D1_NAME, "--remote"]);
    run(["d1", "migrations", "apply", D1_NAME, "--remote"]);
    break;
  }

  case "studio": {
    run(["d1", "execute", D1_NAME, "--local", "--command", ".tables"]);
    break;
  }

  default:
    console.error("Usage: node scripts/d1-sync.mjs <pull|push|studio>");
    process.exit(1);
}
