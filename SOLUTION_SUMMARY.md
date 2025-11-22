# Solution Summary: RPC Configuration for Vercel Deployment

## Problem Statement

Users reported seeing this warning even after setting `NEXT_PUBLIC_SOLANA_RPC_MAINNET` in Vercel:

```
⚠️ No custom RPC endpoint configured for mainnet!
Public endpoints have strict rate limits and may return 403 errors.
Set NEXT_PUBLIC_SOLANA_RPC_MAINNET in .env.local.
```

The user's comment "moi rpc lezit v envoirment na vercel" (my RPC is set in environment on Vercel) indicated they had already configured the environment variable but were still seeing the warning.

## Root Cause

Next.js embeds `NEXT_PUBLIC_*` environment variables into the client-side JavaScript bundle **at build time**. This means:

1. Environment variables set in Vercel are only used during the build process
2. If you set an environment variable **after** a deployment, the already-built code won't have it
3. The application **must be redeployed** after setting or changing environment variables
4. Simply setting the variable in Vercel is not enough - you must trigger a new build

## Solution Implemented

This PR implements a comprehensive multi-layer solution to guide users through proper RPC configuration on Vercel:

### 1. Build-Time Validation (`scripts/check-env.js`)

**What it does:**
- Automatically runs before every build (via npm prebuild script)
- Detects when building for mainnet without a custom RPC endpoint
- Displays a prominent warning with platform-specific instructions
- Shows success message when properly configured

**Example output when misconfigured:**
```
============================================================
🔍 Environment Configuration Check
============================================================

Network: mainnet-beta
Mainnet RPC: ❌ Not configured

⚠️  WARNING: Building for MAINNET without custom RPC endpoint!

Public Solana RPC endpoints are heavily rate-limited and WILL cause
403 errors during token operations on mainnet.

RECOMMENDED ACTION:

1. Get a FREE RPC endpoint:
   • Helius: https://helius.dev (Recommended)
   • QuickNode: https://quicknode.com

2. Set environment variable in your deployment platform:
   NEXT_PUBLIC_SOLANA_RPC_MAINNET=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY

3. For Vercel:
   • Go to Project Settings → Environment Variables
   • Add NEXT_PUBLIC_SOLANA_RPC_MAINNET
   • REDEPLOY after setting (critical!)
   • See VERCEL_RPC_SETUP.md for detailed instructions
```

### 2. Runtime Warnings (Updated Components)

**WalletContextProvider.tsx:**
- Enhanced console.warn() message
- Clear distinction between Vercel and local development
- Explicit mention of redeployment requirement

**RpcWarning.tsx:**
- Updated UI banner component
- Separate instructions for Vercel deployment vs local development
- Links to the new Vercel-specific setup guide

### 3. Comprehensive Documentation

**VERCEL_RPC_SETUP.md** (New file):
- **Why environment variables need redeployment** - Clear explanation of Next.js behavior
- **Step-by-step Vercel instructions** - Detailed walkthrough with emphasis on redeployment
- **Troubleshooting section** - Common issues and solutions
- **Verification steps** - How to confirm the configuration is working
- **Quick verification command** - How to check if RPC is configured

**README.md** (Updated):
- New "Deploying to Vercel" section
- Critical warning about redeployment requirement
- Direct link to VERCEL_RPC_SETUP.md

**DEPLOYMENT_GUIDE.md** (Updated):
- Added critical RPC configuration section at the top
- Emphasis on Vercel environment variable setup
- Note about unchecking "Use existing Build Cache" when redeploying

## Files Changed

### New Files
1. `VERCEL_RPC_SETUP.md` - Vercel-specific setup guide (8,604 characters)
2. `scripts/check-env.js` - Build-time environment validation script
3. `SOLUTION_SUMMARY.md` - This document

### Modified Files
1. `README.md` - Added Vercel deployment section
2. `components/RpcWarning.tsx` - Updated UI warning with Vercel guidance
3. `components/WalletContextProvider.tsx` - Enhanced console warnings
4. `package.json` - Added prebuild script
5. `DEPLOYMENT_GUIDE.md` - Added RPC configuration emphasis

## How It Helps Users

### Before This PR
- Users set environment variables in Vercel
- Didn't realize they need to redeploy
- Still saw warnings and experienced 403 errors
- No clear guidance on what went wrong

### After This PR
- **Build-time check** alerts users immediately if RPC is not configured
- **Runtime warnings** distinguish between Vercel and local setup
- **Documentation** explicitly emphasizes the redeployment requirement multiple times
- **Troubleshooting guide** helps users verify their configuration
- **Multiple touchpoints** ensure users see the guidance at various stages

## Usage Instructions for Users

### For Vercel Deployment (Production)

1. **Get a free RPC endpoint:**
   - Sign up at https://helius.dev or https://quicknode.com
   - Create a project and copy the API endpoint URL

2. **Configure in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `NEXT_PUBLIC_SOLANA_RPC_MAINNET` = `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`
   - Select "Production" environment (or "All")
   - Save

3. **CRITICAL: Redeploy the application:**
   - Go to Deployments tab
   - Click the three dots (⋮) on the latest deployment
   - Click "Redeploy"
   - Ensure "Use existing Build Cache" is **UNCHECKED**

4. **Verify:**
   - Visit your deployed site
   - Open browser DevTools → Console
   - Look for: "Using custom mainnet RPC endpoint" ✅
   - Should NOT see: "⚠️ No custom RPC endpoint configured"

### For Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your RPC endpoint:
   ```env
   NEXT_PUBLIC_SOLANA_RPC_MAINNET=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
   ```

3. Restart development server:
   ```bash
   npm run dev
   ```

## Key Insights for Developers

1. **Next.js behavior:** `process.env.NEXT_PUBLIC_*` variables are replaced at build time in client-side code. They are NOT loaded at runtime.

2. **Vercel deployment:** Setting environment variables in Vercel makes them available during the build, but requires a new deployment to take effect.

3. **Cache considerations:** When redeploying after setting environment variables, it's important to disable build cache to ensure a fresh build with the new variables.

4. **Multi-layer approach:** Combining build-time checks, runtime warnings, and comprehensive documentation ensures users are guided regardless of when they encounter the issue.

## Testing

✅ Build tested with various configurations:
- Devnet (default) - Shows informational message
- Mainnet without RPC - Shows prominent warning
- Mainnet with RPC - Shows success message

✅ Code quality:
- All builds successful
- No TypeScript errors
- CodeQL security scan: 0 vulnerabilities

✅ Documentation:
- Comprehensive step-by-step guides
- Clear troubleshooting sections
- Multiple entry points for users to find help

## Impact

This solution directly addresses the user's issue by:
1. **Educating** about Next.js environment variable behavior
2. **Guiding** through the correct Vercel configuration process
3. **Emphasizing** the critical redeployment step
4. **Validating** the configuration at build time
5. **Providing** clear verification steps

Users who follow the updated documentation will successfully configure their RPC endpoints and avoid 403 errors on mainnet.

## References

- Original issue: "moi rpc lezit v envoirment na vercel" (RPC set in Vercel environment)
- Next.js docs: https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables
- Vercel docs: https://vercel.com/docs/projects/environment-variables

## Future Improvements

Potential enhancements (not included in this PR):
1. Runtime environment variable loading (would require server-side API route)
2. Interactive setup wizard for Vercel deployment
3. GitHub Actions workflow to validate environment variables in CI/CD
4. Vercel integration app to automate RPC configuration
