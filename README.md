# Brevity

Brevity is a prompt-hook preference for Claude Code, Codex, and Hermes: answer with the shortest useful response by default, then expand when the user explicitly asks for more.

## Modes

- `auto` (default): a three-sentence cap for ordinary requests; obey explicit requests such as "one-minute read", "give examples", "make a plan", or a required format.
- `hard`: strict three-sentence cap for ordinary questions.
- `off`: no Brevity injection.

## Commands

```text
/brevity auto
/brevity hard
/brevity off
$brevity auto
$brevity hard
$brevity off
```

## Install Claude Code and Codex hooks

```bash
node bin/brevity.js install
node bin/brevity.js doctor
```

The installer manages Claude's `SessionStart` and `UserPromptSubmit` hooks and Codex's `UserPromptSubmit` hook. After installing or changing the Codex hook, open Codex and trust it in `/hooks`.

## Hermes

Add this hook to `~/.hermes/config.yaml`:

```yaml
hooks:
  pre_llm_call:
    - command: /usr/bin/env node /absolute/path/to/brevity/src/hooks/brevity-hermes-prompt.js
      timeout: 10
```

Restart the Hermes gateway or start a fresh session after changing the hook.

## Development

```bash
npm test
```
