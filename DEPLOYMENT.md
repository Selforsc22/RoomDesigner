# Deployment Guide - Room & Wall Planner

This guide will help you deploy the Room & Wall Planner application so your team can access it.

## Prerequisites

- MongoDB Atlas account
- GitHub account with the repository
- Account on a deployment platform (Railway, Vercel, Render, etc.)

## Part 1: MongoDB Atlas Configuration (REQUIRED FIRST)

### Step 1: Create/Configure Database User

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and sign in
2. Click **"Database Access"** in the left sidebar
3. Click **"Add New Database User"** (or edit existing user)
4. Configure:
   - **Authentication Method:** Password
   - **Username:** Choose a username (e.g., `your-username`)
   - **Password:** Click **"Autogenerate Secure Password"** and **COPY IT**
   - **Database User Privileges:** "Read and write to any database"
5. Click **"Add User"** or **"Update User"**

**IMPORTANT:** Save your username and password! You'll need them for the connection string.

### Step 2: Configure Network Access

6. Click **"Network Access"** in the left sidebar
7. Click **"Add IP Address"**
8. Select **"Allow Access From Anywhere"** (0.0.0.0/0)
9. Click **"Confirm"**
10. **Wait 2-3 minutes** for the change to take effect

### Step 3: Get Your Connection String

11. Click **"Database"** in the left sidebar
12. Click **"Connect"** on your cluster
13. Click **"Connect your application"**
14. Copy the connection string - it looks like:
    ```
    mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
    ```
15. Replace `<username>` with your database username
16. Replace `<password>` with your database password
17. Add `/room-planner` after `.net/` and before the `?`
18. Add `&appName=Cluster0` at the end

**Final connection string format:**
```
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/room-planner?retryWrites=true&w=majority&appName=Cluster0
```

**Note:** If your password has special characters, URL encode them:
- `?` becomes `%3F`
- `@` becomes `%40`
- `#` becomes `%23`
- etc.

---

## Part 2: Deploy Backend to Railway

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub (if needed)
4. Select your repository: `Selforsc22/RoomDesigner`
5. Railway will start creating the project

### Step 2: Configure Branch and Root Directory

6. In Railway project settings:
   - **Branch:** Select `claude/room-wall-planning-app-oZFG8`
   - Click **"Settings"** tab
   - **Root Directory:** Enter `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

### Step 3: Add Environment Variables

7. Click the **"Variables"** tab
8. Add these 5 variables:

| Variable Name | Value |
|--------------|-------|
| `PORT` | `5000` |
| `MONGODB_URI` | Your MongoDB connection string from Part 1 |
| `JWT_SECRET` | `room-planner-secret-key-change-in-production` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://temporary.com` (update after frontend deployment) |

### Step 4: Deploy Backend

9. Railway will automatically deploy
10. Wait 2-5 minutes for deployment to complete
11. Check the **"Deployments"** tab for logs
12. Look for: `✓ Server running on port 5000` and `✓ MongoDB connected successfully`

### Step 5: Get Backend URL

13. Go to **"Settings"** tab
14. Scroll to **"Networking"** or **"Domains"** section
15. Click **"Generate Domain"**
16. Copy the URL (e.g., `https://your-app.up.railway.app`)

**✅ Backend is now deployed!**

---

## Part 3: Deploy Frontend to Vercel

### Step 1: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Find and click **"Import"** next to `Selforsc22/RoomDesigner`

### Step 2: Configure Project Settings

4. On the configuration screen:
   - **Framework Preset:** Select **"Vite"**
   - **Branch:** Select `claude/room-wall-planning-app-oZFG8`
   - **Root Directory:** Leave as `./` (the vercel.json will handle it)
   - **Build Command:** Leave default or set to `npm run build`
   - **Output Directory:** Leave default or set to `dist`

### Step 3: Add Environment Variable

5. Expand **"Environment Variables"**
6. Add ONE variable:

| Variable Name | Value |
|--------------|-------|
| `VITE_API_URL` | `https://your-railway-backend-url.up.railway.app/api` |

**Important:** Replace with your actual Railway backend URL from Part 2, and add `/api` at the end!

