"use strict";

const FULL_RULES = `BREVITY_MODE_ACTIVE

Answer first. Default to the shortest useful answer, using plain words and no filler.
When the user explicitly asks for a longer read, more detail, examples, a plan, code, or a specific format or length, follow that request rather than forcing brevity.
Do not add sections, lists, examples, caveats, or history unless the user asks for them or they are needed for correctness.`;

const REMINDER_BY_MODE = {
  auto: "BREVITY_MODE_ACTIVE. Default to the shortest useful answer: answer first, use plain words, and avoid filler. If the user explicitly requests a longer answer, a one- or two-minute read, more detail, examples, code, a plan, or specific formatting, follow that request fully instead of forcing brevity.",
  hard: "BREVITY_MODE_ACTIVE. Hard cap: 3 sentences total for ordinary questions. No headings, bullets, or examples unless asked. Count before replying; rewrite if 4+ sentences.",
};

function fullRules(mode) {
  return `${FULL_RULES}\n\nActive mode: ${mode}.`;
}

function reminder(mode) {
  return REMINDER_BY_MODE[mode] || REMINDER_BY_MODE.hard;
}

module.exports = { FULL_RULES, REMINDER_BY_MODE, fullRules, reminder };
