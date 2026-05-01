# ⚖️ VakilAI — Indian Legal Intelligence

AI-powered Indian legal advisor using OpenRouter API (FREE).

## 🚀 Quick Start

### Step 1 — Get your FREE OpenRouter API key
1. Go to https://openrouter.ai
2. Sign up (Google/GitHub)
3. Go to https://openrouter.ai/keys
4. Click "Create Key"
5. Copy the key (starts with `sk-or-v1-...`)

### Step 2 — Configure .env
Open `server/.env` and set:
```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
MONGODB_URI=mongodb://localhost:27017/vakilai
```

### Step 3 — Install & Run

**Terminal 1 (Server):**
```bash
cd server
npm install
node index.js
```

**Terminal 2 (Client):**
```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173

## 🆓 Free Models Available
- `google/gemini-2.0-flash-exp:free` — Best quality (recommended)
- `google/gemini-flash-1-5:free` — Also good
- `meta-llama/llama-3.1-8b-instruct:free` — Fast alternative
- `mistralai/mistral-7b-instruct:free` — Lightweight

## ✨ Features
- 💬 Real-time streaming AI responses
- 📋 Legal templates (9 pre-built queries)
- 🆘 Emergency contacts (12 Indian helplines)
- 📌 Pin important conversations
- 🔍 Search conversation history
- 🎤 Voice input support
- ↓ Download conversations as text
- ↺ Regenerate AI responses
- 🗑 Clear all history
- 📱 Mobile responsive

## 📚 Legal Coverage
Criminal Law · Consumer Rights · Property Law · Family Law · 
Cyber Crime · Employment · Contracts · RTI · Constitutional Rights
