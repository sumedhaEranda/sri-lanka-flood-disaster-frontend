# CORS Error Fix Guide

## Problem
```
Access to fetch at 'https://floodapp-backend.onrender.com/api/help-requests?...' 
from origin 'https://srilanka-flood-disaster.onrender.com' 
has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## What is CORS?
CORS is a security feature that browsers use to prevent websites from making requests to different domains. Your backend needs to explicitly allow your frontend to make requests.

## Solution: Configure Backend CORS

You need to update your **backend** (Spring Boot) to allow requests from your frontend origin.

### Option 1: Global CORS Configuration (Recommended)

Add this configuration class to your Spring Boot backend:

```java
package com.yourapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow credentials
        config.setAllowCredentials(true);
        
        // Allow these origins (add your frontend URL)
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",                    // Local development
            "http://localhost:4173",                    // Local preview build
            "https://srilanka-flood-disaster.onrender.com"  // Production frontend
        ));
        
        // Allow all headers
        config.setAllowedHeaders(Arrays.asList(
            "Origin",
            "Content-Type",
            "Accept",
            "Authorization",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        
        // Allow all HTTP methods
        config.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));
        
        // Expose these headers to frontend
        config.setExposedHeaders(Arrays.asList(
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials"
        ));
        
        // Cache preflight for 3600 seconds (1 hour)
        config.setMaxAge(3600L);
        
        // Apply to all endpoints
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
```

### Option 2: Using @CrossOrigin Annotation

If you prefer, add `@CrossOrigin` to your controller:

```java
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://srilanka-flood-disaster.onrender.com"
})
public class HelpRequestController {
    // Your endpoints...
}
```

### Option 3: WebMvcConfigurer (Alternative)

```java
package com.yourapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:5173",
                    "https://srilanka-flood-disaster.onrender.com"
                )
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

---

## Step-by-Step Fix

### 1. Create CORS Configuration File in Backend

1. Create file: `src/main/java/com/yourapp/config/CorsConfig.java`
2. Copy one of the options above (Option 1 is recommended)
3. Update the package name (`com.yourapp.config`) to match your project

### 2. Update Allowed Origins

Make sure to include your actual frontend URL:
- ✅ `https://srilanka-flood-disaster.onrender.com` (your production frontend)
- ✅ `http://localhost:5173` (local development)
- ❌ Don't use `*` (wildcard) if you're using `allowCredentials(true)`

### 3. Deploy Backend

After adding the CORS configuration:
1. Build your backend: `./mvnw clean package` (or `gradle build`)
2. Deploy to Render
3. Restart your backend service on Render

### 4. Test

After deployment, try again in your frontend. The CORS error should be gone.

---

## Verify CORS is Working

### Test with curl:

```bash
curl -X OPTIONS https://floodapp-backend.onrender.com/api/help-requests \
  -H "Origin: https://srilanka-flood-disaster.onrender.com" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

**Expected Response Headers:**
```
Access-Control-Allow-Origin: https://srilanka-flood-disaster.onrender.com
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: *
```

### Test in Browser Console:

Open your frontend site and run:
```javascript
fetch('https://floodapp-backend.onrender.com/api/help-requests?limit=10')
  .then(r => r.json())
  .then(data => console.log('✅ CORS works!', data))
  .catch(err => console.error('❌ CORS error:', err))
```

---

## Common Issues

### Issue 1: Still Getting CORS Error After Fix
- **Cause**: Backend hasn't been redeployed
- **Fix**: Make sure you've deployed the updated backend code

### Issue 2: Works Locally But Not in Production
- **Cause**: Production backend doesn't have CORS config
- **Fix**: Check that CORS config is deployed to production

### Issue 3: Preflight (OPTIONS) Request Fails
- **Cause**: Backend doesn't handle OPTIONS requests
- **Fix**: Make sure `OPTIONS` is in `allowedMethods`

### Issue 4: 401/403 Errors After CORS Fix
- **Cause**: Different issue - authentication/authorization
- **Fix**: CORS is now working, but you need to check auth

---

## Quick Checklist

- [ ] Created `CorsConfig.java` in backend
- [ ] Added frontend URL to `allowedOrigins`
- [ ] Added all HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`)
- [ ] Added all headers or used `*`
- [ ] Deployed updated backend to Render
- [ ] Verified CORS headers in browser Network tab
- [ ] Tested API call from frontend

---

## If You Don't Have Backend Access

If you don't have access to modify the backend, you'll need to:
1. Contact the backend developer
2. Share this guide with them
3. Provide them with your frontend URL: `https://srilanka-flood-disaster.onrender.com`

---

## Additional Notes

- **Never disable CORS entirely** - it's a security feature
- **Don't use wildcard (`*`)** with credentials - use specific origins
- **Always test after deployment** - CORS issues only appear in browser
- **Preflight requests** happen automatically for certain requests (PUT, DELETE, custom headers)

