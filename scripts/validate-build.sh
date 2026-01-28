#!/bin/bash
set -euo pipefail

log_and_run() {
  echo "[$1] $2"
}

log_and_run "lint" "Running ESLint"
npm run lint

log_and_run "build" "Building production bundle"
build_log="$(mktemp)"
trap 'rm -f "$build_log"' EXIT
npm run build 2>&1 | tee "$build_log"

log_and_run "check" "Scanning build output for warnings"
if grep -qi "deprecated" "$build_log"; then
  echo "[error] Build contains deprecation warnings"
  exit 1
fi

if grep -qi "a11y" "$build_log"; then
  echo "[error] Build contains accessibility warnings"
  exit 1
fi

echo "[ok] Build validation passed"
