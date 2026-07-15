#!/usr/bin/env node
"use strict";

// Brevity prompt hook for Hermes Agent.
//
// Wired to Hermes' `pre_llm_call` shell hook. Hermes passes the user's
// message in `extra.user_message` and expects `{"context": "..."}` on
// stdout (injected into the current turn's user message). This differs
// from the Claude/Codex `UserPromptSubmit` contract, so it needs its own
// thin adapter — but it reuses the exact same config/rules libs, so mode
// switches (/brevity auto|hard|off) and the shared flag store behave
// identically. Mode is tracked under host "hermes" (.hermes-active),
// independent of the claude/codex flags.

const { activeMode, appendLog, defaultMode, removeFlag, writeFlag } = require("../lib/config");
const { commandMode } = require("../lib/prompt");
const { reminder } = require("../lib/rules");

const host = "hermes";

let input = "";
process.stdin.on("data", chunk => {
  input += chunk;
});

process.stdin.on("end", () => {
  try {
    let data = {};
    try {
      data = input.trim() ? JSON.parse(input) : {};
    } catch {
      data = {};
    }
    const extra = data.extra || {};
    const prompt = extra.user_message || data.user_message || data.prompt || "";

    const requestedMode = commandMode(prompt);

    if (requestedMode === "off") {
      removeFlag(host);
      appendLog({ event: "prompt.deactivated", status: "ok", host });
      return;
    }

    if (requestedMode) {
      writeFlag(host, requestedMode);
      appendLog({ event: "prompt.mode_set", status: "ok", host, mode: requestedMode });
    }

    const mode = activeMode(host);
    if (mode === "off") {
      appendLog({ event: "prompt.skipped", status: "ok", host, mode });
      return;
    }

    const base = reminder(mode || defaultMode());
    // Hermes injects context into the USER message (never the system prompt),
    // so keep the preference explicit without overriding a user's requested depth.
    const context =
      "[BREVITY PREFERENCE]\n" +
      base +
      "\nHonor an explicit user request for length, detail, or formatting.";
    appendLog({ event: "prompt.injected", status: "ok", host, mode });
    process.stdout.write(JSON.stringify({ context }));
  } catch (error) {
    appendLog({ event: "prompt.failed", status: "error", host, error: error.message });
  }
});
