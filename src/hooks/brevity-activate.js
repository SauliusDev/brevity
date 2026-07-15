#!/usr/bin/env node
"use strict";

const { appendLog, defaultMode, removeFlag, writeFlag } = require("../lib/config");
const { fullRules } = require("../lib/rules");

try {
  const mode = defaultMode();
  if (mode === "off") {
    removeFlag("claude");
    appendLog({ event: "activate.skipped", status: "ok", host: "claude", mode });
    process.stdout.write("OK");
    process.exit(0);
  }

  writeFlag("claude", mode);
  appendLog({ event: "activate.injected", status: "ok", host: "claude", mode });
  process.stdout.write(fullRules(mode));
} catch (error) {
  appendLog({ event: "activate.failed", status: "error", host: "claude", error: error.message });
  process.stdout.write("OK");
}
