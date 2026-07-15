"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const { reminder } = require("../src/lib/rules");

test("auto keeps ordinary replies within three sentences", () => {
  assert.match(reminder("auto"), /3 short sentences/i);
});

test("auto expands only for an explicit depth, length, or format request", () => {
  const text = reminder("auto");
  assert.match(text, /one- or two-minute read/i);
  assert.match(text, /more detail/i);
  assert.match(text, /specific formatting/i);
});
