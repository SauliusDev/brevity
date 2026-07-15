"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");

const VALID_MODES = ["off", "auto", "hard"];
const DEFAULT_MODE = "auto";
const MAX_FLAG_BYTES = 64;

function homeDir() {
  return process.env.HOME || os.homedir();
}

function stateDir() {
  return process.env.BREVITY_STATE_DIR || path.join(homeDir(), ".brevity");
}

function configPath() {
  return process.env.BREVITY_CONFIG || path.join(stateDir(), "config.json");
}

function flagPath(host) {
  return path.join(stateDir(), `.${host || "global"}-active`);
}

function logPath() {
  return path.join(stateDir(), "logs", "brevity.jsonl");
}

function normalizeMode(mode) {
  const value = String(mode || "").trim().toLowerCase();
  return VALID_MODES.includes(value) ? value : null;
}

function defaultMode() {
  const envMode = normalizeMode(process.env.BREVITY_MODE);
  if (envMode) return envMode;

  try {
    const parsed = JSON.parse(fs.readFileSync(configPath(), "utf8"));
    const configured = normalizeMode(parsed.defaultMode);
    if (configured) return configured;
  } catch (_) {
    // Missing config is normal.
  }

  return DEFAULT_MODE;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
}

function safeWriteFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  const tempPath = path.join(path.dirname(filePath), `.${path.basename(filePath)}.${process.pid}.${Date.now()}`);
  fs.writeFileSync(tempPath, String(content), { mode: 0o600 });
  fs.renameSync(tempPath, filePath);
}

function writeFlag(host, mode) {
  const normalized = normalizeMode(mode) || DEFAULT_MODE;
  safeWriteFile(flagPath(host), normalized);
}

function removeFlag(host) {
  try {
    fs.unlinkSync(flagPath(host));
  } catch (_) {
    // Already inactive.
  }
}

function readFlag(host) {
  try {
    const file = flagPath(host);
    const stat = fs.lstatSync(file);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_FLAG_BYTES) return null;
    return normalizeMode(fs.readFileSync(file, "utf8"));
  } catch (_) {
    return null;
  }
}

function activeMode(host) {
  return readFlag(host) || defaultMode();
}

function appendLog(entry) {
  try {
    const file = logPath();
    ensureDir(path.dirname(file));
    const record = {
      ts: new Date().toISOString(),
      ...entry,
    };
    fs.appendFileSync(file, JSON.stringify(record) + "\n", { mode: 0o600 });
  } catch (_) {
    // Logging must never break hooks.
  }
}

module.exports = {
  VALID_MODES,
  DEFAULT_MODE,
  stateDir,
  configPath,
  flagPath,
  logPath,
  normalizeMode,
  defaultMode,
  safeWriteFile,
  writeFlag,
  removeFlag,
  readFlag,
  activeMode,
  appendLog,
};
