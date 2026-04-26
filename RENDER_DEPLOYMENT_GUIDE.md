# 🚀 Render Deployment Guide - ChatterBox

## Complete Step-by-Step Guide for Deploying on Render

---

## 📋 Prerequisites

1. **GitHub Account** ✅ (Already done)
2. **Render Account** - Create at https://render.com (Free)
3. **MongoDB Atlas Account** - Create at https://mongodb.com/cloud/atlas (Free)
4. **Cloudinary Account** (Optional) - For image uploads

---

## Part 1: MongoDB Atlas Setup (Database)

### Step 1: Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google/Email
3. Choose **FREE** tier (M0 Sandbox)

### Step 2: Create Database
1. Click **"Build a Database"**
2. Select **FREE** tier (Shared)
3. Choose **AWS** provider
4. Select region closest to you (e.g., Mumbai for India)
5. Cluster Name: `ChatterBox` (or any name)
6. Click **"Create"**

### Step 3: Create Database User
1. Choose **Username and Password** authentication
2. Username: `chatterbox_user` (or any name)
3. Password: Generate a strong password (SAVE THIS!)
4. Click **"Create User"**

### Step 4: Add IP Address
1. Click **"Add IP Address"**
2. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
3. Click **"Confirm"**

### Step 5: Get Connection String
1. Click **"Connect"**
2. Choose **"Connect your application"**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy the connection string:
   ```
   mongodb+srv://chatterbox_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name before `?`:
   ```
   mongodb+srv://chatterbox_user:yourpassword@cluster0.xxxxx.mongodb.net/chatterbox?retryWrites=true&w=majority
   ```
7. **SAVE THIS CONNECTION STRING!**

---

## Part 2: Deploy Backend on Render

### Step 1: Create Render Account
1. Go to: https://render.com
2. Click **"Get Started"**
3. Sign up with **GitHub** (recommended)
4. Authorize Render to access your GitHub

### Step 2: Create New Web Service
1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Connect a repository"**
4. Find and select: **`aarushi862/Chatterbox_app`**
5. Click **"Connect"**

### Step 3: Configure Backend Service
Fill in these details:

**Basic Settings:**
- **Name**: `chatterbox-backend` (or any unique name)
- **Region**: Choose closest to you (e.g., Singapore)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- Select **"Free"** (Free tier)

### Step 4: Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add these variables one by one:

```
PORT=5000

MONGO_URI=mongodb+srv://chatterbox_user:yourpassword@cluster0.xxxxx.mongodb.net/chatterbox?retryWrites=true&w=majority

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345

CLIENT_URL=https://chatterbox-frontend.onrender.com

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Important:**
- Replace `MONGO_URI` with your actual MongoDB connection string
- Replace `JWT_SECRET` with a random long string
- `CLIENT_URL` will be updated after frontend deployment
- Cloudinary values are optional (for image uploads)

### Step 5: Deploy Backend
1. Click **"Create Web Service"**
2. Wait 2-5 minutes for deployment
3. You'll see logs in real-time
4. Once deployed, you'll get a URL like:
   ```
   https://chatterbox-backend.onrender.com
   ```
5. **SAVE THIS URL!**

### Step 6: Test Backend
Open in browser:
```
https://chatterbox-backend.onrender.com
```
You should see:
```json
{"message": "Real-time Chat API is running 🚀"}
```

---

## Part 3: Deploy Frontend on Render

### Step 1: Update Frontend API URL
Before deploying frontend, update the API URL.

**File to update:** `frontend/src/api/axios.js`

Change:
```javascript
const api = axios.create({
  baseURL: 'http://localhost:5000', // OLD
  headers: {
    'Content-Type': 'application/json',
  },
});
```

To:
```javascript
const api = axios.create({
  baseURL: 'https://chatterbox-backend.onrender.com', // NEW - Your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Commit and push:**
```bash
git add .
git commit -m "Update API URL for production"
git push origin main
```

### Step 2: Create Frontend Web Service
1. Go to Render Dashboard
2. Click **"New +"** → **"Web Service"**
3. Select your repository: **`aarushi862/Chatterbox_app`**
4. Click **"Connect"**

### Step 3: Configure Frontend Service
Fill in these details:

**Basic Settings:**
- **Name**: `chatterbox-frontend` (or any unique name)
- **Region**: Same as backend (e.g., Singapore)
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run preview` or `npx vite preview --host 0.0.0.0 --port $PORT`

**Instance Type:**
- Select **"Free"**

### Step 4: Add Environment Variable (Optional)
If needed:
```
NODE_ENV=production
```

### Step 5: Deploy Frontend
1. Click **"Create Web Service"**
2. Wait 2-5 minutes
3. You'll get a URL like:
   ```
   https://chatterbox-frontend.onrender.com
   ```

