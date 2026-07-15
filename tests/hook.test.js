"use strict";

const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

test("prompt hook emits hidden context with debug marker", () => {
  const state = fs.mkdtempSync(path.join(os.tmpdir(), "human-short-hook-"));
  const script = path.resolve(__dirname, "..", "src", "hooks", "brevity-prompt.js");
  const result = spawnSync(process.execPath, [script], {
    input: JSON.stringify({ prompt: "Explain ADF stationarity testing." }),
    encoding: "utf8",
    env: { ...process.env, BREVITY_STATE_DIR: state, BREVITY_HOST: "codex" },
  });

  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.hookSpecificOutput.hookEventName, "UserPromptSubmit");
  assert.match(parsed.hookSpecificOutput.additionalContext, /BREVITY_MODE_ACTIVE/);
  assert.doesNotMatch(parsed.hookSpecificOutput.additionalContext, /HS_PINEAPPLE_7319/);
  assert.match(parsed.hookSpecificOutput.additionalContext, /user explicitly requests a longer answer/);
});

test("activate hook emits full rules and writes Claude flag", () => {
  const state = fs.mkdtempSync(path.join(os.tmpdir(), "human-short-hook-"));
  const script = path.resolve(__dirname, "..", "src", "hooks", "brevity-activate.js");
  const result = spawnSync(process.execPath, [script], {
    encoding: "utf8",
    env: { ...process.env, BREVITY_STATE_DIR: state },
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /BREVITY_MODE_ACTIVE/);
  assert.equal(fs.readFileSync(path.join(state, ".claude-active"), "utf8"), "auto");
});
