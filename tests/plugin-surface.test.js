"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

test("Claude slash command surface exists for human-short", () => {
  const commandPath = path.join(root, "commands", "human-short.md");
  const command = fs.readFileSync(commandPath, "utf8");

  assert.match(command, /^---/);
  assert.match(command, /description:/);
  assert.match(command, /\/human-short hard\|lite\|explain\|coding\|off/);
});

test("Claude plugin declares skill discovery path", () => {
  const manifestPath = path.join(root, ".claude-plugin", "plugin.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  assert.equal(manifest.skills, "./skills/");
});

test("Claude marketplace manifest exposes human-short plugin", () => {
  const marketplacePath = path.join(root, ".claude-plugin", "marketplace.json");
  const marketplace = JSON.parse(fs.readFileSync(marketplacePath, "utf8"));

  assert.equal(marketplace.name, "human-short");
  assert.equal(marketplace.plugins[0].name, "human-short");
  assert.equal(marketplace.plugins[0].source, "./");
});

test("Codex skill metadata exists for $human-short discovery", () => {
  const metadataPath = path.join(root, "skills", "human-short", "agents", "openai.yaml");
  const metadata = fs.readFileSync(metadataPath, "utf8");

  assert.match(metadata, /display_name: "Human Short"/);
  assert.match(metadata, /\$human-short/);
});
