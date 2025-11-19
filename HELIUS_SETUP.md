# Helius RPC Configuration

This document describes the Helius RPC API key configuration for the metafrontend application.

## What Was Configured

The application has been configured with a custom Helius RPC endpoint for Solana mainnet operations. This configuration prevents the common "403 Access Forbidden" errors that occur when using public RPC endpoints.

## Configuration Details

### Environment Variables

The following environment variables have been set in `.env.local`:

- **NEXT_PUBLIC_SOLANA_NETWORK**: `mainnet-beta`
  - The application is configured to use Solana mainnet
  
- **NEXT_PUBLIC_SOLANA_RPC_MAINNET**: `https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY`
  - Custom Helius RPC endpoint with API key for mainnet
  - Note: The actual API key is stored securely in `.env.local` (not committed to git)

- **NEXT_PUBLIC_BACKEND_URL**: `https://metabackend-c4e4.onrender.com`
  - Backend service for IPFS uploads via Pinata

### File Structure

```
.env.example  - Template with placeholder values (committed to git)
.env.local    - Actual configuration with real API key (ignored by git)
```

## Security Considerations

### ✅ Proper Security Measures in Place

1. **`.env.local` is in `.gitignore`**: The file containing the actual API key will never be committed to version control.

2. **Frontend API Key Exposure**: While the API key is exposed in the browser (as it's used in a Next.js frontend), this is normal and expected for frontend applications. The key should have rate limits configured on the Helius dashboard.

3. **Rate Limiting**: It's recommended to configure rate limits and usage alerts in your Helius dashboard at https://dashboard.helius.dev

### 🔒 Recommended Security Practices

1. **Monitor API Usage**: Regularly check your Helius dashboard for unexpected usage patterns
   - Set up usage alerts
   - Monitor daily/monthly request counts

2. **Rotate Keys Periodically**: For production use, rotate your API keys every 3-6 months

3. **Set Up Rate Limits**: Configure appropriate rate limits in your Helius dashboard to prevent abuse

4. **Use Domain Restrictions**: If Helius supports it, restrict API key usage to your specific domains

## Usage

The application will automatically use the configured RPC endpoint when:
- Network is set to `mainnet-beta`
- `NEXT_PUBLIC_SOLANA_RPC_MAINNET` environment variable is set

You should see this message in the browser console when the app starts:
```
Using custom mainnet RPC endpoint
```

## Testing

To verify the configuration is working:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the browser console at http://localhost:3000

3. Look for the message: "Using custom mainnet RPC endpoint"

4. Perform a token operation (create token or add metadata)

5. Verify no "403 Access Forbidden" errors occur

## Benefits

With this configuration, you'll experience:
- ✅ No more 403 errors from public RPC endpoints
- ✅ Better performance and reliability
- ✅ Higher rate limits (Helius free tier typically offers 100k requests/day)
- ✅ Access to Helius enhanced APIs (if needed)

## Troubleshooting

### Still Getting 403 Errors?

1. Verify `.env.local` exists in the project root
2. Check that the file contains the correct API key
3. Restart the development server (`npm run dev`)
4. Clear browser cache and reload
5. Check the Helius dashboard for API key status

### API Key Not Working?

1. Verify the API key is active in your Helius dashboard
2. Check if you've exceeded your plan's rate limits
3. Try regenerating the API key in Helius dashboard
4. Verify the network (mainnet vs devnet) matches your configuration

## Additional Resources

- [Helius Documentation](https://docs.helius.dev/)
- [Helius Dashboard](https://dashboard.helius.dev)
- [RPC Configuration Guide](./RPC_CONFIGURATION.md)
- [Solana RPC API Reference](https://docs.solana.com/api)

## Support

For issues with:
- **Helius API**: Contact Helius support at https://helius.dev
- **This Application**: Open an issue on GitHub or refer to other documentation files

---

**Last Updated**: November 2025  
**Configuration Date**: November 19, 2025
