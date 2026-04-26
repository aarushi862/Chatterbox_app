# GitHub Pages Deployment Guide

## ✅ Deployment Completed!

Your ChatterBox app is now configured for GitHub Pages deployment.

### 🌐 Live URL
**https://aarushi862.github.io/Chatterbox_app/**

---

## What Was Done

### 1. Updated `vite.config.js`
Added `base: '/Chatterbox_app/'` to ensure all asset paths work correctly on GitHub Pages:

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/Chatterbox_app/', // ✅ Added for GitHub Pages
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
```

### 2. Built the Project
```bash
npm run build
```
This generated the `dist/` folder with optimized production files.

### 3. Updated `.gitignore`
Commented out `dist` so the build folder is tracked by Git:
```
# dist folder is needed for GitHub Pages deployment
# dist
```

### 4. Created `.nojekyll` File
Added `dist/.nojekyll` to prevent GitHub Pages from ignoring files starting with underscore.

### 5. Set Up GitHub Actions
Created `.github/workflows/deploy.yml` for automatic deployment on every push to main branch.

---

## GitHub Pages Configuration

### Enable GitHub Pages:
1. Go to your repository: https://github.com/aarushi862/Chatterbox_app
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - **Source**: GitHub Actions (recommended)
   - OR **Deploy from a branch**: `main` branch, `/dist` folder

### Using GitHub Actions (Recommended):
The workflow file will automatically:
- Build your project on every push
- Deploy to GitHub Pages
- No manual steps needed!

### Manual Deployment (Alternative):
If you prefer manual deployment:
1. Go to Settings → Pages
2. Select **Deploy from a branch**
3. Choose `main` branch
4. Select `/dist` folder
5. Click Save

---

## Project Structure

```
ChatterBox/
├── dist/                    # ✅ Production build (deployed to GitHub Pages)
│   ├── assets/             # Bundled CSS and JS
│   ├── index.html          # Entry point
│   ├── favicon.svg
│   ├── icons.svg
│   └── .nojekyll           # Prevents Jekyll processing
├── src/                    # Source code
├── public/                 # Static assets
├── backend/                # Backend code (not deployed)
├── vite.config.js          # ✅ Updated with base path
├── package.json
└── .github/workflows/      # ✅ Auto-deployment workflow
    └── deploy.yml
```

---

## Important Notes

### ⚠️ Backend API
The frontend is deployed to GitHub Pages, but the **backend is NOT deployed**. 

GitHub Pages only serves static files (HTML, CSS, JS). Your backend needs to be deployed separately to a service like:
- **Render** (https://render.com)
- **Railway** (https://railway.app)
- **Heroku** (https://heroku.com)
- **Vercel** (for serverless functions)
- **AWS/Azure/GCP**

### 🔧 Update API URL
Once you deploy the backend, update the API URL in `src/api/axios.js`:

```javascript
const api = axios.create({
  baseURL: 'https://your-backend-url.com', // Update this!
  headers: {
    'Content-Type': 'application/json',
  },
});
```

---

## Rebuilding and Redeploying

### Manual Rebuild:
```bash
# 1. Make your changes
# 2. Build the project
npm run build

# 3. Commit and push
git add .
git commit -m "Update build"
git push origin main
```

### Automatic Rebuild (with GitHub Actions):
Just push your changes to the main branch:
```bash
git add .
git commit -m "Your changes"
git push origin main
```
GitHub Actions will automatically build and deploy!

---

## Troubleshooting

### Blank Page Issue
✅ **Fixed!** The base path is now set correctly.

If you still see a blank page:
1. Check browser console for errors (F12)
2. Verify GitHub Pages is enabled in Settings
3. Wait 2-3 minutes for deployment to complete
4. Clear browser cache (Ctrl+Shift+R)

### 404 Errors on Assets
✅ **Fixed!** All asset paths now include `/Chatterbox_app/` prefix.

### API Calls Failing
This is expected! Deploy your backend separately and update the API URL.

### GitHub Actions Not Running
1. Go to Settings → Actions → General
2. Ensure "Allow all actions and reusable workflows" is selected
3. Check the Actions tab for build logs

---

## Testing Locally

### Development Mode:
```bash
npm run dev
```
Opens at http://localhost:5173

### Production Build Locally:
```bash
npm run build
npm run preview
```
Opens at http://localhost:4173

---

## Deployment Checklist

- ✅ `vite.config.js` has `base: '/Chatterbox_app/'`
- ✅ Project built with `npm run build`
- ✅ `dist/` folder exists and contains files
- ✅ `.nojekyll` file created in `dist/`
- ✅ `.gitignore` allows `dist/` folder
- ✅ Changes committed and pushed to GitHub
- ✅ GitHub Actions workflow created
- ✅ GitHub Pages enabled in repository settings
- ⏳ Backend deployed separately (TODO)
- ⏳ API URL updated in frontend (TODO)

---

## Next Steps

### 1. Deploy Backend
Choose a hosting service and deploy your backend:

**Render (Recommended - Free Tier):**
```bash
# 1. Create account at render.com
# 2. New Web Service
# 3. Connect GitHub repo
# 4. Build Command: cd backend && npm install
# 5. Start Command: cd backend && npm start
# 6. Add environment variables (MONGO_URI, JWT_SECRET, etc.)
```

### 2. Update Frontend API URL
In `src/api/axios.js`:
```javascript
const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'https://your-backend.onrender.com',
  // ...
});
```

### 3. Add Environment Variables
Create `.env` file:
```
VITE_API_URL=https://your-backend.onrender.com
```

### 4. Rebuild and Deploy
```bash
npm run build
git add .
git commit -m "Update API URL"
git push origin main
```

---

## Support

If you encounter issues:
1. Check the [GitHub Actions logs](https://github.com/aarushi862/Chatterbox_app/actions)
2. Verify [GitHub Pages settings](https://github.com/aarushi862/Chatterbox_app/settings/pages)
3. Check browser console for errors
4. Review this guide

---

## Summary

✅ **Frontend Deployed**: https://aarushi862.github.io/Chatterbox_app/
⏳ **Backend**: Deploy separately to Render/Railway/Heroku
🔄 **Auto-Deploy**: Enabled via GitHub Actions

Your ChatterBox frontend is now live on GitHub Pages! 🎉
