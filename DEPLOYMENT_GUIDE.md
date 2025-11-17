# Deployment Guide - Frontend Configuration

## ✅ Changes Applied

The frontend has been updated to connect to the production backend at:
```
https://metabackend-c4e4.onrender.com
```

### What Was Changed:
1. **`utils/pinata.ts`** - Updated default backend URL from `http://0.0.0.0:10000` to `https://metabackend-c4e4.onrender.com`
2. **`.env.example`** - Updated with production URL and added comments for clarity

## 🚀 Deploying to Vercel

### Option 1: Using Default Configuration (Recommended)
The code now uses the production backend by default. Simply deploy to Vercel:

```bash
# If you haven't already, install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Your app will automatically connect to `https://metabackend-c4e4.onrender.com`

### Option 2: Using Environment Variables (For Multiple Environments)

If you need different backend URLs for different environments:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `metafrontend`
   - Go to: Settings → Environment Variables

2. **Add Environment Variable**
   - **Name**: `NEXT_PUBLIC_BACKEND_URL`
   - **Value**: `https://metabackend-c4e4.onrender.com`
   - **Environment**: Select `Production` (or `All` if you want it for preview and development too)

3. **Redeploy**
   - Go to Deployments tab
   - Click on the three dots next to your latest deployment
   - Click "Redeploy"

## 🧪 Local Development

For local development, create a `.env.local` file:

```bash
# Create .env.local for local development
cp .env.example .env.local
```

Then edit `.env.local` to use your local backend:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_BACKEND_URL=http://0.0.0.0:10000
```

**Important**: Make sure your local backend is running before starting the frontend:

```bash
# In your metabackend directory
npm run dev
```

Then start the frontend:

```bash
# In your metafrontend directory
npm run dev
```

## 🔍 Verifying the Fix

### 1. Check Build Logs
After deploying to Vercel, check the build logs to ensure there are no errors.

### 2. Test in Browser
1. Visit your deployed app: `https://metafrontend-ruddy.vercel.app/`
2. Open DevTools (F12) → Console tab
3. Try creating a token with an image
4. Check Network tab - requests should go to `https://metabackend-c4e4.onrender.com`
5. Verify **no mixed content errors** appear

### 3. Test Backend Health
You can verify your backend is accessible:

```bash
curl https://metabackend-c4e4.onrender.com/health
```

Expected response:
```json
{"status":"ok"}
```

## 🐛 Troubleshooting

### Issue: Still seeing "http://0.0.0.0:10000" in errors

**Solution**: Clear Next.js cache and rebuild
```bash
rm -rf .next
npm run build
```

Then redeploy to Vercel.

### Issue: "Cannot connect to backend"

**Possible causes**:
1. Backend is down or sleeping (Render free tier apps sleep after inactivity)
2. Backend URL is incorrect

**Solutions**:
1. Check backend health endpoint:
   ```bash
   curl https://metabackend-c4e4.onrender.com/health
   ```
2. If backend is sleeping, wait 30-60 seconds for it to wake up
3. Check backend logs in Render dashboard

### Issue: CORS errors

**Solution**: Ensure your backend CORS configuration allows requests from:
- `https://metafrontend-ruddy.vercel.app`
- Your custom domain (if you have one)

Check `metabackend/src/server.ts` for CORS settings.

## 📋 Configuration Summary

| Environment | Backend URL | Configuration Method |
|-------------|-------------|----------------------|
| **Production (Vercel)** | `https://metabackend-c4e4.onrender.com` | Default in code (or Vercel env var) |
| **Local Development** | `http://0.0.0.0:10000` | `.env.local` file |
| **Preview/Staging** | Custom URL | Vercel env var |

## 🔐 Security Notes

✅ **What's Safe:**
- The backend URL is public - it's safe to hardcode in the frontend
- Environment variables starting with `NEXT_PUBLIC_` are exposed to the browser
- No sensitive data is stored in the frontend

⚠️ **What to Keep Secret:**
- Never put Pinata API keys in the frontend
- Keep wallet private keys secure
- Backend API keys stay in the backend only

## 📞 Need Help?

If you encounter issues:

1. **Check Backend Status**: Visit https://metabackend-c4e4.onrender.com/health
2. **Check Frontend Console**: Open DevTools and look for error messages
3. **Check Network Tab**: See what URL the frontend is trying to reach
4. **Verify Environment**: Make sure you're using the right environment variables

## 🎉 Success Criteria

You'll know everything is working when:
- ✅ No "Mixed Content" errors in the console
- ✅ No "Cannot connect to backend at http://0.0.0.0:10000" errors
- ✅ Image uploads succeed
- ✅ Token creation works end-to-end
- ✅ Network requests go to `https://metabackend-c4e4.onrender.com`

---

**Ready to deploy!** 🚀 Your frontend is now configured to work with the production backend.
