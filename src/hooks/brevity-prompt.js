#!/usr/bin/env node
"use strict";

const { activeMode, appendLog, defaultMode, removeFlag, writeFlag } = require("../lib/config");
const { commandMode, readHookInput } = require("../lib/prompt");
const { reminder } = require("../lib/rules");

const host = process.env.BREVITY_HOST || (process.env.CLAUDE_CONFIG_DIR ? "claude" : "codex");

let input = "";
process.stdin.on("data", chunk => {
  input += chunk;
});

process.stdin.on("end", () => {
  try {
    const data = readHookInput(input);
    const prompt = data.prompt || "";
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

    const additionalContext = reminder(mode || defaultMode());
    appendLog({ event: "prompt.injected", status: "ok", host, mode });
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext,
      },
    }));
  } catch (error) {
    appendLog({ event: "prompt.failed", status: "error", host, error: error.message });
  }
});
