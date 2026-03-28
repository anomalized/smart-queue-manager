# 10 Commands to Push Smart Queue Manager to Repository

Copy these commands in order. Replace `your-username` and `your-repo-url` with your actual values.

## Step 1: Initialize Git (if not already done)
```powershell
git init
```

## Step 2: Configure Git User (first time only)
```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Add Remote Repository
```powershell
git remote add origin https://github.com/your-username/smart-queue-manager.git
```

## Step 4: Add All Files (respects .gitignore)
```powershell
git add .
```

## Step 5: Verify Files to be Committed
```powershell
git status
```

## Step 6: Create Initial Commit
```powershell
git commit -m "Initial commit: Smart Queue Manager backend and frontend"
```

## Step 7: Create/Switch to Main Branch
```powershell
git branch -M main
```

## Step 8: Push to Remote Repository
```powershell
git push -u origin main
```

## Step 9: Verify Push Success
```powershell
git log --oneline -n 5
```

## Step 10: Verify Remote Connection
```powershell
git remote -v
```

---

## Quick All-in-One (After Step 2 is done):
```powershell
git init
git remote add origin https://github.com/your-username/smart-queue-manager.git
git add .
git commit -m "Initial commit: Smart Queue Manager"
git branch -M main
git push -u origin main
```

## For Subsequent Commits:
```powershell
git add .
git commit -m "Your commit message"
git push origin main
```

---

## Troubleshooting:

If you already have a .git folder:
```powershell
git remote set-url origin https://github.com/your-username/smart-queue-manager.git
```

If push fails with authentication:
```powershell
# Use GitHub CLI (recommended)
gh auth login
# Or generate a personal access token and use:
git remote set-url origin https://your-username:your-token@github.com/your-username/smart-queue-manager.git
```

If you want to check what will be committed before pushing:
```powershell
git diff --cached
```
