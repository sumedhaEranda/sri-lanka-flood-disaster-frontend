# How to Test Verification Endpoint in Postman

## Step-by-Step Instructions

### 1. Set Up the Request

1. **Open Postman**
2. **Create a new request** (click "New" → "HTTP Request")
3. **Set the HTTP Method**: Select `PUT` from the dropdown (top left)

### 2. Enter the URL

**URL**: 
```
https://floodapp-backend.onrender.com/api/help-requests/{id}/verify
```

**Replace `{id}` with an actual help request ID**, for example:
```
https://floodapp-backend.onrender.com/api/help-requests/req53b9132b/verify
```

### 3. Set Headers

1. Click on the **"Headers"** tab (below the URL bar)
2. Add this header:
   - **Key**: `Content-Type`
   - **Value**: `application/json`
   - Click **"Save"** or it will auto-save

### 4. Set Request Body

1. Click on the **"Body"** tab (below Headers)
2. Select **"raw"** radio button
3. From the dropdown on the right, select **"JSON"**
4. In the text area, paste this JSON:

```json
{
  "verified": true,
  "verifiedBy": "anonymous"
}
```

### 5. Send the Request

Click the **"Send"** button (blue button, top right)

### 6. View Response

- **Success (200 OK)**: You'll see the updated help request object
- **Error (404/500)**: You'll see an error message in the response body

---

## Complete Example Screenshot Description

```
┌─────────────────────────────────────────────────────────┐
│ PUT  │ https://floodapp-backend.onrender.com/api/...   │ [Send]
└─────────────────────────────────────────────────────────┘
│ Params │ Authorization │ Headers │ Body │ Pre-request │ Tests │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Headers Tab:                                           │
│  ┌──────────────────────────────────────────┐          │
│  │ Key            Value                      │          │
│  ├──────────────────────────────────────────┤          │
│  │ Content-Type   application/json           │          │
│  └──────────────────────────────────────────┘          │
│                                                          │
│  Body Tab (select "raw" and "JSON"):                   │
│  ┌──────────────────────────────────────────┐          │
│  │ {                                         │          │
│  │   "verified": true,                      │          │
│  │   "verifiedBy": "anonymous"              │          │
│  │ }                                         │          │
│  └──────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────┘
```

---

## Alternative: Verify (true) vs Unverify (false)

### To Verify a Request:
```json
{
  "verified": true,
  "verifiedBy": "anonymous"
}
```

### To Unverify a Request:
```json
{
  "verified": false,
  "verifiedBy": "anonymous"
}
```

---

## Expected Responses

### Success Response (200 OK):
```json
{
  "id": "req53b9132b",
  "name": "John Doe",
  "phone": "0765395632",
  "location": "Colombo",
  ...
  "verified": true,
  "verifiedAt": "2024-01-15T10:30:00Z",
  "verifiedBy": "anonymous"
}
```

### Error Response (404 Not Found):
```json
{
  "code": null,
  "error": "Not Found",
  "message": "Help request not found with id: req53b9132b"
}
```

### Error Response (500 Internal Server Error):
```json
{
  "code": null,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Quick Copy-Paste URLs

### Local Testing:
```
http://localhost:3000/api/help-requests/req53b9132b/verify
```

### Production:
```
https://floodapp-backend.onrender.com/api/help-requests/req53b9132b/verify
```

**Remember**: Replace `req53b9132b` with an actual help request ID from your database!

---

## Tips

1. **Save the request**: Click "Save" to save it for future use
2. **Use Variables**: Create an environment variable for the base URL:
   - Variable: `{{base_url}}`
   - Value: `https://floodapp-backend.onrender.com/api`
   - Then use: `{{base_url}}/help-requests/req53b9132b/verify`
3. **Test with different IDs**: Try with various help request IDs to see which ones work
4. **Check response time**: If it takes too long, there might be a backend issue


