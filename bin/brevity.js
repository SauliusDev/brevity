#!/usr/bin/env node
"use strict";

const path = require("path");
const { defaultMode, normalizeMode, removeFlag, writeFlag } = require("../src/lib/config");
const {
  doctor,
  installClaude,
  installCodex,
  uninstallClaude,
  uninstallCodex,
} = require("../src/lib/install");

const root = path.resolve(__dirname, "..");
const command = process.argv[2] || "help";
const target = process.argv[3] || "all";

function includes(name) {
  return target === "all" || target === name;
}

function printResult(action, host, result) {
  process.stdout.write(`${action} ${host}: ${result.changed ? "changed" : "already ok"} ${result.file}\n`);
  if (host === "codex" && result.needsTrust) {
    process.stdout.write("codex trust: pending. Open Codex once, run /hooks, and trust the Brevity UserPromptSubmit hook.\n");
  }
}

if (command === "install") {
  if (includes("claude")) printResult("install", "claude", installClaude(root));
  if (includes("codex")) printResult("install", "codex", installCodex(root));
} else if (command === "uninstall") {
  if (includes("claude")) printResult("uninstall", "claude", uninstallClaude());
  if (includes("codex")) printResult("uninstall", "codex", uninstallCodex());
} else if (command === "doctor") {
  const result = doctor(root);
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
} else if (command === "mode") {
  const host = process.argv[3] || "claude";
  const requested = process.argv[4] || defaultMode();
  const mode = ["stop", "disable", "off"].includes(String(requested).trim().toLowerCase())
    ? "off"
    : normalizeMode(requested) || defaultMode();
  if (mode === "off") {
    removeFlag(host);
    process.stdout.write("Brevity mode disabled.\n");
  } else {
    writeFlag(host, mode);
    process.stdout.write(`Brevity mode set to ${mode}.\n`);
  }
} else {
  process.stdout.write(`Usage:
  brevity install [all|claude|codex]
  brevity uninstall [all|claude|codex]
  brevity mode [claude|codex] [auto|hard|off]
  brevity doctor

Modes:
  /brevity auto
  /brevity hard
  /brevity off

Codex note:
  After install, open Codex once and run /hooks to trust the new hook.
  For noninteractive smoke tests only, use codex exec --dangerously-bypass-hook-trust.
`);
}
