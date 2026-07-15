"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const { commandMode } = require("../src/lib/prompt");

test("detects slash mode changes", () => {
  assert.equal(commandMode("/brevity auto"), "auto");
  assert.equal(commandMode("/brevity off"), "off");
});

test("detects Codex skill-style mode changes", () => {
  assert.equal(commandMode("$brevity hard"), "hard");
  assert.equal(commandMode("$brevity disable"), "off");
});

test("detects plugin-namespaced Claude command mode changes", () => {
  assert.equal(commandMode("/brevity:brevity auto"), "auto");
  assert.equal(commandMode("/brevity:brevity off"), "off");
});

test("detects natural language activation and deactivation", () => {
  assert.equal(commandMode("please enable brevity mode"), "auto");
  assert.equal(commandMode("turn off brevity"), "off");
});

test("detects simple brevity requests", () => {
  assert.equal(commandMode("keep it short please"), "auto");
});
