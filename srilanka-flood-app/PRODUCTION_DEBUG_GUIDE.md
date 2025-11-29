# Production Debugging Guide - Verification Endpoint Not Working

## Issue: Verification endpoint works locally but not in production

The endpoint `help-requests/{id}/verify` is failing when hosted on Render.

## Common Causes & Solutions

### 1. Check Environment Variable in Render

**Problem**: `VITE_API_BASE_URL` is not set or set incorrectly in Render.

**Solution**:
1. Go to your Render dashboard: https://dashboard.render.com
2. Select your static site service
3. Go to **Environment** tab
4. Check if `VITE_API_BASE_URL` exists
5. Verify it points to your production backend URL:
   - ✅ Correct: `https://your-backend.onrender.com/api`
   - ❌ Wrong: `http://localhost:3000/api` (only works locally)
   - ❌ Wrong: Missing (will default to localhost)

**To Update**:
1. Click "Add Environment Variable" or edit existing one
2. Key: `VITE_API_BASE_URL`
3. Value: `https://your-backend.onrender.com/api` (replace with your actual backend URL)
4. Click "Save Changes"
5. **IMPORTANT**: Trigger a new deployment after changing environment variables

### 2. Verify API Base URL is Being Used

**Debug in Browser Console**:
Open your production site in browser and run:
```javascript
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL)
```

Expected output:
- ✅ Production: `https://your-backend.onrender.com/api`
- ❌ Wrong: `http://localhost:3000/api` or `undefined`

**Fix**: If it shows localhost, the environment variable is not set in Render.

### 3. Check Network Request in Browser

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try to verify a request
4. Check the actual request URL:
   - ✅ Should be: `https://your-backend.onrender.com/api/help-requests/req53b9132b/verify`
   - ❌ Wrong: `http://localhost:3000/api/help-requests/req53b9132b/verify`

### 4. CORS Issues

**Problem**: Backend is blocking requests from production frontend.

**Check Error**:
- Open browser console
- Look for CORS errors like: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution**: Update your backend CORS configuration to allow your production frontend URL:
```java
// In your Spring Boot backend
@CrossOrigin(origins = {
    "http://localhost:5173",  // Local dev
    "https://srilanka-flood-app.onrender.com"  // Production (update with your actual URL)
})
```

### 5. Rebuild After Environment Variable Changes

**IMPORTANT**: After changing `VITE_API_BASE_URL` in Render:
1. Go to your service in Render dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. OR push a new commit to trigger automatic deployment
4. Environment variables are baked into the build, so you must rebuild

### 6. Check Backend Endpoint

**Verify backend is accessible**:
1. Open: `https://your-backend.onrender.com/api/help-requests` (or your backend URL)
2. Should return data or an error (not 404)

**Test verification endpoint in Postman/curl**:
```bash
curl -X PUT https://your-backend.onrender.com/api/help-requests/req53b9132b/verify \
  -H "Content-Type: application/json" \
  -d '{"verified": true, "verifiedBy": "anonymous"}'
```

### 7. Add Debug Logging

Add temporary logging to see what URL is being used:
```typescript
// In src/api.ts - add this temporarily
console.log('API_BASE_URL:', API_BASE_URL)
console.log('Full URL:', `${API_BASE_URL}/help-requests/${id}/verify`)
```

## Quick Fix Checklist

1. ✅ Set `VITE_API_BASE_URL` in Render Environment Variables
2. ✅ Value should be your production backend URL (e.g., `https://your-backend.onrender.com/api`)
3. ✅ Trigger a new deployment after changing environment variable
4. ✅ Verify backend CORS allows your production frontend URL
5. ✅ Check browser console for errors
6. ✅ Check Network tab to see actual request URL

## Still Not Working?

1. Check Render build logs for any errors
2. Check browser console for JavaScript errors
3. Check browser Network tab for failed requests
4. Verify your backend is running and accessible
5. Test the endpoint directly with curl or Postman