### Step 4: Deploy Frontend

7. Click **"Deploy"**
8. Wait 2-3 minutes for build to complete
9. Vercel will show your live URL (e.g., `https://room-planner.vercel.app`)
10. **Copy this URL**

**✅ Frontend is now deployed!**

---

## Part 4: Update Backend FRONTEND_URL

### Final Step: Connect Frontend and Backend

1. Go back to **Railway** dashboard
2. Click on your backend project
3. Go to **"Variables"** tab
4. Find `FRONTEND_URL` variable
5. Click **"Edit"**
6. Change from `https://temporary.com` to your actual Vercel URL
7. Click **"Save"**
8. Railway will automatically redeploy (wait 1-2 minutes)

**✅ Application is fully deployed and configured!**

---

## Testing Your Deployment

1. Open your Vercel frontend URL in a browser
2. You should see the login page
3. Click **"Register"** and create a test account
4. Try creating a room design
5. Changes should auto-save

If everything works, you're done! 🎉

---

## Share with Your Team

Send your team the **Vercel frontend URL** (e.g., `https://room-planner.vercel.app`)

Each team member can:
- Register their own account
- Create and save designs
- All data is stored in your shared MongoDB Atlas database

---

## Troubleshooting

### Backend won't connect to MongoDB

**Error:** `MongoDB connection error: MongoServerError: bad auth`

**Solution:**
1. Go to MongoDB Atlas → Database Access
2. Click "Edit" on your database user
3. Reset the password (use Autogenerate)
4. Update the `MONGODB_URI` in Railway with the new password
5. Railway will redeploy automatically

**Error:** `MongoDB connection error: ECONNREFUSED`

**Solution:**
1. Go to MongoDB Atlas → Network Access
2. Make sure `0.0.0.0/0` is in the list and ACTIVE (green)
3. If not, add it and wait 2-3 minutes

### Frontend can't connect to backend

**Error:** "Failed to register" or CORS errors

**Solution:**
1. Verify the `VITE_API_URL` in Vercel includes `/api` at the end
2. Verify the `FRONTEND_URL` in Railway matches your actual Vercel URL
3. Make sure both end with the domain, no trailing slash

### Railway keeps crashing

**Check the deployment logs:**
1. Railway → Deployments tab → Click latest deployment
2. Look for red error messages
3. Common issues:
   - MongoDB authentication (see above)
   - Missing environment variables
   - Build errors (check `package.json` scripts)

---

## Environment Variables Reference

### Backend (Railway)

```bash
PORT=5000
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/room-planner?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=room-planner-secret-key-change-in-production
NODE_ENV=production
FRONTEND_URL=https://your-vercel-url.vercel.app
```

### Frontend (Vercel)

```bash
VITE_API_URL=https://your-railway-url.up.railway.app/api
```

---

## Cost Breakdown

- **MongoDB Atlas:** Free tier (512 MB storage)
- **Railway:** Free tier available, then ~$5/month for hobby use
- **Vercel:** Free tier (unlimited personal projects)

**Total Cost for Small Team:** $0-10/month

---

## Security Best Practices

1. ✅ Change `JWT_SECRET` to a strong random string in production
2. ✅ Never commit `.env` files (already in `.gitignore`)
3. ✅ Use strong MongoDB passwords (autogenerated recommended)
4. ✅ Rotate MongoDB passwords periodically
5. ✅ Monitor Railway and Vercel logs for suspicious activity

---

## Alternative Deployment Options

### Option 2: Render (Full Stack)

Both frontend and backend can be deployed to [render.com](https://render.com):
- Create a Web Service for backend
- Create a Static Site for frontend
- Similar configuration to Railway/Vercel

### Option 3: Netlify + Railway

- Backend on Railway (same as above)
- Frontend on Netlify (alternative to Vercel)
- Similar deployment process

---

## Need Help?

- Check the main [README.md](./README.md) for local development setup
- MongoDB Atlas docs: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- Railway docs: [docs.railway.app](https://docs.railway.app)
- Vercel docs: [vercel.com/docs](https://vercel.com/docs)
