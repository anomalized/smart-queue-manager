**SMART QUEUE MANAGER**

*ADMIN*
![alt text](image.png)

*CUSTOMER*
![alt text](image-1.png)

# Smart Queue Manager — Local dev

This repository contains a simple demo app: an Express + MongoDB backend and a tiny static frontend.

Quick overview
- backend/: Express API (runs on port 4000 by default)
- frontend/: Static UI (index.html and admin.html)

Prerequisites
- Node.js (14+ or current LTS)
- npm
- MongoDB running locally or remote (the backend defaults to mongodb://127.0.0.1:27017/sqms)

Run locally (recommended)

1) Install backend deps

```powershell
cd backend
npm install
```

2) (Optional) install root dev deps to run both servers together

```powershell
cd ..
npm install
```

3) Start backend only

```powershell
# from backend/
node server.js
# or for auto-restart during development
npm run dev
```

4) Serve frontend (one of these)

Option A (recommended): lightweight static server

```powershell
cd frontend
npx http-server -p 8080
# then open http://localhost:8080/index.html and http://localhost:8080/admin.html
```

Option B: open the HTML files directly in your browser (works for demo but serving is smoother).

Run both (one command) — dev convenience

After running `npm install` at repo root, you can run:

```powershell
npm run dev
```

This uses `concurrently` to start the backend and frontend servers.

Demo — example API requests (PowerShell)

```powershell
# create a queue (admin). Replace password if you changed it in backend/.env
$headers = @{ Authorization = 'Bearer admin123'; 'Content-Type' = 'application/json' }
$body = @{ shopName = 'Demo Shop'; date = (Get-Date -Format yyyy-MM-dd) } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:4000/api/queues -Method Post -Headers $headers -Body $body

# request a token (customer)
Invoke-RestMethod -Uri "http://localhost:4000/api/queues/<QUEUE_ID>/token" -Method Post

# call next (admin)
Invoke-RestMethod -Uri "http://localhost:4000/api/queues/<QUEUE_ID>/next" -Method Post -Headers $headers
```

Notes
- Admin authentication in this demo is a simple bearer token read from `backend/.env` (ADMIN_PASSWORD). Not secure for production.
- The frontend uses port 4000 as the API base and CORS is enabled in backend.

If you want, I can add a small PowerShell script to automate the demo flow.

One-click demo scripts (PowerShell)

Two helper scripts were added to the repo root to help run and stop the demo quickly on Windows:

- `run_demo.ps1` — starts the backend and frontend servers in the background, opens your browser to the UIs, runs a short sample flow (create queue, get token, call next, end) and saves demo state and logs under `./.demo/`.
- `stop_demo.ps1` — stops the background processes started by `run_demo.ps1` and removes the pid file.

Usage (PowerShell):

```powershell
# run once to start servers, open browser and run sample inputs
cd c:\Users\HP\OneDrive\Desktop\smart-queue-manager
./run_demo.ps1

# when finished, stop the background servers
./stop_demo.ps1
```

What is persisted between runs
- The app uses MongoDB for data storage. All created queues/tokens are stored in the MongoDB database configured by `backend/.env` (MONGODB_URI). As long as the MongoDB data directory is preserved, your data (created queues, tokens, etc.) will be available on the next run.
- The demo helper saves a small state file at `./.demo/demo_state.json` which contains the last created queue id and sample token info for convenience.

How the scripts behave
- `run_demo.ps1` will run `npm install` in `backend/` if `node_modules` is missing. It starts `node backend/server.js` and `npx http-server -p 8080` (frontend). It saves process IDs in `./.demo/pids.json` so `stop_demo.ps1` can stop them.
- `stop_demo.ps1` reads `./.demo/pids.json` and attempts to stop the stored PIDs.

If you'd like I can also:
- Add a one-click Windows shortcut that runs `run_demo.ps1` (so you can double-click it in the presentation).
- Add cross-platform scripts (bash) for macOS/Linux.
- Add a small PowerShell GUI prompt to run the demo with options.
 
Added extras
- `run_demo.bat` — double-clickable batch file in the repo root that runs `run_demo.ps1` using PowerShell (Windows). Useful for presentations.

Seeding the database
- A seed script was added at `backend/seed.js` to pre-populate MongoDB with a few example queues and tokens. To run it:

```powershell
cd C:\Users\HP\OneDrive\Desktop\smart-queue-manager\backend
npm run seed
```

This will connect to the MongoDB configured by `backend/.env` (MONGODB_URI) and insert three demo queues (two open, one closed). It first deletes any existing queues that start with "Seed -" to avoid duplicates.

If you'd like, I can add a script that seeds and then runs `run_demo.ps1` automatically.