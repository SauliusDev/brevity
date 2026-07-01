"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const { commandMode } = require("../src/lib/prompt");

test("detects slash mode changes", () => {
  assert.equal(commandMode("/human-short explain"), "explain");
  assert.equal(commandMode("/human-short off"), "off");
});

test("detects Codex skill-style mode changes", () => {
  assert.equal(commandMode("$human-short coding"), "coding");
  assert.equal(commandMode("$human-short disable"), "off");
});

test("detects plugin-namespaced Claude command mode changes", () => {
  assert.equal(commandMode("/human-short:human-short lite"), "lite");
  assert.equal(commandMode("/human-short:human-short off"), "off");
});

test("detects natural language activation and deactivation", () => {
  assert.equal(commandMode("please enable human-short mode"), "hard");
  assert.equal(commandMode("turn off human-short"), "off");
});

test("detects simple brevity requests", () => {
  assert.equal(commandMode("keep it short please"), "hard");
});