### Step 6: Update Backend CORS
Go back to **Backend Service** on Render:
1. Click on your backend service
2. Go to **"Environment"** tab
3. Update `CLIENT_URL`:
   ```
   CLIENT_URL=https://chatterbox-frontend.onrender.com
   ```
4. Click **"Save Changes"**
5. Backend will automatically redeploy

---

## Part 4: Testing Your Deployed App

### Test Backend:
```
https://chatterbox-backend.onrender.com
```
Should show: `{"message": "Real-time Chat API is running 🚀"}`

### Test Frontend:
```
https://chatterbox-frontend.onrender.com
```
Should show your ChatterBox login page

### Test Full Flow:
1. Open frontend URL
2. Register a new account
3. Login
4. Create a room
5. Send messages
6. Test real-time features

---

## 🎯 Important Notes

### Free Tier Limitations:
- **Spin Down**: Services sleep after 15 minutes of inactivity
- **Cold Start**: First request takes 30-50 seconds to wake up
- **750 Hours/Month**: Free tier limit per service

### Keep Services Active:
Use a service like **UptimeRobot** (free) to ping your backend every 14 minutes:
1. Go to: https://uptimerobot.com
2. Add monitor for: `https://chatterbox-backend.onrender.com`
3. Check interval: 5 minutes

### Environment Variables Security:
- Never commit `.env` files to GitHub
- Use Render's environment variables feature
- Rotate secrets regularly

---

## 🐛 Troubleshooting

### Backend Not Starting:
1. Check logs in Render dashboard
2. Verify MongoDB connection string
3. Check all environment variables
4. Ensure `npm start` works locally

### Frontend Not Loading:
1. Check build logs
2. Verify API URL is correct
3. Check browser console for errors
4. Ensure CORS is configured

### Database Connection Failed:
1. Verify MongoDB Atlas IP whitelist (0.0.0.0/0)
2. Check connection string format
3. Ensure password doesn't have special characters (or encode them)
4. Test connection string locally first

### CORS Errors:
1. Verify `CLIENT_URL` in backend environment variables
2. Check frontend URL matches exactly
3. Ensure no trailing slashes

### Socket.io Not Working:
1. Check WebSocket support on Render (should work)
2. Verify socket connection URL in frontend
3. Check browser console for socket errors

---

## 📝 Deployment Checklist

### Before Deployment:
- [ ] MongoDB Atlas database created
- [ ] Database user created with password
- [ ] IP whitelist set to 0.0.0.0/0
- [ ] Connection string saved
- [ ] Cloudinary account created (optional)

### Backend Deployment:
- [ ] Render account created
- [ ] Backend web service created
- [ ] Root directory set to `backend`
- [ ] All environment variables added
- [ ] Service deployed successfully
- [ ] Backend URL saved
- [ ] API endpoint tested

### Frontend Deployment:
- [ ] API URL updated in `frontend/src/api/axios.js`
- [ ] Changes committed and pushed
- [ ] Frontend web service created
- [ ] Root directory set to `frontend`
- [ ] Service deployed successfully
- [ ] Frontend URL saved
- [ ] Backend CORS updated with frontend URL

### Testing:
- [ ] Backend API responds
- [ ] Frontend loads
- [ ] User registration works
- [ ] Login works
- [ ] Real-time messaging works
- [ ] Socket.io connection works

---

## 🔄 Updating Your App

### Update Backend:
```bash
# Make changes in backend/
git add .
git commit -m "Update backend"
git push origin main
# Render auto-deploys from GitHub
```

### Update Frontend:
```bash
# Make changes in frontend/
git add .
git commit -m "Update frontend"
git push origin main
# Render auto-deploys from GitHub
```

### Manual Redeploy:
1. Go to Render dashboard
2. Select your service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 💰 Cost Breakdown

### Free Tier (What you'll use):
- **Render**: 750 hours/month per service (FREE)
- **MongoDB Atlas**: 512 MB storage (FREE)
- **Cloudinary**: 25 GB storage, 25 GB bandwidth (FREE)

### Total Cost: **₹0 / $0** 🎉

---

## 🚀 Your Deployed URLs

After deployment, you'll have:

**Backend API:**
```
https://chatterbox-backend.onrender.com
```

**Frontend App:**
```
https://chatterbox-frontend.onrender.com
```

**MongoDB:**
```
mongodb+srv://...mongodb.net/chatterbox
```

---

## 📚 Additional Resources

- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Socket.io Docs**: https://socket.io/docs/v4/

---

## 🆘 Need Help?

If you face issues:
1. Check Render logs (Dashboard → Service → Logs)
2. Check browser console (F12)
3. Verify all environment variables
4. Test locally first
5. Check MongoDB Atlas connection

---

**Your ChatterBox app will be live on Render! 🎉**

Good luck with deployment! 🚀
