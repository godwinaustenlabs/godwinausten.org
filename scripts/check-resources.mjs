#!/usr/bin/env node
/**
 * Guardrail: every binding in wrangler.jsonc must have a row in
 * docs/cloudflare-resources.md, and every registry row must still be bound.
 *
 * This exists because the failure mode it prevents is expensive: a binding
 * added in config but never recorded becomes an orphan resource nobody can
 * explain six months later, and a recorded resource that quietly lost its
 * binding fails only at runtime.
 *
 * Run: npm run check:resources  (part of `npm run ci`)
 */
import { readFileSync } from "node:fs";

const CONFIG = "wrangler.jsonc";
const REGISTRY = "docs/cloudflare-resources.md";

/** Strip comments + trailing commas so JSONC parses as JSON. */
function parseJsonc(text) {
  const withoutComments = text
    .replace(/("(?:\\.|[^"\\])*")|\/\*[\s\S]*?\*\/|\/\/.*$/gm, (m, str) => str ?? "")
    .replace(/,(\s*[}\]])/g, "$1");
  return JSON.parse(withoutComments);
}

function bindingsOf(config) {
  const found = [];
  const push = (name, kind, resource) => found.push({ name, kind, resource });

  if (config.assets?.binding) push(config.assets.binding, "assets", config.assets.directory);
  if (config.ai?.binding) push(config.ai.binding, "ai", "workers-ai");
  if (config.images?.binding) push(config.images.binding, "images", "cloudflare-images");

  for (const s of config.services ?? []) push(s.binding, "service", s.service);
  for (const b of config.r2_buckets ?? []) push(b.binding, "r2", b.bucket_name);
  for (const n of config.kv_namespaces ?? []) push(n.binding, "kv", n.id);
  for (const d of config.d1_databases ?? []) push(d.binding, "d1", d.database_name);
  for (const q of config.queues?.producers ?? []) push(q.binding, "queue", q.queue);
  for (const o of config.durable_objects?.bindings ?? []) push(o.name, "do", o.class_name);

  return found;
}

const config = parseJsonc(readFileSync(CONFIG, "utf8"));
const registry = readFileSync(REGISTRY, "utf8");
const bindings = bindingsOf(config);

// A row is recognised by its binding name appearing in a table cell.
const rowNames = new Set([...registry.matchAll(/^\|\s*`([A-Z0-9_]+)`\s*\|/gm)].map((m) => m[1]));

const errors = [];

for (const { name, kind, resource } of bindings) {
  if (!rowNames.has(name)) {
    errors.push(
      `${CONFIG} binds \`${name}\` (${kind} -> ${resource}) but ${REGISTRY} has no row for it.`,
    );
  }
}

const boundNames = new Set(bindings.map((b) => b.name));
for (const name of rowNames) {
  if (!boundNames.has(name)) {
    errors.push(`${REGISTRY} lists \`${name}\` but ${CONFIG} does not bind it.`);
  }
}

if (config.services?.some((s) => s.service !== config.name)) {
  errors.push(
    `WORKER_SELF_REFERENCE must point at "${config.name}"; OpenNext ISR revalidation breaks otherwise.`,
  );
}

if (errors.length > 0) {
  console.error("\nResource registry is out of sync:\n");
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error(`\nFix ${REGISTRY} (or ${CONFIG}) and re-run.\n`);
  process.exit(1);
}

console.log(`✓ ${bindings.length} binding(s) in ${CONFIG} match ${REGISTRY}`);
