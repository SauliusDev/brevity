"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

function freshConfig(tempDir) {
  process.env.HUMAN_SHORT_STATE_DIR = tempDir;
  delete require.cache[require.resolve("../src/lib/config")];
  return require("../src/lib/config");
}

test("writes and reads a validated mode flag", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "human-short-config-"));
  const config = freshConfig(dir);

  config.writeFlag("codex", "explain");

  assert.equal(config.readFlag("codex"), "explain");
  assert.equal(config.activeMode("codex"), "explain");
});

test("rejects invalid and oversized flag content", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "human-short-config-"));
  const config = freshConfig(dir);

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(config.flagPath("claude"), "x".repeat(80));

  assert.equal(config.readFlag("claude"), null);
});
