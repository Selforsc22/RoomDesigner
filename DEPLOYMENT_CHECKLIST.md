# Deployment Checklist

## Railway Backend Configuration

**Repository Settings:**
- Root Directory: `backend`
- Branch: `claude/room-wall-planning-app-oZFG8`

**Environment Variables:**
```
MONGODB_URI=mongodb+srv://roomplanneruser:SimplePass123@cluster0.zks1pqe.mongodb.net/roomplanner
JWT_SECRET=your-secret-key-here
FRONTEND_URL=https://your-vercel-app.vercel.app
NODE_ENV=production
PORT=5000
```

**Build Configuration:**
- Builder: NIXPACKS (configured via railway.json)
- Start Command: `npm start`

## Vercel Frontend Configuration

**Repository Settings:**
- Root Directory: `frontend`
- Branch: `claude/room-wall-planning-app-oZFG8`
- Framework: Vite

**Environment Variables:**
```
VITE_API_URL=https://roomdesigner-production.up.railway.app/api
```

⚠️ **CRITICAL**: The `VITE_API_URL` must end with `/api` and must be the full Railway URL.
⚠️ **Replace with your actual Railway URL** - check Railway dashboard for the correct domain.

## Debugging Authentication Issues

When you open the browser console (F12 → Console tab), you should see these logs:

1. **On Page Load:**
   - `API Service: localStorage is available`

2. **When Logging In:**
   - `AuthContext: Starting login...`
   - `Login: Making request to backend...`
   - `Login: Response received { hasToken: true }`
   - `Login: Token stored in localStorage`
   - `Login: Token verification { stored: true }`
   - `AuthContext: Login successful { hasUser: true }`
   - `AuthContext: User state updated`
   - `MainLayout: Loading designs...`
   - `MainLayout: Token check { hasToken: true }`
   - `MainLayout: Designs loaded { count: X }`

3. **If There's an Error:**
   - Look for `API Error:` logs with details
   - Look for `Failed to load designs:` with error details
   - Check if token is in localStorage: `localStorage.getItem('token')`

## Common Issues

1. **401 Unauthorized Errors**
   - Check if token exists in localStorage
   - Verify VITE_API_URL is set correctly in Vercel
   - Verify Railway backend is running
   - Check Railway logs for authentication errors

2. **CORS Errors**
   - Verify FRONTEND_URL in Railway matches your Vercel URL exactly
   - No trailing slashes in URLs

3. **"localStorage not available" Error**
   - Check if browser is in private/incognito mode
   - Check browser settings for localStorage restrictions
   - Try a different browser

4. **Backend Not Responding**
   - Check Railway deployment status
   - Verify MongoDB connection in Railway logs
   - Check Railway environment variables are set
