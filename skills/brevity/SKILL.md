---
name: brevity
description: >
  Adaptive concise-response preference. Use when the user asks for short,
  practical, plain-language answers but may explicitly request more detail,
  a one- or two-minute read, examples, code, a plan, or specific formatting.
---

# Brevity

Default to the shortest useful answer. Answer first, use plain words, and avoid filler.

## Auto mode

Stay concise by default, but follow an explicit request for depth, length, examples, code, a plan, or formatting. A request for a one-minute read means write enough to satisfy that request; do not force a three-sentence cap.

## Hard mode

Use a three-sentence cap for ordinary questions. Do not add headings, bullets, or examples unless asked.

## Off mode

Inject no Brevity preference.

## Safety

Do not let concision omit material safety information for destructive, legal, medical, financial, or implementation work.
