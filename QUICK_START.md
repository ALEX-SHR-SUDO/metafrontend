# Quick Start - Production Deployment

## 🎯 TL;DR - What Was Fixed

Your frontend now connects to the production backend automatically!

**Backend URL**: `https://metabackend-c4e4.onrender.com` ✅

## 🚀 Deploy Now (2 Steps)

### Option 1: Auto-Deploy (Easiest)
If you have Vercel GitHub integration:
1. **Merge this PR** ✅
2. **Wait 2 minutes** - Vercel auto-deploys
3. **Done!** Visit https://metafrontend-ruddy.vercel.app/

### Option 2: Manual Deploy
```bash
# Deploy to Vercel
vercel --prod
```

That's it! No environment variables needed - it works out of the box.

## ✅ Verify It's Working

After deployment:
1. Visit https://metafrontend-ruddy.vercel.app/
2. Open DevTools Console (F12)
3. Try creating a token with an image
4. Should see **NO errors** about:
   - ❌ "Mixed Content"
   - ❌ "Cannot connect to backend"
   - ❌ "http://0.0.0.0:10000"

## 🧪 Local Development

Want to run locally?

```bash
# 1. Create .env.local
cp .env.example .env.local

# 2. Edit .env.local to use local backend
NEXT_PUBLIC_BACKEND_URL=http://0.0.0.0:10000

# 3. Start local backend first
cd ../metabackend
npm run dev

# 4. Start frontend
cd ../metafrontend
npm run dev
```

## 📚 Need More Details?

- **Full deployment guide**: See `DEPLOYMENT_GUIDE.md`
- **Backend configuration**: See `BACKEND_CONFIGURATION.md`

## 🐛 Quick Troubleshooting

### "Cannot connect to backend"
→ Backend might be sleeping (Render free tier). Wait 30-60 seconds.

### "Still seeing http://0.0.0.0:10000"
→ Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

### "CORS error"
→ Backend needs to allow `https://metafrontend-ruddy.vercel.app`

## ✨ What Changed

| File | Change |
|------|--------|
| `utils/pinata.ts` | Updated default backend URL to production |
| `.env.example` | Updated with production URL |
| `DEPLOYMENT_GUIDE.md` | Added comprehensive docs (NEW) |

## 🎉 You're All Set!

Your frontend and backend are now configured to work together. Just deploy and enjoy! 🚀

---

**Questions?** Check `DEPLOYMENT_GUIDE.md` for detailed troubleshooting and configuration options.
