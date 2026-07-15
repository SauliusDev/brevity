"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

function freshConfig(tempDir) {
  process.env.BREVITY_STATE_DIR = tempDir;
  delete require.cache[require.resolve("../src/lib/config")];
  return require("../src/lib/config");
}

test("writes and reads a validated mode flag", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "human-short-config-"));
  const config = freshConfig(dir);

  config.writeFlag("codex", "auto");

  assert.equal(config.readFlag("codex"), "auto");
  assert.equal(config.activeMode("codex"), "auto");
});

test("defaults to auto when no mode is configured", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "human-short-config-"));
  const config = freshConfig(dir);

  assert.equal(config.defaultMode(), "auto");
});

test("rejects invalid and oversized flag content", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "human-short-config-"));
  const config = freshConfig(dir);

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(config.flagPath("claude"), "x".repeat(80));

  assert.equal(config.readFlag("claude"), null);
});
