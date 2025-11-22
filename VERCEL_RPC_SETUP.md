# Vercel RPC Configuration Guide

## Problem: RPC Warning Still Appears After Setting Environment Variables

If you've set `NEXT_PUBLIC_SOLANA_RPC_MAINNET` in Vercel but still see this warning:

```
⚠️ No custom RPC endpoint configured for mainnet!
Public endpoints have strict rate limits and may return 403 errors.
Set NEXT_PUBLIC_SOLANA_RPC_MAINNET in .env.local.
```

This guide will help you fix it.

## Why This Happens

Next.js embeds `NEXT_PUBLIC_*` environment variables into your client-side JavaScript **at build time**. This means:

1. Setting environment variables in Vercel AFTER a deployment won't affect the already-built code
2. You must **redeploy** after setting or changing environment variables
3. The environment variables must be set correctly for the deployment to pick them up

## Step-by-Step Solution

### Step 1: Get Your RPC Endpoint

First, get a free RPC endpoint from a provider:

**Recommended: Helius (Free Tier)**
1. Go to https://helius.dev
2. Sign up for a free account
3. Create a new project
4. Copy your RPC endpoint URL

Example URL format:
```
https://mainnet.helius-rpc.com/?api-key=your-actual-api-key-here
```

**Alternative: QuickNode**
1. Go to https://quicknode.com
2. Sign up and create an endpoint
3. Copy the endpoint URL

### Step 2: Configure Environment Variables in Vercel

1. **Open Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Select your project: `metafrontend`

2. **Navigate to Settings**
   - Click on "Settings" tab at the top
   - Select "Environment Variables" from the left sidebar

3. **Add the Environment Variable**
   
   Click "Add New" and enter:
   
   - **Name (Key)**: `NEXT_PUBLIC_SOLANA_RPC_MAINNET`
   - **Value**: Your full RPC URL (e.g., `https://mainnet.helius-rpc.com/?api-key=your-key`)
   - **Environment**: Select **ALL** environments (Production, Preview, and Development)
     - Or at minimum: **Production** if you only deploy to production

4. **Optional: Add Devnet RPC** (if you use devnet)
   
   Click "Add New" again:
   
   - **Name (Key)**: `NEXT_PUBLIC_SOLANA_RPC_DEVNET`
   - **Value**: Your devnet RPC URL (e.g., `https://devnet.helius-rpc.com/?api-key=your-key`)
   - **Environment**: Same as above

5. **Save the Variables**
   - Click "Save" to store your environment variables

### Step 3: Redeploy Your Application

**This is the critical step!** You MUST redeploy after adding environment variables.

**Option A: Trigger Redeploy from Vercel Dashboard**
1. Go to the "Deployments" tab
2. Find your latest deployment
3. Click the three dots (⋮) menu on the right
4. Select "Redeploy"
5. Make sure "Use existing Build Cache" is **UNCHECKED**
6. Click "Redeploy"

**Option B: Push a New Commit**
```bash
git commit --allow-empty -m "Trigger redeploy with RPC config"
git push
```

**Option C: Use Vercel CLI**
```bash
vercel --prod
```

### Step 4: Verify the Configuration

After redeployment completes (wait 2-3 minutes):

1. **Visit your deployed site**: `https://your-app.vercel.app`

2. **Open Browser DevTools**
   - Press F12 or Right-click → Inspect
   - Go to the "Console" tab

3. **Check for Success Message**
   
   When you load the app, you should see:
   ```
   Using custom mainnet RPC endpoint
   ```
   
   Instead of the warning:
   ```
   ⚠️ No custom RPC endpoint configured for mainnet!
   ```

4. **Test Functionality**
   - Connect your wallet
   - Try creating a token or performing transactions
   - You should NOT see any 403 errors

## Troubleshooting

### ❌ Still Seeing the Warning?

**Check 1: Verify Environment Variable is Set**
1. Go to Vercel → Settings → Environment Variables
2. Confirm `NEXT_PUBLIC_SOLANA_RPC_MAINNET` exists
3. Check that it's enabled for "Production" environment
4. Verify the value is complete and correct (including `?api-key=...`)

**Check 2: Verify Recent Deployment**
1. Go to Vercel → Deployments
2. Look at the most recent deployment timestamp
3. It should be AFTER you added the environment variables
4. If not, redeploy (see Step 3)

