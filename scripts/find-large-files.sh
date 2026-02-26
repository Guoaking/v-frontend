#!/bin/sh
set -e
ROOT="${1:-.}"
THRESHOLD="${2:-700}"
find "$ROOT" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.go" -o -name "*.py" -o -name "*.java" -o -name "*.c" -o -name "*.cpp" -o -name "*.css" -o -name "*.scss" -o -name "*.html" -o -name "*.sh" -o -name "*.yml" -o -name "*.yaml" -o -name "*.md" \) ! -path "*/node_modules/*" ! -path "*/.git/*" -print0 | xargs -0 wc -l 2>/dev/null | awk -v t="$THRESHOLD" '$1>t{print $1"\t"$2}' | sort -nr
