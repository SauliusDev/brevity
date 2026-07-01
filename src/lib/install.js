"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { appendLog } = require("./config");

const MARKER = "human-short-managed";

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true, mode: 0o700 });
  if (fs.existsSync(filePath)) {
    const backup = `${filePath}.human-short-backup-${Date.now()}`;
    fs.copyFileSync(filePath, backup);
    appendLog({ event: "install.backup", status: "ok", file: filePath, backup });
  }
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", { mode: 0o600 });
}

function writeText(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true, mode: 0o700 });
  if (fs.existsSync(filePath)) {
    const previous = fs.readFileSync(filePath, "utf8");
    if (previous === content) return false;
    if (!previous.includes(MARKER)) return false;
    const backup = `${filePath}.human-short-backup-${Date.now()}`;
    fs.copyFileSync(filePath, backup);
    appendLog({ event: "install.backup", status: "ok", file: filePath, backup });
  }
  fs.writeFileSync(filePath, content, { mode: 0o600 });
  return true;
}

function commandFor(root, script, host) {
  return `HUMAN_SHORT_HOST=${host} node "${path.join(root, "src", "hooks", script)}" # ${MARKER}`;
}

function claudeSlashCommand(root) {
  const cli = path.join(root, "bin", "human-short.js");
  return `---
description: Switch Human Short mode (hard/lite/explain/coding/off)
allowed-tools: Bash(node:*)
---

<!-- ${MARKER} -->

!\`node "${cli}" mode claude "$ARGUMENTS"\`

Reply with exactly the mode status printed above and nothing else.
`;
}

function managedHook(command) {
  return {
    type: "command",
    command,
    timeout: 5,
    statusMessage: "Applying human-short mode...",
  };
}

function appendHook(config, eventName, hook) {
  config.hooks ||= {};
  config.hooks[eventName] ||= [];
  const alreadyInstalled = config.hooks[eventName].some(group =>
    Array.isArray(group.hooks) && group.hooks.some(existing => String(existing.command || "").includes(MARKER))
  );
  if (alreadyInstalled) return false;
  config.hooks[eventName].push({ hooks: [hook] });
  return true;
}

function removeManagedHooks(config) {
  let changed = false;
  if (!config.hooks) return false;

  for (const [eventName, groups] of Object.entries(config.hooks)) {
    if (!Array.isArray(groups)) continue;
    const nextGroups = groups
      .map(group => {
        const hooks = Array.isArray(group.hooks) ? group.hooks.filter(hook => !String(hook.command || "").includes(MARKER)) : [];
        if (hooks.length !== (group.hooks || []).length) changed = true;
        return { ...group, hooks };
      })
      .filter(group => group.hooks.length > 0);
    if (nextGroups.length !== groups.length) changed = true;
    config.hooks[eventName] = nextGroups;
  }

  return changed;
}

function installClaude(root, claudeDir = path.join(os.homedir(), ".claude")) {
  const settingsPath = path.join(claudeDir, "settings.json");
  const commandPath = path.join(claudeDir, "commands", "human-short.md");
  const settings = readJson(settingsPath, {});
  const startChanged = appendHook(settings, "SessionStart", {
    ...managedHook(commandFor(root, "human-short-activate.js", "claude")),
    statusMessage: "Loading human-short mode...",
  });
  const promptChanged = appendHook(settings, "UserPromptSubmit", managedHook(commandFor(root, "human-short-prompt.js", "claude")));
  const commandChanged = writeText(commandPath, claudeSlashCommand(root));
  if (startChanged || promptChanged) writeJson(settingsPath, settings);
  appendLog({ event: "install.claude", status: "ok", changed: startChanged || promptChanged || commandChanged, file: settingsPath, commandFile: commandPath });
  return { file: settingsPath, commandFile: commandPath, changed: startChanged || promptChanged || commandChanged };
}

function installCodex(root, codexDir = path.join(os.homedir(), ".codex")) {
  const hooksPath = path.join(codexDir, "hooks.json");
  const config = readJson(hooksPath, { hooks: {} });
  const changed = appendHook(config, "UserPromptSubmit", managedHook(commandFor(root, "human-short-prompt.js", "codex")));
  if (changed) writeJson(hooksPath, config);
  appendLog({ event: "install.codex", status: "ok", changed, file: hooksPath });
  return { file: hooksPath, changed, needsTrust: !hasCodexTrustState(hooksPath) };
}

function uninstallClaude(claudeDir = path.join(os.homedir(), ".claude")) {
  const settingsPath = path.join(claudeDir, "settings.json");
  const commandPath = path.join(claudeDir, "commands", "human-short.md");
  const settings = readJson(settingsPath, {});
  const hooksChanged = removeManagedHooks(settings);
  let commandChanged = false;
  try {
    const command = fs.readFileSync(commandPath, "utf8");
    if (command.includes(MARKER)) {
      fs.unlinkSync(commandPath);
      commandChanged = true;
    }
  } catch (_) {
    // Missing command is already uninstalled.
  }
  if (hooksChanged) writeJson(settingsPath, settings);
  appendLog({ event: "uninstall.claude", status: "ok", changed: hooksChanged || commandChanged, file: settingsPath, commandFile: commandPath });
  return { file: settingsPath, commandFile: commandPath, changed: hooksChanged || commandChanged };
}

function uninstallCodex(codexDir = path.join(os.homedir(), ".codex")) {
  const hooksPath = path.join(codexDir, "hooks.json");
  const config = readJson(hooksPath, { hooks: {} });
  const changed = removeManagedHooks(config);
  if (changed) writeJson(hooksPath, config);
  appendLog({ event: "uninstall.codex", status: "ok", changed, file: hooksPath });
  return { file: hooksPath, changed };
}

function hasCodexTrustState(hooksPath, codexDir = path.join(os.homedir(), ".codex")) {
  try {
    const configToml = fs.readFileSync(path.join(codexDir, "config.toml"), "utf8");
    return configToml.includes(`${hooksPath}:user_prompt_submit:1:0`) && configToml.includes("trusted_hash");
  } catch (_) {
    return false;
  }
}

function doctor(root) {
  const claudeSettings = path.join(os.homedir(), ".claude", "settings.json");
  const codexHooks = path.join(os.homedir(), ".codex", "hooks.json");
  const claudeInstalled = fs.existsSync(claudeSettings) && fs.readFileSync(claudeSettings, "utf8").includes(MARKER);
  const codexInstalled = fs.existsSync(codexHooks) && fs.readFileSync(codexHooks, "utf8").includes(MARKER);
  return {
    root,
    claudeInstalled,
    codexInstalled,
    codexNeedsTrust: codexInstalled && !hasCodexTrustState(codexHooks),
  };
}

module.exports = {
  MARKER,
  readJson,
  appendHook,
  removeManagedHooks,
  installClaude,
  installCodex,
  uninstallClaude,
  uninstallCodex,
  hasCodexTrustState,
  doctor,
};
