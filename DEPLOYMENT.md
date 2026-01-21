# Deployment Guide - Room & Wall Planner

This guide will help you deploy the Room & Wall Planner application so your team can access it.

## Prerequisites

- MongoDB Atlas account (already set up ✓)
- GitHub account with the repository
- Account on a deployment platform (Railway, Vercel, Render, etc.)

## MongoDB Atlas Configuration

### 1. Network Access
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Click **"Network Access"** (left sidebar)
3. Click **"Add IP Address"**
4. Select **"Allow Access From Anywhere"** (0.0.0.0/0)
5. Click **"Confirm"**

### 2. Database User
- Username: `chrisselfors`
- Password: `hackerman34?`
- Connection String: `mongodb+srv://chrisselfors:hackerman34%3F@cluster0.vwnwdkx.mongodb.net/room-planner?retryWrites=true&w=majority&appName=Cluster0`

## Deployment Option 1: Railway (Backend) + Vercel (Frontend) - RECOMMENDED

### Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select `Selforsc22/RoomDesigner`
4. Select branch: `claude/room-wall-planning-app-oZFG8`
5. Click **"Add Variables"** and add:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://chrisselfors:hackerman34%3F@cluster0.vwnwdkx.mongodb.net/room-planner?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=room-planner-secret-key-change-in-production
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
6. Under **Settings**:
   - Root Directory: `/backend`
   - Build Command: `npm run build`
   - Start Command: `npm start`
7. Click **"Deploy"**
8. Copy your Railway URL (e.g., `https://your-app.railway.app`)

### Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"** → Import `Selforsc22/RoomDesigner`
3. Configure:
   - Branch: `claude/room-wall-planning-app-oZFG8`
   - Framework Preset: **Vite**
   - Root Directory: `frontend`
4. Click **"Environment Variables"** and add:
   ```
   VITE_API_URL=https://your-app.railway.app/api
   ```
   (Replace with your Railway backend URL)
5. Click **"Deploy"**
6. Copy your Vercel URL (e.g., `https://room-planner.vercel.app`)

### Update Backend FRONTEND_URL

1. Go back to Railway
2. Update the `FRONTEND_URL` environment variable with your Vercel URL
3. Redeploy

**Done!** Share the Vercel URL with your team.

## Deployment Option 2: Render (Full Stack)

### Deploy Backend

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - Name: `room-planner-backend`
   - Branch: `claude/room-wall-planning-app-oZFG8`
   - Root Directory: `backend`
   - Runtime: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://chrisselfors:hackerman34%3F@cluster0.vwnwdkx.mongodb.net/room-planner?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=room-planner-secret-key-change-in-production
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.onrender.com
   ```
6. Click **"Create Web Service"**
7. Copy the backend URL

### Deploy Frontend

1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:
   - Name: `room-planner-frontend`
   - Branch: `claude/room-wall-planning-app-oZFG8`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```
5. Click **"Create Static Site"**

### Update Backend FRONTEND_URL
Go back to backend service and update `FRONTEND_URL` with your frontend URL.

## Deployment Option 3: Heroku (Alternative)

### Backend
```bash
# Install Heroku CLI
# Login and create app
heroku create room-planner-backend
heroku config:set MONGODB_URI="mongodb+srv://chrisselfors:hackerman34%3F@cluster0.vwnwdkx.mongodb.net/room-planner?retryWrites=true&w=majority&appName=Cluster0"
heroku config:set JWT_SECRET="room-planner-secret-key-change-in-production"
heroku config:set NODE_ENV="production"
git subtree push --prefix backend heroku main
```

### Frontend
Deploy to Netlify or Vercel (same as Option 1)

## Team Access

Once deployed, share the frontend URL with your team:
- Example: `https://room-planner.vercel.app`

Each team member can:
1. Open the URL
2. Register an account
3. Start designing rooms and walls
4. Their designs are saved to the shared MongoDB database

## Security Notes

- The JWT secret should be changed to a strong random string in production
- Consider implementing role-based access control if needed
- Keep your MongoDB Atlas password secure
- Don't commit `.env` files to git (already configured in `.gitignore`)

## Monitoring

- **Railway**: Built-in logs and metrics
- **Vercel**: Analytics dashboard
- **Render**: Logs and metrics in dashboard
- **MongoDB Atlas**: Monitor database usage in Atlas dashboard

## Troubleshooting

**"Cannot connect to backend"**
- Verify CORS settings (FRONTEND_URL matches actual frontend URL)
- Check backend logs for errors
- Verify MongoDB Atlas network access is set to "Allow from anywhere"

**"Authentication errors"**
- Clear browser cookies
- Check that JWT_SECRET is set in backend environment variables

**"Database connection failed"**
- Verify MongoDB Atlas network access allows your deployment platform
- Check the MONGODB_URI is correct (password URL-encoded)

## Cost

- **MongoDB Atlas**: Free tier (512 MB storage)
- **Railway**: Free tier with limitations, then ~$5/month
- **Vercel**: Free tier (hobby projects)
- **Render**: Free tier (limited)

**Total Cost for Small Team**: $0-10/month

## Questions?

Check the main README.md or contact the repository owner.
