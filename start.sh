#!/bin/bash
echo ""
echo "================================================"
echo "  LexAI Legal Advisor — Starting..."
echo "================================================"
echo ""

# Check .env values
if grep -q "PASTE_YOUR_MONGODB_URI_HERE" server/.env 2>/dev/null; then
    echo "ERROR: MONGODB_URI not set in server/.env"
    echo "Open server/.env and replace PASTE_YOUR_MONGODB_URI_HERE with your MongoDB URI."
    exit 1
fi

if grep -q "PASTE_YOUR_OPENROUTER_KEY_HERE" server/.env 2>/dev/null; then
    echo "ERROR: OPENROUTER_API_KEY not set in server/.env"
    echo "Open server/.env and replace PASTE_YOUR_OPENROUTER_KEY_HERE with your key."
    exit 1
fi

# Start backend
echo "Starting backend on http://localhost:5000 ..."
cd server && npm run dev &
BACKEND_PID=$!
cd ..

sleep 3

# Start frontend
echo "Starting frontend on http://localhost:5173 ..."
cd client && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "================================================"
echo "  LexAI is running!"
echo "================================================"
echo ""
echo "  Open browser: http://localhost:5173"
echo ""
echo "  Press Ctrl+C to stop both servers."
echo ""

# Keep running until Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'; exit 0" INT
wait
