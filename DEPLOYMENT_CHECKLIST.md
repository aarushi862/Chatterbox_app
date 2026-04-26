# ✅ Render Deployment Checklist

## Quick Reference for Deployment

---

## 📋 Pre-Deployment

### MongoDB Atlas:
- [ ] Account created at https://mongodb.com/cloud/atlas
- [ ] FREE tier cluster created
- [ ] Database user created (username + password saved)
- [ ] IP whitelist set to 0.0.0.0/0
- [ ] Connection string copied and saved
- [ ] Connection string format:
  ```
  mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/chatterbox?retryWrites=true&w=majority
  ```

### Render Account:
- [ ] Account created at https://render.com
- [ ] Signed up with GitHub
- [ ] Repository access granted

---

## 🔧 Backend Deployment

### Service Configuration:
```
Name: chatterbox-backend
Region: Singapore / Mumbai
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

### Environment Variables:
```
PORT=5000

MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/chatterbox?retryWrites=true&w=majority

JWT_SECRET=your_super_secret_jwt_key_12345

CLIENT_URL=https://chatterbox-frontend.onrender.com

CLOUDINARY_CLOUD_NAME=your_cloud_name (optional)
CLOUDINARY_API_KEY=your_api_key (optional)
CLOUDINARY_API_SECRET=your_api_secret (optional)
```

### Verification:
- [ ] Service deployed successfully
- [ ] No errors in logs
- [ ] Backend URL saved: `https://chatterbox-backend.onrender.com`
- [ ] Test URL in browser shows: `{"message": "Real-time Chat API is running 🚀"}`

---

## 🎨 Frontend Deployment

### Before Deployment:
- [ ] Update `frontend/src/api/axios.js`:
  ```javascript
  baseURL: 'https://chatterbox-backend.onrender.com'
  ```
- [ ] Commit and push changes:
  ```bash
  git add .
  git commit -m "Update API URL for production"
  git push origin main
  ```

### Service Configuration:
```
Name: chatterbox-frontend
Region: Singapore / Mumbai (same as backend)
Branch: main
Root Directory: frontend
Runtime: Node
Build Command: npm install && npm run build
Start Command: npx vite preview --host 0.0.0.0 --port $PORT
Instance Type: Free
```

### Verification:
- [ ] Service deployed successfully
- [ ] No errors in build logs
- [ ] Frontend URL saved: `https://chatterbox-frontend.onrender.com`
- [ ] Login page loads in browser

---

## 🔄 Post-Deployment

### Update Backend CORS:
- [ ] Go to backend service on Render
- [ ] Navigate to "Environment" tab
- [ ] Update `CLIENT_URL` to frontend URL
- [ ] Save changes (auto-redeploys)

### Final Testing:
- [ ] Backend API responds: `https://chatterbox-backend.onrender.com`
- [ ] Frontend loads: `https://chatterbox-frontend.onrender.com`
- [ ] User registration works
- [ ] User login works
- [ ] Create room works
- [ ] Send message works
- [ ] Real-time messaging works
- [ ] Socket.io connection works
- [ ] No CORS errors in console

---

## 🚨 Common Issues & Solutions

### Issue: Backend not starting
**Solution:**
- Check Render logs for errors
- Verify MongoDB connection string
- Ensure all environment variables are set
- Check if MongoDB Atlas IP whitelist includes 0.0.0.0/0

### Issue: Frontend shows blank page
**Solution:**
- Check browser console (F12) for errors
- Verify API URL in `frontend/src/api/axios.js`
- Check if backend is running
- Clear browser cache

### Issue: CORS errors
**Solution:**
- Verify `CLIENT_URL` in backend matches frontend URL exactly
- No trailing slashes in URLs
- Redeploy backend after updating CORS

### Issue: Database connection failed
**Solution:**
- Check MongoDB Atlas connection string format
- Verify username and password
- Ensure IP whitelist is set to 0.0.0.0/0
- Check if password has special characters (encode them)

### Issue: Cold start (slow first request)
**Solution:**
- This is normal for free tier
- Use UptimeRobot to keep service active
- First request takes 30-50 seconds

---

## 📊 Deployment Status

### Backend:
- [ ] Deployed
- [ ] URL: `_______________________________`
- [ ] Status: ⚪ Pending / 🟢 Live / 🔴 Error

### Frontend:
- [ ] Deployed
- [ ] URL: `_______________________________`
- [ ] Status: ⚪ Pending / 🟢 Live / 🔴 Error

### Database:
- [ ] MongoDB Atlas configured
- [ ] Connection string: `_______________________________`
- [ ] Status: ⚪ Pending / 🟢 Connected / 🔴 Error

---

## 🔧 Maintenance

### Keep Services Active (Optional):
- [ ] Create UptimeRobot account: https://uptimerobot.com
- [ ] Add monitor for backend URL
- [ ] Set interval to 5 minutes
- [ ] Verify monitor is active

### Auto-Deploy from GitHub:
- [ ] Render auto-deploys on push to main branch
- [ ] Check "Auto-Deploy" is enabled in Render settings
- [ ] Test by making a small change and pushing

---

## 📝 Important URLs

| Service | URL | Status |
|---------|-----|--------|
| Backend API | `https://chatterbox-backend.onrender.com` | ⚪ |
| Frontend App | `https://chatterbox-frontend.onrender.com` | ⚪ |
| MongoDB Atlas | `https://cloud.mongodb.com` | ⚪ |
| Render Dashboard | `https://dashboard.render.com` | ⚪ |
| GitHub Repo | `https://github.com/aarushi862/Chatterbox_app` | ⚪ |

---

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ Backend responds with API message
- ✅ Frontend loads without errors
- ✅ User can register and login
- ✅ Messages send in real-time
- ✅ No console errors (except expected ones)
- ✅ Socket.io connects successfully

---

## 📚 Documentation

- **Detailed Guide**: `RENDER_DEPLOYMENT_GUIDE.md`
- **Hindi Guide**: `RENDER_DEPLOYMENT_HINDI.md`
- **This Checklist**: `DEPLOYMENT_CHECKLIST.md`

---

## 🆘 Need Help?

1. Check Render logs (Dashboard → Service → Logs)
2. Check browser console (F12)
3. Review environment variables
4. Test locally first
5. Read detailed guides

---

**Print this checklist and tick off items as you complete them!** ✅

Good luck with your deployment! 🚀
