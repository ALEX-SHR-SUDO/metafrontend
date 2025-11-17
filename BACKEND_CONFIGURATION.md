# Backend URL Configuration Guide

This guide explains how to configure the backend URL for the frontend application.

## 📍 Why This Matters

The frontend needs to know where the backend API is running to:
- Upload token logos to IPFS
- Upload token metadata to IPFS
- Verify backend health

**This is the most important configuration when using separated repositories!**

## Configuration Locations

### 1. Environment Variable

#### For Local Development

**File**: `.env.local` (create this file in the metafrontend directory)

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

**Steps**:
1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```
2. The default value should work for local development
3. If your backend runs on a different port, update the URL

#### For Production (Vercel)

**Location**: Vercel Dashboard → Project Settings → Environment Variables

**Variable Name**: `NEXT_PUBLIC_BACKEND_URL`

**Example Values**:
- Render: `https://metabackend.onrender.com`
- Railway: `https://metabackend.railway.app`
- Your custom domain: `https://api.yourdomain.com`

**Steps**:
1. Go to your Vercel project dashboard
2. Navigate to: Settings → Environment Variables
3. Click "Add New"
4. Set:
   - **Name**: `NEXT_PUBLIC_BACKEND_URL`
   - **Value**: Your deployed backend URL (e.g., `https://metabackend.onrender.com`)
   - **Environment**: Production (or All)
5. Save and redeploy your frontend

### 2. Code Reference

The backend URL is used in the code at:

**File**: `utils/pinata.ts`

**Line 5**:
```typescript
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
```

This line reads the environment variable and falls back to `http://localhost:3001` if not set.

## API Endpoints Used

The frontend makes requests to these backend endpoints:

| Endpoint | Method | Purpose | Used For |
|----------|--------|---------|----------|
| `/health` | GET | Health check | Verifying backend is running |
| `/api/upload-image` | POST | Upload logo to IPFS | Token logo upload |
| `/api/upload-metadata` | POST | Upload metadata to IPFS | Token metadata upload |

## Testing Your Configuration

### Test Locally

1. **Start Backend**:
   ```bash
   cd metabackend
   npm run dev
   ```
   Backend should be running on http://localhost:3001

2. **Test Backend Health**:
   ```bash
   curl http://localhost:3001/health
   ```
   Should return: `{"status":"ok"}`

3. **Start Frontend**:
   ```bash
   cd metafrontend
   npm run dev
   ```
   Frontend should be running on http://localhost:3000

4. **Test in Browser**:
   - Open http://localhost:3000
   - Open DevTools (F12) → Network tab
   - Try uploading a token logo
   - Check that requests are made to `http://localhost:3001/api/upload-image`

### Test Production

1. **Test Backend**:
   ```bash
   curl https://your-backend.onrender.com/health
   ```
   Should return: `{"status":"ok"}`

2. **Test Frontend**:
   - Visit your deployed frontend
   - Open DevTools (F12) → Network tab
   - Try uploading a token logo
   - Verify requests go to your production backend URL

## Environment-Specific Configuration

### Development
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### Staging/Testing
```env
NEXT_PUBLIC_BACKEND_URL=https://staging-backend.onrender.com
```

### Production
```env
NEXT_PUBLIC_BACKEND_URL=https://metabackend.onrender.com
```

## Troubleshooting

### ❌ "Failed to upload image"

**Possible Causes**:
1. Backend is not running
2. Backend URL is incorrect
3. CORS is not configured properly

**Solutions**:
1. Verify backend is running:
   ```bash
   curl http://localhost:3001/health
   ```
2. Check the backend URL in `.env.local`:
   ```bash
   cat .env.local
   ```
3. Check browser console for exact error message
4. Verify backend logs for CORS errors

### ❌ "CORS policy blocked"

**Solution**:
1. Ensure backend has CORS enabled (it should by default)
2. For production, verify your frontend domain is allowed in backend CORS configuration
3. Check `metabackend/src/server.ts` CORS settings

### ❌ Backend URL not updating

**Solution**:
1. Clear Next.js cache:
   ```bash
   rm -rf .next
   ```
2. Rebuild:
   ```bash
   npm run build
   ```
3. Restart dev server:
   ```bash
   npm run dev
   ```
4. Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)

### ❌ Environment variable not working

**Checklist**:
- [ ] File is named exactly `.env.local` (not `.env.local.txt`)
- [ ] Variable name is exactly `NEXT_PUBLIC_BACKEND_URL` (case-sensitive)
- [ ] Variable starts with `NEXT_PUBLIC_` (required for client-side access)
- [ ] No extra spaces around the `=` sign
- [ ] Backend URL doesn't have a trailing slash
- [ ] Server was restarted after changing `.env.local`

## Quick Reference

| Environment | File/Location | Example Value |
|-------------|---------------|---------------|
| **Local** | `.env.local` | `http://localhost:3001` |
| **Production** | Vercel Dashboard | `https://metabackend.onrender.com` |
| **Code** | `utils/pinata.ts` line 5 | Read from env variable |

## Security Notes

✅ **Safe**: The backend URL is safe to expose (it's public anyway)
✅ **NEXT_PUBLIC_**: Prefix makes it available to browser code
✅ **No secrets**: Never put API keys or secrets here
✅ **Backend secrets**: Pinata API keys stay in backend only

## Need More Help?

- **Frontend setup**: See `README.md`
- **Backend setup**: See `metabackend/README.md`
- **Backend deployment**: See `metabackend/DEPLOYMENT.md`
- **General guide**: See root `SEPARATION_GUIDE.md`

---

**Remember**: Always configure `NEXT_PUBLIC_BACKEND_URL` when deploying to production! 🚀
