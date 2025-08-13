# 🚀 Vercel Deployment Fix Guide

## ❌ Problem

```
Environment Variable "NEXT_PUBLIC_API_URL" references Secret "next_public_api_url", which does not exist.
```

## ✅ Solution

### Step 1: Fix Vercel Configuration

The `vercel.json` file had two issues:

1. **Environment Variable Reference**: Removed the non-existent secret reference
2. **Invalid Function Runtime**: Removed the invalid `nodejs18.x` runtime specification

Both issues have been fixed by simplifying the `vercel.json` configuration.

### Step 2: Update Next.js Configuration

The `next.config.ts` has been updated to handle API URLs properly for both development and production.

### Step 3: Deploy Your Backend First

Before deploying the frontend, you need to deploy your backend to a platform like:

- **Railway** (recommended)
- **Render**
- **Heroku**
- **DigitalOcean App Platform**

### Step 4: Update Backend URL

Once your backend is deployed, update the backend URL in `front-end/next.config.ts`:

```typescript
// Replace this line in next.config.ts
destination: `${
  process.env.NODE_ENV === "production"
    ? "https://your-backend-url.railway.app" // ← Update this URL
    : "http://localhost:5001"
}/api/:path*`,
```

### Step 5: Deploy to Vercel

Now you can deploy to Vercel without the environment variable error:

```bash
# From the front-end directory
vercel --prod
```

## 🔧 Alternative: Using Environment Variables (Optional)

If you want to use environment variables instead of hardcoding the URL:

### 1. Set Environment Variable in Vercel Dashboard

- Go to your Vercel project dashboard
- Navigate to Settings → Environment Variables
- Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.railway.app`

### 2. Update next.config.ts

```typescript
destination: `${
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://your-backend-url.railway.app"
    : "http://localhost:5001")
}/api/:path*`,
```

## 📋 Deployment Checklist

- [ ] Backend deployed to Railway/Render/Heroku
- [ ] Backend URL updated in `next.config.ts`
- [ ] `vercel.json` environment reference removed
- [ ] Frontend deployed to Vercel
- [ ] API calls working in production

## 🎯 Quick Fix Commands

```bash
# 1. Deploy backend (example with Railway)
cd back-end
railway login
railway init
railway up

# 2. Get your backend URL
railway status

# 3. Update frontend config with the URL
# Edit front-end/next.config.ts

# 4. Deploy frontend
cd front-end
vercel --prod
```

## 🔍 Troubleshooting

### If you still get environment variable errors:

1. Check that `vercel.json` doesn't have any `env` references
2. Make sure you're not using `@secret_name` syntax
3. Verify the backend URL is correct

### If you get function runtime errors:

1. Make sure `vercel.json` doesn't have invalid runtime specifications
2. Remove any `functions` section if you're using Next.js (it's handled automatically)
3. Use the simplified configuration provided in this guide

### If API calls fail in production:

1. Check CORS settings in your backend
2. Verify the backend URL is accessible
3. Check browser console for errors

## 📞 Support

If you need help with backend deployment, refer to `DEPLOYMENT_GUIDE.md` for detailed instructions.
