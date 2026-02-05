# Deployment Guide

## Prerequisites
- GitHub account with your code pushed
- Vercel account (free)
- Render account (free)
- Supabase account (free) or Render PostgreSQL

---

## 1️⃣ Database Setup (Choose One)

### Option A: Supabase (Recommended)
1. Go to https://supabase.com and sign in
2. Create new project
3. Wait for database to initialize
4. Go to **Settings** → **Database**
5. Copy the **Connection String** (URI format)
6. It looks like: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

### Option B: Render PostgreSQL
1. Go to https://render.com
2. Click **New** → **PostgreSQL**
3. Fill in database name: `nao-medical-db`
4. Select **Free** plan
5. Click **Create Database**
6. Copy the **Internal Database URL**

---

## 2️⃣ Backend Deployment (Render)

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to Render.com**
   - Click **New** → **Web Service**
   - Connect your GitHub repository
   - Select `nao-medical` repository

3. **Configure the service:**
   - **Name:** `nao-medical-backend`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:**
     ```
     pip install -r requirements.txt && prisma generate && prisma db push
     ```
   - **Start Command:**
     ```
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```

4. **Add Environment Variables:**
   - `DATABASE_URL` = Your Supabase/Render PostgreSQL connection string
   - `GEMINI_API_KEY` = Your Google Gemini API key
   - `CORS_ORIGINS` = `https://your-app.vercel.app` (update after frontend deployment)

5. Click **Create Web Service**
6. Wait for deployment (5-10 minutes)
7. **Copy your backend URL** (e.g., `https://nao-medical-backend.onrender.com`)

---

## 3️⃣ Frontend Deployment (Vercel)

1. **Update API URL for production**
   Create `.env.production` in `frontend/vite-project/`:
   ```env
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

2. **Go to Vercel.com**
   - Sign in with GitHub
   - Click **Add New** → **Project**
   - Import your `nao-medical` repository

3. **Configure the project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend/vite-project`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   
4. **Add Environment Variable:**
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.onrender.com`

5. Click **Deploy**
6. Wait for deployment (2-3 minutes)
7. **Copy your frontend URL** (e.g., `https://nao-medical.vercel.app`)

---

## 4️⃣ Update CORS Settings

1. Go back to **Render** → Your backend service
2. Update the `CORS_ORIGINS` environment variable:
   ```
   https://your-app.vercel.app
   ```
3. Save and wait for redeployment

---

## 5️⃣ Verify Deployment

1. Visit your Vercel URL
2. Test creating users, conversations, and sending messages
3. Check if translations work
4. Monitor logs on Render for any errors

---

## 🔧 Troubleshooting

### Backend won't start
- Check Render logs: Dashboard → Your Service → Logs
- Verify `DATABASE_URL` is correct
- Ensure `GEMINI_API_KEY` is set

### Database connection failed
- Verify DATABASE_URL format: `postgresql://user:password@host:port/database`
- Check if database is running (Supabase/Render dashboard)
- Try running `prisma db push` manually in Render shell

### Frontend can't connect to backend
- Check `VITE_API_URL` in Vercel environment variables
- Verify CORS settings in backend
- Check browser console for errors

### CORS errors
- Update `CORS_ORIGINS` in Render to include your Vercel URL
- Must be exact match (no trailing slash)

---

## 💰 Free Tier Limits

**Supabase:**
- 500 MB database
- 2 GB bandwidth
- Pauses after 1 week of inactivity

**Render:**
- 750 hours/month (enough for 1 service)
- Sleeps after 15 min of inactivity (cold starts take ~30s)
- 512 MB RAM

**Vercel:**
- 100 GB bandwidth/month
- 100 deployments/day
- Serverless functions

---

## 🚀 Next Steps

1. Set up custom domain (optional)
2. Enable automatic deployments on git push
3. Set up monitoring (Render has built-in metrics)
4. Consider upgrading for production workloads
