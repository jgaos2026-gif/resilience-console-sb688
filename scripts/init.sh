#!/usr/bin/env bash
# SB688 Resilience Console — Environment Bootstrap
# JGA Enterprise · NODE: MENDOTA-IL
# Usage: ./scripts/init.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "============================================================"
echo "  SB688 National Resilience Console — Environment Init"
echo "  JGA Enterprise · NODE: MENDOTA-IL · v2.1"
echo "============================================================"
echo ""

# ── Node.js version check ────────────────────────────────────────
MIN_NODE=18
NODE_VERSION=$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1 || echo "0")
if [ "$NODE_VERSION" -lt "$MIN_NODE" ]; then
  echo "[ERROR] Node.js ${MIN_NODE}+ is required. Found: $(node -v 2>/dev/null || echo 'not installed')"
  exit 1
fi
echo "[OK] Node.js $(node -v)"

# ── Python version check ─────────────────────────────────────────
MIN_PYTHON_MINOR=11
PYTHON_CMD=""
for cmd in python3.11 python3.12 python3.13 python3 python; do
  if command -v "$cmd" &>/dev/null; then
    PY_MINOR=$("$cmd" -c "import sys; print(sys.version_info.minor)" 2>/dev/null || echo "0")
    PY_MAJOR=$("$cmd" -c "import sys; print(sys.version_info.major)" 2>/dev/null || echo "0")
    if [ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -ge "$MIN_PYTHON_MINOR" ]; then
      PYTHON_CMD="$cmd"
      break
    fi
  fi
done

if [ -z "$PYTHON_CMD" ]; then
  echo "[WARN] Python 3.11+ not found — backend setup will be skipped."
  SKIP_BACKEND=true
else
  echo "[OK] Python $($PYTHON_CMD --version)"
  SKIP_BACKEND=false
fi

echo ""
echo "── Frontend Setup ──────────────────────────────────────────"

# ── npm install ──────────────────────────────────────────────────
if [ ! -d node_modules ]; then
  echo "Installing frontend dependencies..."
  npm install --silent
else
  echo "[OK] node_modules already present. Running npm install to sync..."
  npm install --silent
fi
echo "[OK] Frontend dependencies installed."

# ── .env.local ───────────────────────────────────────────────────
if [ ! -f .env.local ]; then
  echo ""
  echo "Creating .env.local template..."
  cat > .env.local <<'ENV'
# SB688 Resilience Console — Environment Variables
# Fill in your Base44 app credentials below.

VITE_BASE44_APP_ID=your_base44_app_id_here
VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
ENV
  echo "[OK] .env.local created. Edit it and add your Base44 credentials before running 'npm run dev'."
else
  echo "[OK] .env.local already exists — skipping."
fi

# ── Backend Setup ─────────────────────────────────────────────────
if [ "$SKIP_BACKEND" = false ]; then
  echo ""
  echo "── Backend Setup ───────────────────────────────────────────"

  VENV_DIR=".venv"
  if [ ! -d "$VENV_DIR" ]; then
    echo "Creating Python virtual environment..."
    "$PYTHON_CMD" -m venv "$VENV_DIR"
    echo "[OK] Virtual environment created at .venv/"
  else
    echo "[OK] Virtual environment already exists at .venv/"
  fi

  # Activate and install
  # shellcheck disable=SC1091
  source "$VENV_DIR/bin/activate"
  echo "Installing backend dependencies..."
  pip install --quiet -r requirements.txt
  echo "[OK] Backend dependencies installed."
  deactivate
fi

echo ""
echo "============================================================"
echo "  Setup complete!"
echo ""
echo "  Next steps:"
echo "    1. Edit .env.local and add your Base44 credentials"
echo "    2. Start the frontend:  npm run dev"
if [ "$SKIP_BACKEND" = false ]; then
echo "    3. Start the backend:   source .venv/bin/activate"
echo "                            uvicorn backend.main:app --reload --port 8000"
echo "    4. Run tests:           pytest tests/ -v"
fi
echo ""
echo "  Docs: docs/getting-started.md"
echo "============================================================"
