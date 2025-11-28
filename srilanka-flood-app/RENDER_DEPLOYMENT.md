# Deploying to Render.com

This guide will help you deploy your React + Vite application to Render.com.

## Prerequisites

1. A GitHub account with your code pushed to a repository
2. A Render.com account (sign up at https://render.com)
3. Your backend API URL (if you have a backend deployed)

## Deployment Steps

### Option 1: Using Render Dashboard (Recommended)

1. **Sign in to Render**
   - Go to https://dashboard.render.com
   - Sign in with your GitHub account

2. **Create a New Static Site**
   - Click "New +" button
   - Select "Static Site"

3. **Connect Your Repository**
   - Connect your GitHub account if not already connected
   - Select the repository: `sri-lanka-flood-disaster-frontend` (or your repo name)
   - Select the branch you want to deploy (usually `main` or `master`)

4. **Configure Build Settings**
   - **Name**: `srilanka-flood-app` (or any name you prefer)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Node Version**: Leave default or specify if needed (e.g., `18` or `20`)

5. **Add Environment Variables**
   - Click on "Environment" tab
   - Add the following environment variable:
     - **Key**: `VITE_API_BASE_URL`
     - **Value**: Your backend API URL (e.g., `https://your-backend.onrender.com/api`)
     - If you don't have a backend yet, you can use: `http://localhost:3000/api` (for local development) or leave it to use the default

6. **Deploy**
   - Click "Create Static Site"
   - Render will automatically build and deploy your site
   - Wait for the build to complete (usually 2-5 minutes)

7. **Get Your Live URL**
   - Once deployed, you'll get a URL like: `https://srilanka-flood-app.onrender.com`
   - You can customize this in the settings

### Option 2: Using render.yaml (Automated)

If you've pushed the `render.yaml` file to your repository:

1. **Sign in to Render**
   - Go to https://dashboard.render.com

2. **Create a New Blueprint**
   - Click "New +" button
   - Select "Blueprint"
   - Connect your repository
   - Render will automatically detect the `render.yaml` file

3. **Configure Environment Variables**
   - Go to your service settings
   - Add `VITE_API_BASE_URL` environment variable with your backend URL

4. **Deploy**
   - Render will automatically deploy based on the `render.yaml` configuration

## Environment Variables

Make sure to set these environment variables in Render:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Your backend API base URL | `https://your-backend.onrender.com/api` |

## Custom Domain (Optional)

1. Go to your static site settings in Render
2. Click "Custom Domains"
3. Add your domain name
4. Follow the DNS configuration instructions

## Important Notes

1. **Build Output**: The build command creates files in the `dist` folder, which Render serves as static files.

2. **API Configuration**: Make sure your `VITE_API_BASE_URL` points to your deployed backend. If your backend is also on Render, use the Render service URL.

3. **Google Maps API Key**: The Google Maps API key in `index.html` is currently hardcoded. For production, consider:
   - Moving it to an environment variable
   - Restricting the API key to your Render domain
   - Using a more secure method to load the Maps API

4. **CORS**: Ensure your backend API has CORS configured to allow requests from your Render frontend URL.

5. **Automatic Deploys**: Render automatically deploys when you push to your connected branch.

## Troubleshooting

### Error: "Publish directory npm start does not exist!"

This error occurs when Render is configured incorrectly. **Fix it by:**

1. **Delete the current service** (if you already created one)
   - Go to your service in Render dashboard
   - Click "Settings" → Scroll down → Click "Delete Service"

2. **Create a NEW Static Site** (NOT Web Service)
   - Click "New +" → Select **"Static Site"** (not "Web Service")
   - This is critical - Web Services require a start command, Static Sites don't

3. **Verify these exact settings:**
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist` (just the word "dist", nothing else)
   - **DO NOT** put `npm start` or any command in the Publish Directory field
   - **DO NOT** select "Web Service" - it must be "Static Site"

4. **If you're editing an existing service:**
   - Go to Settings → Build & Deploy
   - Make sure "Static Site" is selected (not "Web Service")
   - Publish Directory should be exactly: `dist`
   - Start Command should be **EMPTY** (leave it blank for static sites)

### Build Fails
- Check the build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

### API Calls Not Working
- Check that `VITE_API_BASE_URL` is set correctly
- Verify CORS settings on your backend
- Check browser console for errors

### Google Maps Not Loading
- Verify your Google Maps API key is valid
- Check API key restrictions in Google Cloud Console
- Ensure billing is enabled for Google Maps API

## Updating Your Deployment

Render automatically redeploys when you:
- Push to the connected branch
- Manually trigger a deploy from the dashboard

You can also set up preview deployments for pull requests in the Render settings.

