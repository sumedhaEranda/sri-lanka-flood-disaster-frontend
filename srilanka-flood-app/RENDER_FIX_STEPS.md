# 🚨 FIX: "Publish directory npm start does not exist!" Error

## The Problem
Render is trying to use `npm start` as a directory path instead of `dist`. This happens when:
- You created a **Web Service** instead of **Static Site**
- The **Publish Directory** field has the wrong value

## ✅ SOLUTION - Step by Step

### Step 1: Delete the Current Service
1. Go to https://dashboard.render.com
2. Find your service (the one that's failing)
3. Click on it
4. Go to **Settings** (left sidebar)
5. Scroll all the way down
6. Click **"Delete Service"** (red button at bottom)
7. Confirm deletion

### Step 2: Create a NEW Static Site
1. Click the **"New +"** button (top right)
2. **IMPORTANT**: Select **"Static Site"** (NOT "Web Service")
   - Look for the icon that says "Static Site"
   - Do NOT click "Web Service"

### Step 3: Connect Repository
1. Connect your GitHub account if needed
2. Select your repository
3. Select your branch (usually `main` or `master`)

### Step 4: Configure Settings (CRITICAL!)
Fill in these fields **EXACTLY** as shown:

```
Name: srilanka-flood-app
Build Command: npm install && npm run build
Publish Directory: dist
```

**IMPORTANT NOTES:**
- **Publish Directory** should be exactly: `dist` (just the word "dist", nothing else)
- **DO NOT** put `npm start` in the Publish Directory field
- **DO NOT** put `./dist` or `/dist` - just `dist`
- Leave **Start Command** field **EMPTY** (blank)

### Step 5: Add Environment Variable
1. Click on **"Environment"** tab
2. Click **"Add Environment Variable"**
3. Add:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: Your backend URL (e.g., `https://your-backend.onrender.com/api`)
4. Click **"Save Changes"**

### Step 6: Deploy
1. Click **"Create Static Site"** button
2. Wait for the build to complete (2-5 minutes)
3. Your site will be live at: `https://srilanka-flood-app.onrender.com`

## 🔍 How to Verify It's Correct

After creating the service, go to **Settings → Build & Deploy** and verify:

✅ **Service Type**: Should say "Static Site"  
✅ **Build Command**: `npm install && npm run build`  
✅ **Publish Directory**: `dist` (not `npm start`, not `./dist`)  
✅ **Start Command**: Should be **EMPTY/BLANK** (static sites don't need this)

## ❌ Common Mistakes to Avoid

1. ❌ Creating a "Web Service" instead of "Static Site"
2. ❌ Putting `npm start` in the Publish Directory field
3. ❌ Putting `./dist` or `/dist` instead of just `dist`
4. ❌ Leaving Publish Directory empty
5. ❌ Adding a Start Command (static sites don't need it)

## 📸 Visual Checklist

When creating the Static Site, you should see fields like this:

```
┌─────────────────────────────────────┐
│ Name: srilanka-flood-app            │
│                                     │
│ Build Command:                      │
│ npm install && npm run build        │
│                                     │
│ Publish Directory:                  │
│ dist                                │  ← Just "dist", nothing else!
│                                     │
│ Start Command:                      │
│ [LEAVE THIS EMPTY]                  │  ← Must be blank!
└─────────────────────────────────────┘
```

## Still Having Issues?

If you're still getting errors:
1. Make sure you **deleted** the old service completely
2. Make sure you selected **"Static Site"** (not "Web Service")
3. Double-check the **Publish Directory** is exactly `dist` (lowercase, no quotes, no slashes)
4. Check the build logs in Render to see the exact error message

