# ✅ Vercel Deployment Checklist

## 📋 Pre-Deployment Status
- ✅ Code pushed to GitHub: `https://github.com/Zarwebcoders/rextoken.git`
- ✅ `.gitignore` updated to exclude `.env` files
- ✅ Environment variable examples created
- ✅ Deployment guides created

---

## 🚀 Next Steps: Deploy to Vercel

### Step 1: Deploy Backend API (5-10 minutes)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/new
   - Sign in with your GitHub account

2. **Import Repository**
   - Click "Import Git Repository"
   - Select: `Zarwebcoders/rextoken`
   - Click "Import"

3. **Configure Backend Project**
   ```
   Project Name: rex-token-api
   Framework Preset: Other
   Root Directory: server ⚠️ IMPORTANT - Click "Edit" and set to "server"
   Build Command: (leave empty)
   Output Directory: (leave empty)
   Install Command: npm install
   ```

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   MONGO_URI = mongodb+srv://b3ingsahil007:SahilRizzu218925@cluster0.4pkft4a.mongodb.net/rextoken
   JWT_SECRET = rextoken_secret_key_change_this_in_production
   NODE_ENV = production
   ```
   
   ⚠️ **IMPORTANT**: Change JWT_SECRET to a strong random value in production!
   Generate one with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (2-3 minutes)
   - **Copy the deployment URL** (e.g., `https://rex-token-api.vercel.app`)

6. **Verify Backend**
   - Visit: `https://your-api-url.vercel.app`
   - You should see: "REX Token API is running..."

---

### Step 2: Deploy Frontend (5-10 minutes)

1. **Import Repository Again**
   - Go to: https://vercel.com/new
   - Import the **same repository**: `Zarwebcoders/rextoken`

2. **Configure Frontend Project**
   ```
   Project Name: rex-token
   Framework Preset: Vite
   Root Directory: ./ (leave as root)
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   VITE_API_URL = https://rex-token-api.vercel.app
   ```
   (Replace with YOUR backend URL from Step 1)

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (2-3 minutes)
   - **Copy the deployment URL** (e.g., `https://rex-token.vercel.app`)

5. **Verify Frontend**
   - Visit: `https://your-app-url.vercel.app`
   - Test user registration/login
   - Check browser console for errors

---

## 🔍 Post-Deployment Verification

### Backend Checks
- [ ] Visit backend URL - shows "REX Token API is running..."
- [ ] Check Vercel logs for errors
- [ ] Verify MongoDB connection in logs
- [ ] Test API endpoint: `https://your-api.vercel.app/api/auth/login`

### Frontend Checks
- [ ] Visit frontend URL - app loads correctly
- [ ] No console errors related to API
- [ ] User registration works
- [ ] User login works
- [ ] All pages navigate correctly

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution**: 
- Go to MongoDB Atlas
- Network Access → Add IP Address
- Allow access from anywhere: `0.0.0.0/0`

### Issue: "CORS Error"
**Solution**:
- Verify `VITE_API_URL` in frontend environment variables
- Check backend CORS configuration
- Ensure backend is deployed and running

### Issue: "404 on page refresh"
**Solution**:
- Verify `vercel.json` exists in root directory
- Should contain rewrites configuration

### Issue: "Environment variables not working"
**Solution**:
- Redeploy after adding environment variables
- For frontend, ensure variables start with `VITE_`
- Check Vercel dashboard → Settings → Environment Variables

---

## 📝 Your Deployment URLs

Once deployed, update these:

```
Frontend: https://_____________________.vercel.app
Backend:  https://_____________________.vercel.app
```

---

## 🔄 Future Updates

To update your deployed app:

1. **Make changes locally**
2. **Commit and push to GitHub**:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
3. **Vercel will automatically redeploy** (both frontend and backend)

---

## 📚 Documentation

- **Full Deployment Guide**: See `DEPLOYMENT.md`
- **Project README**: See `README.md`
- **Vercel Docs**: https://vercel.com/docs

---

## 🎯 Quick Commands

```bash
# Check git status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub (triggers auto-deploy)
git push origin main

# View remote URL
git remote -v
```

---

## ✨ Success Criteria

Your deployment is successful when:
- ✅ Backend API responds at its Vercel URL
- ✅ Frontend loads without errors
- ✅ Users can register and login
- ✅ MongoDB connection is stable
- ✅ All API calls work correctly

---

**Good luck with your deployment! 🚀**

If you encounter any issues, refer to `DEPLOYMENT.md` for detailed troubleshooting.
