# Vercel Deployment Guide for REX Token

## Overview
This project consists of two parts that need separate deployments:
1. **Backend API** (Express.js server in `/server` directory)
2. **Frontend App** (React + Vite in root directory)

---

## 🚀 Quick Deployment Steps

### Option A: Using Vercel CLI (Recommended)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Deploy Backend First

```bash
# Navigate to server directory
cd server

# Login to Vercel (first time only)
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? rex-token-api (or your choice)
# - Directory? ./ (current directory)
# - Override settings? No

# After deployment, note the URL (e.g., https://rex-token-api.vercel.app)
```

#### 3. Configure Backend Environment Variables

Go to Vercel Dashboard → Your Backend Project → Settings → Environment Variables

Add these variables:
```
MONGO_URI = mongodb+srv://your-username:your-password@cluster.mongodb.net/rextoken
JWT_SECRET = your-super-secret-jwt-key-change-this
NODE_ENV = production
```

Then redeploy:
```bash
vercel --prod
```

#### 4. Deploy Frontend

```bash
# Navigate back to root directory
cd ..

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? rex-token (or your choice)
# - Directory? ./ (current directory)
# - Override settings? No
```

#### 5. Configure Frontend Environment Variables

Go to Vercel Dashboard → Your Frontend Project → Settings → Environment Variables

Add this variable:
```
VITE_API_URL = https://rex-token-api.vercel.app
```
(Use the URL from step 2)

Then redeploy:
```bash
vercel --prod
```

---

### Option B: Using Vercel Dashboard (GitHub Integration)

#### 1. Push to GitHub

```bash
# Make sure you're in the root directory
cd a:\Downloads\REXToken 2\REXToken

# Check git status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Prepare for Vercel deployment"

# Push to GitHub
git push origin main
```

#### 2. Deploy Backend via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your `rextoken` repository
4. Configure:
   - **Project Name**: `rex-token-api`
   - **Framework Preset**: Other
   - **Root Directory**: `server` ⚠️ IMPORTANT
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
5. Add Environment Variables:
   ```
   MONGO_URI = your_mongodb_uri
   JWT_SECRET = your_jwt_secret
   NODE_ENV = production
   ```
6. Click "Deploy"
7. **Save the deployment URL** (e.g., `https://rex-token-api.vercel.app`)

#### 3. Deploy Frontend via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new) again
2. Import the **same repository** again
3. Configure:
   - **Project Name**: `rex-token`
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:
   ```
   VITE_API_URL = https://rex-token-api.vercel.app
   ```
   (Use the URL from Backend deployment)
5. Click "Deploy"

---

## 🔧 Configuration Files

### Backend (`server/vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node",
      "config": {
        "includeFiles": ["dist/**"]
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

### Frontend (`vercel.json`)
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

---

## ✅ Post-Deployment Checklist

### Backend Verification
- [ ] Visit `https://your-api.vercel.app` - Should show "REX Token API is running..."
- [ ] Test API endpoint: `https://your-api.vercel.app/api/auth/login`
- [ ] Check Vercel logs for any errors
- [ ] Verify MongoDB connection in logs

### Frontend Verification
- [ ] Visit `https://your-app.vercel.app`
- [ ] Check browser console for API connection errors
- [ ] Test user registration/login
- [ ] Verify all pages load correctly

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: "Cannot connect to MongoDB"
- **Solution**: Check MONGO_URI in environment variables
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Or add Vercel IPs to MongoDB whitelist

**Problem**: "Module not found"
- **Solution**: Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify
- Check Vercel build logs

### Frontend Issues

**Problem**: "API calls failing with CORS error"
- **Solution**: Verify VITE_API_URL is set correctly
- Check backend CORS configuration
- Ensure backend is deployed and running

**Problem**: "Environment variables not working"
- **Solution**: Vite requires `VITE_` prefix for env vars
- Redeploy after adding environment variables
- Check browser console for actual API URL being used

### General Issues

**Problem**: "404 on page refresh"
- **Solution**: Ensure `vercel.json` rewrites are configured
- For frontend, all routes should redirect to `/`

**Problem**: "Build failing"
- **Solution**: Check build logs in Vercel dashboard
- Verify `package.json` scripts
- Test build locally: `npm run build`

---

## 🔄 Updating Your Deployment

### Using Git (Automatic)
```bash
# Make your changes
git add .
git commit -m "Your changes"
git push origin main

# Vercel will automatically redeploy
```

### Using Vercel CLI (Manual)
```bash
# For backend
cd server
vercel --prod

# For frontend
cd ..
vercel --prod
```

---

## 📊 Monitoring

- **Vercel Dashboard**: Monitor deployments, logs, and analytics
- **MongoDB Atlas**: Monitor database performance
- **Browser DevTools**: Check for frontend errors

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use strong secrets** - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. **Enable MongoDB IP whitelist** - Or use strong passwords
4. **Use environment variables** - Never hardcode secrets
5. **Keep dependencies updated** - Run `npm audit` regularly

---

## 📝 Environment Variables Reference

### Backend (`server/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port (not used in Vercel) | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT tokens | `random-secret-key` |
| `NODE_ENV` | Environment mode | `production` |

### Frontend (`.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.vercel.app` |

---

## 🎯 Next Steps

1. ✅ Deploy backend to Vercel
2. ✅ Configure backend environment variables
3. ✅ Deploy frontend to Vercel
4. ✅ Configure frontend environment variables
5. ✅ Test the application
6. 🎉 Share your live URL!

---

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review this guide
3. Check MongoDB Atlas logs
4. Open an issue on GitHub

---

**Deployment URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-api.vercel.app`

Good luck with your deployment! 🚀
