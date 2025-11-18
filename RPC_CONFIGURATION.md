# RPC Configuration Guide

## Understanding the 403 Error

If you see errors like:
```
Failed to load resource: the server responded with a status of 403
Error: 403 : {"jsonrpc":"2.0","error":{"code": 403, "message":"Access forbidden"}, "id": "..."}
```

This means the public Solana RPC endpoints are rate-limiting your requests. The free public endpoints have limited capacity and can block requests when overloaded.

## Solution: Use Custom RPC Endpoints

To avoid 403 errors and get better performance, you should use a custom RPC endpoint from a dedicated RPC provider.

### Recommended RPC Providers

1. **Helius** (Recommended)
   - Website: https://helius.dev
   - Free tier available
   - Fast and reliable
   - Easy setup

2. **QuickNode**
   - Website: https://quicknode.com
   - Free trial available
   - Enterprise-grade performance

3. **Alchemy**
   - Website: https://alchemy.com
   - Free tier available
   - Good developer experience

4. **RPCPool**
   - Website: https://rpcpool.com
   - Dedicated to Solana
   - High performance

### Setup Instructions

#### Step 1: Get Your RPC Endpoint

1. Sign up for an account with your preferred RPC provider (e.g., Helius)
2. Create a new project/API key
3. Copy your RPC endpoint URL

Example Helius URLs:
- Mainnet: `https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY`
- Devnet: `https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY`

#### Step 2: Configure Environment Variables

Create a `.env.local` file in your project root (if it doesn't exist already):

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your custom RPC endpoints:

```env
# Solana Network
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta

# Custom RPC Endpoints (prevents 403 errors)
NEXT_PUBLIC_SOLANA_RPC_MAINNET=https://mainnet.helius-rpc.com/?api-key=YOUR_MAINNET_API_KEY
NEXT_PUBLIC_SOLANA_RPC_DEVNET=https://devnet.helius-rpc.com/?api-key=YOUR_DEVNET_API_KEY

# Backend API URL
NEXT_PUBLIC_BACKEND_URL=https://metabackend-c4e4.onrender.com
```

#### Step 3: Restart Your Development Server

```bash
npm run dev
```

### How It Works

The application will automatically:
1. Check if custom RPC endpoints are configured
2. Use custom endpoints if available
3. Fall back to public endpoints if not configured (may experience 403 errors)

When you start the app, check the browser console. You should see:
- `"Using custom mainnet RPC endpoint"` or `"Using custom devnet RPC endpoint"` if configured
- `"Using public RPC endpoint (may have rate limits)"` if using defaults

### Deployment Configuration

#### Vercel

1. Go to your project settings on Vercel
2. Navigate to "Environment Variables"
3. Add the following variables:
   - `NEXT_PUBLIC_SOLANA_RPC_MAINNET`
   - `NEXT_PUBLIC_SOLANA_RPC_DEVNET`
4. Redeploy your application

#### Other Platforms

For other hosting platforms, set the environment variables according to their documentation:
- Netlify: Site settings → Environment variables
- Render: Environment tab in your service
- Railway: Variables tab
- AWS/Azure/GCP: Set through their respective configuration interfaces

### Security Notes

⚠️ **Important Security Considerations:**

1. **API Keys in URLs**: Some RPC providers include API keys in the URL. While these are exposed in the browser (frontend apps), this is normal for frontend applications.

2. **Rate Limiting**: Set up rate limiting in your RPC provider's dashboard to prevent abuse.

3. **Environment Variables**: Never commit `.env.local` to version control. It's already in `.gitignore`.

4. **Key Rotation**: Rotate your API keys periodically for security.

5. **Monitoring**: Most RPC providers offer dashboards to monitor usage and set up alerts.

### Troubleshooting

#### Still Getting 403 Errors?

1. **Check Environment Variables**: Ensure they're set correctly and the app is restarted
2. **Verify API Key**: Make sure your API key is valid and not expired
3. **Check Console Logs**: Look for "Using custom" vs "Using public" messages
4. **Check RPC Provider Dashboard**: Verify you haven't exceeded your plan's limits
5. **Try Different Provider**: If one provider is having issues, try another

#### RPC Endpoint Not Working?

1. Test the endpoint directly:
```bash
curl -X POST YOUR_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

2. Check the response - it should return `{"jsonrpc":"2.0","result":"ok","id":1}`

#### Environment Variables Not Loading?

1. Make sure the file is named `.env.local` (not `.env`)
2. Restart your development server completely
3. Check that variable names start with `NEXT_PUBLIC_` (required for Next.js client-side access)
4. Verify the file is in the project root directory

### Performance Tips

1. **Use Regional Endpoints**: Some providers offer region-specific endpoints for better latency
2. **Enable Caching**: Configure caching in your RPC provider dashboard
3. **Monitor Usage**: Keep track of your request count to optimize if needed
4. **Upgrade Plans**: Consider paid plans for production apps with high traffic

### Cost Considerations

Most RPC providers offer:
- **Free Tier**: Good for development and testing (usually 100k-500k requests/day)
- **Pay-as-you-go**: ~$0.50-$1 per million requests
- **Fixed Plans**: $50-$500/month for dedicated resources

For production applications, budget for RPC costs as part of your infrastructure expenses.

## Additional Resources

- [Helius Documentation](https://docs.helius.dev/)
- [QuickNode Documentation](https://www.quicknode.com/docs/solana)
- [Solana RPC API Documentation](https://docs.solana.com/api)
- [Best Practices for Solana dApps](https://docs.solana.com/developing/programming-model/transactions#best-practices)
