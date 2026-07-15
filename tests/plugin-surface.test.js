"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

test("Claude slash command surface exists for Brevity", () => {
  const commandPath = path.join(root, "commands", "brevity.md");
  const command = fs.readFileSync(commandPath, "utf8");

  assert.match(command, /^---/);
  assert.match(command, /description:/);
  assert.match(command, /\/brevity auto\|hard\|off/);
});

test("Claude plugin declares skill discovery path", () => {
  const manifestPath = path.join(root, ".claude-plugin", "plugin.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  assert.equal(manifest.skills, "./skills/");
});

test("Claude marketplace manifest exposes Brevity plugin", () => {
  const marketplacePath = path.join(root, ".claude-plugin", "marketplace.json");
  const marketplace = JSON.parse(fs.readFileSync(marketplacePath, "utf8"));

  assert.equal(marketplace.name, "brevity");
  assert.equal(marketplace.plugins[0].name, "brevity");
  assert.equal(marketplace.plugins[0].source, "./");
});

test("Codex skill metadata exists for $brevity discovery", () => {
  const metadataPath = path.join(root, "skills", "brevity", "agents", "openai.yaml");
  const metadata = fs.readFileSync(metadataPath, "utf8");

  assert.match(metadata, /display_name: "Brevity"/);
  assert.match(metadata, /\$brevity/);
});
