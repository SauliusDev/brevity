"use strict";

const { defaultMode, normalizeMode } = require("./config");

function commandMode(prompt) {
  const text = String(prompt || "").trim().toLowerCase();
  const match = text.match(/^(?:\/|\$)brevity(?::brevity)?(?:\s+(\S+))?/);
  if (match) {
    const arg = match[1] || defaultMode();
    if (["stop", "disable", "off"].includes(arg)) return "off";
    return normalizeMode(arg);
  }

  if (/\b(stop|disable|turn off)\b.*\bbrevity\b/.test(text)) return "off";
  if (/\bbrevity\b.*\b(stop|disable|turn off)\b/.test(text)) return "off";
  if (/\bnormal mode\b/.test(text) && /\bbrevity\b/.test(text)) return "off";

  if (/\b(enable|activate|turn on|start|use)\b.*\bbrevity\b/.test(text)) return defaultMode();
  if (/\bbrevity\b.*\b(enable|activate|turn on|start|mode)\b/.test(text)) return defaultMode();
  if (/\b(short answer|keep it short|be brief|brief mode)\b/.test(text)) return defaultMode();

  return null;
}

function readHookInput(stdin) {
  if (!stdin.trim()) return {};
  return JSON.parse(stdin);
}

module.exports = { commandMode, readHookInput };
