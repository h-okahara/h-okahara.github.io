#!/usr/bin/env bash
#
# Render the /cv/ page to files/cv_en.pdf and files/cv_ja.pdf with headless
# Chrome, so that the PDF version of the CV always matches the website.
#
#   bin/build-cv-pdf.sh                     # writes into _site/files/
#   bin/build-cv-pdf.sh --out-dir files     # writes into files/
#
# The site is rebuilt into a temporary directory with _config_pdf.yml, which
# makes every asset URL root-relative; that copy is served locally and printed
# once per language (the page honours ?lang=en / ?lang=ja).
#
# Options:
#   --out-dir DIR   where the PDFs are written (default: _site/files)
#   --port PORT     port of the local preview server (default: 4321)
#
# Environment:
#   CHROME_BIN      Chrome/Chromium binary (default: auto-detected)
#   JEKYLL_CMD      Jekyll command (default: "bundle exec jekyll")

set -euo pipefail

OUT_DIR="_site/files"
PORT="4321"

while [ $# -gt 0 ]; do
  case "$1" in
    --out-dir) OUT_DIR="$2"; shift 2 ;;
    --port) PORT="$2"; shift 2 ;;
    -h|--help) sed -n '2,22p' "$0"; exit 0 ;;
    *) echo "error: unknown option: $1" >&2; exit 1 ;;
  esac
done

cd "$(dirname "$0")/.."

find_chrome() {
  if [ -n "${CHROME_BIN:-}" ]; then
    echo "$CHROME_BIN"
    return 0
  fi
  local candidate
  for candidate in \
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    "/Applications/Chromium.app/Contents/MacOS/Chromium" \
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"; do
    if [ -x "$candidate" ]; then
      echo "$candidate"
      return 0
    fi
  done
  for candidate in google-chrome google-chrome-stable chromium chromium-browser; do
    if command -v "$candidate" >/dev/null 2>&1; then
      command -v "$candidate"
      return 0
    fi
  done
  return 1
}

if ! CHROME="$(find_chrome)"; then
  echo "error: no Chrome/Chromium found. Set CHROME_BIN to the browser binary." >&2
  exit 1
fi

WORK_DIR="$(mktemp -d)"
SERVER_PID=""
cleanup() {
  if [ -n "$SERVER_PID" ]; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    wait "$SERVER_PID" >/dev/null 2>&1 || true
  fi
  rm -rf "$WORK_DIR"
}
trap cleanup EXIT

PDF_SITE="$WORK_DIR/site"

echo "==> building the site for printing"
${JEKYLL_CMD:-bundle exec jekyll} build \
  --config _config.yml,_config_pdf.yml \
  --destination "$PDF_SITE" \
  --quiet

if [ ! -f "$PDF_SITE/cv/index.html" ]; then
  echo "error: $PDF_SITE/cv/index.html was not generated." >&2
  exit 1
fi

echo "==> serving the site on http://127.0.0.1:$PORT"
python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$PDF_SITE" >/dev/null 2>&1 &
SERVER_PID=$!

ready=0
for _ in $(seq 1 60); do
  if curl -sf -o /dev/null "http://127.0.0.1:$PORT/cv/"; then
    ready=1
    break
  fi
  sleep 0.25
done
if [ "$ready" -ne 1 ]; then
  echo "error: the preview server did not come up on port $PORT." >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

pdf_is_complete() {
  [ -s "$1" ] && tail -c 64 "$1" | grep -q "%%EOF"
}

for lang in en ja; do
  out="$OUT_DIR/cv_${lang}.pdf"
  echo "==> rendering $out"
  rm -f "$out"

  "$CHROME" \
    --headless=new \
    --disable-gpu \
    --no-sandbox \
    --no-first-run \
    --hide-scrollbars \
    --user-data-dir="$WORK_DIR/chrome-$lang" \
    --virtual-time-budget=20000 \
    --run-all-compositor-stages-before-draw \
    --no-pdf-header-footer \
    --print-to-pdf="$out" \
    "http://127.0.0.1:$PORT/cv/?lang=$lang" >/dev/null 2>&1 &
  chrome_pid=$!

  # Chrome does not always exit once the file is written (on macOS it waits for
  # its updater), so stop as soon as a complete PDF is on disk.
  waited=0
  while kill -0 "$chrome_pid" 2>/dev/null; do
    if pdf_is_complete "$out"; then
      kill "$chrome_pid" >/dev/null 2>&1 || true
      break
    fi
    if [ "$waited" -ge 120 ]; then
      kill -9 "$chrome_pid" >/dev/null 2>&1 || true
      break
    fi
    sleep 1
    waited=$((waited + 1))
  done
  wait "$chrome_pid" >/dev/null 2>&1 || true

  if ! pdf_is_complete "$out"; then
    echo "error: $out was not produced." >&2
    exit 1
  fi
  echo "    $(wc -c < "$out" | tr -d ' ') bytes"
done

echo "==> done"
