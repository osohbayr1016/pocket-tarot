#!/bin/bash

echo "🚀 Pocket Tarot - Vercel Deployment Script"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "front-end/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Pre-deployment checklist:"
echo "1. Backend deployed to Railway/Render/Heroku"
echo "2. Backend URL updated in front-end/next.config.ts"
echo "3. All changes committed to git"
echo ""

read -p "✅ Is your backend deployed and URL updated? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please deploy your backend first and update the URL in next.config.ts"
    echo "📖 See VERCEL_DEPLOYMENT_FIX.md for instructions"
    exit 1
fi

echo "🔧 Building frontend..."
cd front-end

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the project
echo "🏗️ Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment completed!"
echo "📱 Your app should be live at the URL provided above"
echo ""
echo "🔍 If you encounter any issues:"
echo "1. Check the Vercel dashboard for build logs"
echo "2. Verify your backend URL is correct"
echo "3. Check CORS settings in your backend" 