**Check 3: Check Build Logs**
1. Go to the latest deployment
2. Click on it to see details
3. Look at the "Build Logs"
4. Search for "NEXT_PUBLIC" to see what variables were available during build
5. You should see your RPC endpoint in the logs (Vercel shows environment variable names but not full values)

**Check 4: Clear Cache and Redeploy**
1. When redeploying, ensure "Use existing Build Cache" is UNCHECKED
2. This forces a fresh build with the new environment variables

### ❌ Getting 403 Errors?

Even with custom RPC:

**Check 1: Verify RPC Endpoint is Valid**
```bash
curl -X POST https://mainnet.helius-rpc.com/?api-key=YOUR_KEY \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

Expected response:
```json
{"jsonrpc":"2.0","result":"ok","id":1}
```

**Check 2: Check RPC Provider Dashboard**
1. Log in to your RPC provider (e.g., Helius)
2. Check your usage/quota
3. Verify your API key is active and not rate-limited

**Check 3: Try a Different RPC Provider**
- If Helius has issues, try QuickNode or Alchemy
- Update the environment variable in Vercel
- Redeploy

### ❌ Environment Variable Not Loading?

**Common Mistakes:**

1. **Wrong Variable Name**
   - Must be EXACTLY: `NEXT_PUBLIC_SOLANA_RPC_MAINNET`
   - Case-sensitive
   - Must start with `NEXT_PUBLIC_` for client-side access

2. **Wrong Environment Selected**
   - Make sure "Production" is checked if deploying to production
   - Or select "All" to cover all environments

3. **Not Redeploying After Setting Variable**
   - Environment variables only take effect AFTER a new build
   - You must redeploy

4. **Cached Build**
   - If using cached builds, environment variables might not update
   - Redeploy without cache

## Quick Verification Command

You can check if your environment variables are properly embedded in the deployed app:

1. Open your deployed site
2. Open DevTools Console
3. Run this command:
```javascript
console.log('MAINNET RPC:', process.env.NEXT_PUBLIC_SOLANA_RPC_MAINNET);
```

**Note**: In Next.js, `process.env` is replaced at build time, so this won't work in the browser. Instead, check the console logs when the app loads.

## Network Configuration

Make sure you're also setting the correct network:

```env
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
```

If you're on devnet:
```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_DEVNET=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
```

## Security Best Practices

✅ **Safe to Include in Frontend:**
- RPC endpoint URLs with API keys are designed to be used in frontend apps
- Rate limiting is handled by the RPC provider
- This is the standard practice for Web3 dApps

⚠️ **Additional Security:**
1. **Set up rate limiting** in your RPC provider dashboard
2. **Monitor usage** to detect unusual activity
3. **Rotate keys periodically** (every 3-6 months)
4. **Set up alerts** for high usage or errors

## Cost Considerations

**Free Tiers (Sufficient for Most Projects):**
- Helius: 100,000 requests/day
- QuickNode: 500,000 requests/month trial
- Alchemy: 300 million compute units/month

**When to Upgrade:**
- High traffic production app (>100k users)
- Frequent blockchain queries
- Real-time data requirements

## Summary Checklist

- [ ] Get RPC endpoint from provider (Helius/QuickNode/Alchemy)
- [ ] Add `NEXT_PUBLIC_SOLANA_RPC_MAINNET` to Vercel environment variables
- [ ] Select correct environment (Production/All)
- [ ] Save the environment variable
- [ ] **Redeploy the application** (CRITICAL STEP)
- [ ] Wait for deployment to complete (2-3 minutes)
- [ ] Verify in browser console: "Using custom mainnet RPC endpoint"
- [ ] Test wallet connection and transactions
- [ ] No 403 errors should appear

## Still Need Help?

If you've followed all steps and still have issues:

1. **Double-check** that the environment variable name is exactly `NEXT_PUBLIC_SOLANA_RPC_MAINNET`
2. **Verify** the RPC endpoint URL works by testing it with curl
3. **Confirm** you redeployed AFTER setting the environment variable
4. **Check** Vercel build logs for any errors
5. **Try** adding the variable to ALL environments (Production, Preview, Development)

## Related Documentation

- [RPC_CONFIGURATION.md](./RPC_CONFIGURATION.md) - General RPC configuration guide
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Full deployment guide
- [Vercel Environment Variables Docs](https://vercel.com/docs/projects/environment-variables)
- [Next.js Environment Variables Docs](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables)
