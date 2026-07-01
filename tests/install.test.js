"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

function tempHome() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "human-short-install-"));
}

function freshInstall(tempState) {
  process.env.HUMAN_SHORT_STATE_DIR = tempState;
  delete require.cache[require.resolve("../src/lib/install")];
  delete require.cache[require.resolve("../src/lib/config")];
  return require("../src/lib/install");
}

test("installs and uninstalls Claude hooks without removing existing hooks", () => {
  const root = path.resolve(__dirname, "..");
  const temp = tempHome();
  const state = path.join(temp, "state");
  const claudeDir = path.join(temp, ".claude");
  fs.mkdirSync(claudeDir, { recursive: true });
  fs.writeFileSync(path.join(claudeDir, "settings.json"), JSON.stringify({
    hooks: {
      UserPromptSubmit: [{ hooks: [{ type: "command", command: "existing" }] }],
    },
  }, null, 2));

  const install = freshInstall(state);
  const installed = install.installClaude(root, claudeDir);
  assert.equal(installed.changed, true);

  const afterInstall = JSON.parse(fs.readFileSync(path.join(claudeDir, "settings.json"), "utf8"));
  assert.match(JSON.stringify(afterInstall), /human-short-managed/);
  assert.match(JSON.stringify(afterInstall), /existing/);
  assert.match(fs.readFileSync(path.join(claudeDir, "commands", "human-short.md"), "utf8"), /human-short-managed/);
  assert.match(fs.readFileSync(path.join(claudeDir, "commands", "human-short.md"), "utf8"), /mode claude/);

  const removed = install.uninstallClaude(claudeDir);
  assert.equal(removed.changed, true);

  const afterRemove = JSON.parse(fs.readFileSync(path.join(claudeDir, "settings.json"), "utf8"));
  assert.doesNotMatch(JSON.stringify(afterRemove), /human-short-managed/);
  assert.match(JSON.stringify(afterRemove), /existing/);
  assert.equal(fs.existsSync(path.join(claudeDir, "commands", "human-short.md")), false);
});

test("installs Codex prompt hook idempotently", () => {
  const root = path.resolve(__dirname, "..");
  const temp = tempHome();
  const state = path.join(temp, "state");
  const codexDir = path.join(temp, ".codex");
  fs.mkdirSync(codexDir, { recursive: true });
  fs.writeFileSync(path.join(codexDir, "hooks.json"), JSON.stringify({ hooks: {} }, null, 2));

  const install = freshInstall(state);
  assert.equal(install.installCodex(root, codexDir).changed, true);
  assert.equal(install.installCodex(root, codexDir).changed, false);

  const config = JSON.parse(fs.readFileSync(path.join(codexDir, "hooks.json"), "utf8"));
  const serialized = JSON.stringify(config);
  assert.equal((serialized.match(/human-short-managed/g) || []).length, 1);
});

test("doctor reports installed state and pending Codex trust", () => {
  const root = path.resolve(__dirname, "..");
  const temp = tempHome();
  const state = path.join(temp, "state");
  const previousHome = process.env.HOME;
  process.env.HOME = temp;
  try {
    const install = freshInstall(state);

    install.installClaude(root, path.join(temp, ".claude"));
    install.installCodex(root, path.join(temp, ".codex"));

    const result = install.doctor(root);
    assert.equal(result.claudeInstalled, true);
    assert.equal(result.codexInstalled, true);
    assert.equal(result.codexNeedsTrust, true);
  } finally {
    process.env.HOME = previousHome;
  }
});
