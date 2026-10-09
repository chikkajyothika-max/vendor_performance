# VendorSync AI — Deployment Guide

## Live Status
- Local server: http://localhost:8000
- Database: Supabase PostgreSQL (connected)
- AI Engine: Smart Local AI (add GEMINI_API_KEY to enable Gemini)

---

## Deploy to Railway (Free Hosting)

### Step 1 — Push code to GitHub
1. Go to https://github.com/new → create a new repo named `vendor-score-lab`
2. In your project folder, open PowerShell and run:
```
git init
git add .
git commit -m "Initial VendorSync AI deployment"
git remote add origin https://github.com/YOUR-USERNAME/vendor-score-lab.git
git push -u origin main
```

### Step 2 — Deploy on Railway
1. Go to https://railway.app → Login with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `vendor-score-lab` repository
4. Railway auto-detects Python and starts building

### Step 3 — Add Environment Variables in Railway
In your Railway project → **Variables** tab → add these:
```
DATABASE_URL = postgresql://postgres.ojqyjdeynocshueklorc:GgRr5iPy5Frko9KQ@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require
GEMINI_API_KEY = (your Gemini key from aistudio.google.com)
JWT_SECRET_KEY = (any long random string)
PORT = 8000
```

### Step 4 — Get your public URL
Railway gives you a free URL like:
`https://vendor-score-lab-production.up.railway.app`

---

## Deploy to Render (Alternative — also free)

1. Go to https://render.com → New → Web Service
2. Connect GitHub → select your repo
3. Settings:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python run_server.py`
4. Add the same environment variables as above

---

## Environment Variables Reference
| Variable | Value |
|---|---|
| DATABASE_URL | Your Supabase pooler URL |
| GEMINI_API_KEY | From aistudio.google.com (optional) |
| JWT_SECRET_KEY | Any long random string |
| PORT | 8000 |
