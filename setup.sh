#!/bin/bash
echo ""
echo "================================================"
echo "  LexAI Legal Advisor — Setup Script (Mac/Linux)"
echo "================================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed."
    echo "Please install it from: https://nodejs.org (choose LTS)"
    exit 1
fi
echo "[OK] Node.js: $(node --version)"

# Install server deps
echo ""
echo "Installing server dependencies..."
cd server && npm install
if [ $? -ne 0 ]; then echo "ERROR: Server install failed."; exit 1; fi
echo "[OK] Server dependencies installed."
cd ..

# Install client deps
echo ""
echo "Installing client dependencies..."
cd client && npm install
if [ $? -ne 0 ]; then echo "ERROR: Client install failed."; exit 1; fi
echo "[OK] Client dependencies installed."
cd ..

echo ""
echo "================================================"
echo "  Setup Complete!"
echo "================================================"
echo ""
echo "NEXT STEP — Fill in your API keys:"
echo ""
echo "  1. Open:  server/.env"
echo "  2. Replace PASTE_YOUR_MONGODB_URI_HERE  -> your MongoDB URI"
echo "  3. Replace PASTE_YOUR_OPENROUTER_KEY_HERE  -> your OpenRouter key"
echo "  4. Save the file"
echo ""
echo "Then run:  bash start.sh"
echo ""
