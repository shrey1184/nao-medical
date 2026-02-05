# 🚀 Quick Render Backend Deployment Guide

Your frontend is already live at: **https://vite-project-pearl-zeta.vercel.app**

## Step 1: Create PostgreSQL Database on Render

1. Go to https://render.com and sign in
2. Click **New +** → **PostgreSQL**
3. Configure:
   - **Name:** `nao-medical-db`
   - **Database:** `nao_medical`
   - **User:** `nao_medical_user`
   - **Region:** Oregon (or closest to you)
   - **Plan:** Free
4. Click **Create Database**
5. Wait 2-3 minutes for database to initialize
6. **Copy the Internal Database URL** (starts with `postgresql://`)
   - Found under "Connections" section
   - Format: `postgresql://user:password@host/database`

---

## Step 2: Push Code to GitHub (if not done)

```bash
cd /home/shrey/nao-medical
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

---

## Step 3: Deploy Backend on Render

1. Go to https://render.com
2. Click **New +** → **Web Service**
3. **Connect your GitHub repository:**
   - Click "Connect GitHub"
   - Select your repository: `nao-medical`
   - Click "Connect"

4. **Configure the Web Service:**
   ```
   Name:           nao-medical-backend
   Region:         Oregon (or same as database)
   Branch:         main
   Root Directory: backend
   Runtime:        Python 3
   ```

5. **Build Command:**
   ```bash
   pip install -r requirements.txt && prisma generate && prisma db push
   ```

6. **Start Command:**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

7. **Add Environment Variables:** (Click "Add Environment Variable")
   
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | [Your Internal Database URL from Step 1] |
   | `GEMINI_API_KEY` | [Your Google Gemini API Key] |
   | `CORS_ORIGINS` | `https://vite-project-pearl-zeta.vercel.app` |
   | `PYTHON_VERSION` | `3.11.0` |

8. **Select Plan:** Free

9. Click **Create Web Service**

10. **Wait for deployment** (5-10 minutes)
    - Watch the logs for any errors
    - Database migrations will run automatically

11. **Copy your backend URL** once deployed
    - Will be like: `https://nao-medical-backend.onrender.com`

---

## Step 4: Update Frontend Environment Variable

### Option A: Via Vercel Dashboard (Recommended)
1. Go to https://vercel.com/shreys-projects-3c62dc56/vite-project/settings
2. Navigate to **Environment Variables**
3. Add new variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://nao-medical-backend.onrender.com` (your actual URL)
   - **Environment:** Production, Preview, Development
4. Click **Save**
5. Go to **Deployments** tab
6. Click **Redeploy** on the latest deployment

### Option B: Via Vercel CLI
```bash
cd /home/shrey/nao-medical/frontend/vite-project
vercel env add VITE_API_URL production
# Enter: https://nao-medical-backend.onrender.com
vercel --prod
```

---

## Step 5: Test Your Deployment

1. Visit: https://vite-project-pearl-zeta.vercel.app
2. Try creating a doctor and patient
3. Start a conversation
4. Send messages and verify translations work

---

## 🐛 Troubleshooting

### Backend deployment fails
- Check Render logs in the dashboard
- Verify `DATABASE_URL` is set correctly
- Ensure `GEMINI_API_KEY` is valid
- Check Python version is 3.11

### Database connection errors
- Verify you're using the **Internal Database URL** (not External)
- Check database is running (green status in Render dashboard)
- Wait a few minutes after database creation

### Frontend can't connect to backend
- Verify `VITE_API_URL` is set in Vercel
- Check CORS settings in backend include Vercel URL
- Look at browser console for CORS errors
- Ensure backend URL has no trailing slash

### Cold start delays (Free tier)
- Render free tier sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Subsequent requests are fast

---

## 📊 Monitor Your Deployment

**Backend Logs:**
https://dashboard.render.com → Your Service → Logs

**Frontend Logs:**
https://vercel.com/shreys-projects-3c62dc56/vite-project → Deployments → View Function Logs

**Database Metrics:**
https://dashboard.render.com → Your Database → Metrics

---

## 🎯 Your Deployment URLs

- **Frontend:** https://vite-project-pearl-zeta.vercel.app
- **Backend:** [Will be available after Step 3]
- **Database:** [Internal URL from Step 1]

---

## 🔐 Important Security Notes

1. Never commit `.env` files with real credentials
2. Always use environment variables for secrets
3. The free tier is for development/testing only
4. For production, consider:
   - Enabling database backups
   - Upgrading to paid plans for better uptime
   - Setting up custom domains
   - Enabling SSL (automatic on Render/Vercel)
