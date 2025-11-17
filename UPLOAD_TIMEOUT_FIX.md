# Upload Timeout Fix

## Problem
Users were experiencing timeout errors when uploading token logos and metadata to the backend:

```
Error uploading to Pinata: AbortError: signal is aborted without reason
Error creating token: Error: Upload timeout: Backend at https://metabackend-c4e4.onrender.com 
did not respond within 30 seconds. Please check your connection and try again.
```

## Root Causes

1. **Cold Start Delays**: Free-tier hosting services (like Render) put inactive servers to sleep after 15 minutes of inactivity. When the first request comes in, the server needs 10-30 seconds to wake up ("cold start"), which was longer than our 30-second timeout.

2. **Large File Uploads**: Uploading large logo images (especially high-resolution PNGs) to Pinata IPFS can take 20-40 seconds depending on network conditions.

3. **Network Variability**: Internet connection speeds and network latency vary greatly, sometimes causing uploads to take longer than expected.

## Solution Implemented

### 1. Increased Timeout Duration
- **Before**: 30 seconds
- **After**: 90 seconds
- **Reason**: Allows enough time for cold starts (30s) plus file upload (60s)

### 2. Added Retry Logic
- **Retries**: Up to 2 automatic retries for failed requests
- **Strategy**: Exponential backoff (1s, 2s delays between retries)
- **Behavior**: Only retries on network errors, not on timeouts
- **Benefit**: Handles transient network issues without user intervention

### 3. Improved Error Messages
- **Before**: Generic "Upload timeout" message
- **After**: Contextual messages that explain:
  - The server might be starting up
  - File might be large
  - Suggests waiting a moment and trying again
  - Provides the timeout duration (90 seconds)

## Technical Changes

### File: `utils/pinata.ts`

#### Constants Added
```typescript
const UPLOAD_TIMEOUT = 90000; // 90 seconds
const MAX_RETRIES = 2;
```

#### New Helper Function
```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = MAX_RETRIES
): Promise<Response>
```

This function:
- Attempts the request up to 3 times (initial + 2 retries)
- Uses exponential backoff between retries
- Doesn't retry timeout errors (AbortError)
- Logs retry attempts for debugging

#### Updated Functions
Both `uploadImageToPinata()` and `uploadMetadataToPinata()` now:
- Use the 90-second timeout
- Use `fetchWithRetry()` instead of direct `fetch()`
- Provide more informative error messages

## Expected Behavior

### First Upload After Inactivity (Cold Start)
1. User uploads logo
2. Request sent to backend
3. Backend wakes up (takes 10-30 seconds)
4. Backend processes request
5. Success! (within 90 seconds)

### Subsequent Uploads (Warm Server)
1. User uploads logo
2. Backend responds quickly (2-10 seconds)
3. Success!

### Network Error Scenario
1. User uploads logo
2. Network hiccup causes failure
3. Automatic retry after 1 second
4. Success on retry!

### True Timeout Scenario
1. User uploads logo
2. 90 seconds pass with no response
3. Clear error message shown
4. User knows to:
   - Check internet connection
   - Try again (server might need to wake up)
   - Contact support if issue persists

## Testing

### Build Test
```bash
npm run build
```
✅ Build successful - no TypeScript errors

### What Users Should Notice
1. **Fewer timeout errors**: The 90-second timeout should handle most cold starts
2. **Automatic recovery**: Network hiccups won't always result in errors
3. **Better feedback**: Error messages explain what might be happening
4. **Smoother experience**: Retry logic handles transient issues invisibly

## Recommendations for Users

### For Developers
- Keep the backend warm by implementing a ping service if using free tier hosting
- Consider upgrading to paid tier hosting to eliminate cold starts
- Monitor backend logs on Render dashboard to see actual upload times

### For End Users
- Be patient on the first upload after a while (server might be waking up)
- If timeout occurs, wait 30 seconds and try again
- Use compressed/optimized logo images (< 500KB recommended)
- Check internet connection if timeouts persist

## Future Improvements

Potential enhancements that could be made:
1. Show upload progress indicator (currently just status text)
2. Pre-warm the backend with a health check before upload
3. Implement chunked uploads for very large files
4. Add file size validation before upload
5. Provide estimated upload time based on file size
6. Add a "retry" button in the UI instead of forcing manual retry

## Related Files
- `utils/pinata.ts` - Main upload logic
- `components/TokenCreator.tsx` - UI that calls upload functions
- `BACKEND_CONFIGURATION.md` - Backend URL configuration guide
- Backend: `metabackend/src/server.ts` - Server-side upload handling

## References
- Render Free Tier Cold Starts: https://render.com/docs/free#cold-starts
- Pinata IPFS Upload Docs: https://docs.pinata.cloud/
- AbortController API: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
