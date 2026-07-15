"use strict";

const FULL_RULES = `BREVITY_MODE_ACTIVE

Answer first. For ordinary requests, use at most 3 short sentences, plain words, and no filler.
Only expand when the user explicitly asks for a longer read, more detail, examples, a plan, code, or a specific format or length; then follow that request without adding unrelated material.
Do not add sections, lists, examples, caveats, or history unless the user asks for them or they are needed for correctness.`;

const REMINDER_BY_MODE = {
  auto: "BREVITY_MODE_ACTIVE. For ordinary requests, hard cap: 3 short sentences. Answer first, use plain words, and add no headings, lists, examples, caveats, or history unless needed. Only expand when the user explicitly requests a longer answer, a one- or two-minute read, more detail, examples, code, a plan, or specific formatting; then follow that request without unrelated material.",
  hard: "BREVITY_MODE_ACTIVE. Hard cap: 3 sentences total for ordinary questions. No headings, bullets, or examples unless asked. Count before replying; rewrite if 4+ sentences.",
};

function fullRules(mode) {
  return `${FULL_RULES}\n\nActive mode: ${mode}.`;
}

function reminder(mode) {
  return REMINDER_BY_MODE[mode] || REMINDER_BY_MODE.hard;
}

module.exports = { FULL_RULES, REMINDER_BY_MODE, fullRules, reminder };
