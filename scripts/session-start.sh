#!/usr/bin/env bash
# Session start hook of Claude Code (.claude/settings.json): what each
# session otherwise does by hand before its first commit. Quiet and quick;
# a step that fails leaves the session as it was and says so.
#   - the commit author shared by every repository (7IBO/socle, code/git.md);
#   - the dependencies and the git hooks (`bun install` runs lefthook),
#     when bun.lock changed since the last install;
#   - main fetched, since a fresh clone's local main can be weeks old.
cd "$(dirname "$0")/.." || exit 0

git config user.name 7IBO
git config user.email 71017357+7IBO@users.noreply.github.com

# A stamp written after an install that finished: an install cut short
# (the hook's time limit) leaves none, and the next session installs again.
stamp=node_modules/.session-install
if command -v bun >/dev/null 2>&1; then
  if [ ! -f "$stamp" ] || [ bun.lock -nt "$stamp" ]; then
    rm -f "$stamp"
    if bun install --frozen-lockfile >/dev/null 2>&1; then
      touch "$stamp"
    else
      echo "session start: bun install failed, run it by hand"
    fi
  fi
fi

git -c http.lowSpeedLimit=1000 -c http.lowSpeedTime=15 fetch -q origin main 2>/dev/null || echo "session start: could not fetch origin main"
exit 0
