#!/usr/bin/env bun
// Refuses any credit to an AI assistant in a commit message, a pull
// request's title or body, or a branch name (7IBO/socle, rule 1). Runs in
// the commit-msg hook (lefthook.yml) and in CI. Human `Co-authored-by`
// trailers stay allowed: only those naming an assistant are refused.
//
//   bun scripts/check-attribution.ts <file>          a commit message or a body
//   bun scripts/check-attribution.ts --text "…"      a title
//   bun scripts/check-attribution.ts --branch "…"    a branch name
import { readFileSync } from 'node:fs';

const ATTRIBUTION: readonly RegExp[] = [
  /^(co-authored-by|assisted-by|generated-by|signed-off-by):.*(claude|anthropic|copilot|chatgpt|openai|gemini|cursor)/im,
  /^[a-z-]+-by:.*noreply@anthropic\.com/im,
  /^claude-session:/im,
  /generated (with|by) \[claude code\]\(https?:\/\/claude/i,
  /claude\.ai\/code\/session_/i,
];

export function checkAttribution(text: string): string[] {
  return ATTRIBUTION.some((rule) => rule.test(text))
    ? ['it credits an AI assistant: no attribution, anywhere (7IBO/socle, rule 1)']
    : [];
}

export function checkBranch(branch: string): string[] {
  return /^claude\//i.test(branch)
    ? [`"${branch}" starts with claude/: name it after its Linear issue`]
    : [];
}

if (import.meta.main) {
  const [flag, value] = process.argv.slice(2);
  const problems = flag === '--branch'
    ? checkBranch(value ?? '')
    : flag === '--text'
    ? checkAttribution(value ?? '')
    : flag
    ? checkAttribution(readFileSync(flag, 'utf8'))
    : ['usage: check-attribution.ts <file> | --text <text> | --branch <name>'];
  if (problems.length > 0) {
    for (const problem of problems) process.stderr.write(`✗ ${problem}\n`);
    process.exit(1);
  }
}
