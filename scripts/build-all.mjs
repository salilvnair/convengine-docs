#!/usr/bin/env node
/**
 * build-all.mjs
 *
 * Builds the Docusaurus site and syncs it to salilvnair.github.io.
 *
 * Steps:
 *   1. Run `docusaurus build`  →  produces /build
 *   2. Copy /build  →  GITHUB_IO_DEST (resolved from .env)
 *
 * Usage (via package.json):
 *   npm run build:sync   — static build + sync to github.io only
 *   npm run build:all    — same as build:sync
 */

import { execSync }                                      from 'child_process';
import { cpSync, rmSync, mkdirSync, existsSync,
         readFileSync }                                  from 'fs';
import { resolve, dirname }                              from 'path';
import { fileURLToPath }                                 from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, '..');

// ── .env loader ───────────────────────────────────────────────────────────────

function loadDotEnv(envPath) {
  if (!existsSync(envPath)) return {};

  const env   = {};
  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;

    const idx = line.indexOf('=');
    if (idx === -1) continue;

    const key   = line.slice(0, idx).trim();
    let   value = line.slice(idx + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

const envFromFile = loadDotEnv(resolve(ROOT, '.env'));
const ENV         = { ...envFromFile, ...process.env };

const GITHUB_IO_REPO_PATH  = ENV.GITHUB_IO_REPO_PATH  || '../../salilvnair.github.io';
const GITHUB_IO_SYNC_SUBDIR = ENV.GITHUB_IO_SYNC_SUBDIR || 'public/framework/convengine';

// Destination inside salilvnair.github.io; configurable via .env.
const GITHUB_IO_DEST = resolve(ROOT, GITHUB_IO_REPO_PATH, GITHUB_IO_SYNC_SUBDIR);

// ── Helpers ───────────────────────────────────────────────────────────────────

function log(msg)  { console.log(`\n\x1b[36m▶\x1b[0m  ${msg}`); }
function ok(msg)   { console.log(`\x1b[32m✔\x1b[0m  ${msg}`); }
function fail(msg) { console.error(`\x1b[31m✖\x1b[0m  ${msg}`); process.exit(1); }

function run(cmd, opts = {}) {
  log(cmd);
  execSync(cmd, { stdio: 'inherit', cwd: ROOT, ...opts });
}

// ── Step 1: Docusaurus build ──────────────────────────────────────────────────

log('Building Docusaurus site…');
run('npm run build');

const buildDir = resolve(ROOT, 'build');
if (!existsSync(buildDir)) {
  fail('Build produced no /build directory. Check your docusaurus.config.js.');
}
ok(`Docusaurus build written to  ${buildDir}`);

// ── Step 2: Sync to github.io ─────────────────────────────────────────────────

log(`Syncing to  ${GITHUB_IO_DEST}…`);

if (!existsSync(resolve(GITHUB_IO_DEST, '..'))) {
  fail(`Parent directory does not exist: ${resolve(GITHUB_IO_DEST, '..')}
  Make sure salilvnair.github.io is cloned alongside this repo.`);
}

// Wipe the target and copy fresh — guarantees no stale files.
if (existsSync(GITHUB_IO_DEST)) {
  rmSync(GITHUB_IO_DEST, { recursive: true, force: true });
}
mkdirSync(GITHUB_IO_DEST, { recursive: true });

cpSync(buildDir, GITHUB_IO_DEST, { recursive: true });
ok(`Synced  →  ${GITHUB_IO_DEST}`);

console.log('\n\x1b[32m✔  build:all complete.\x1b[0m\n');
