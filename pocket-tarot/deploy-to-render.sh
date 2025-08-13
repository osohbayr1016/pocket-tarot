#!/bin/bash

# Render Deployment Script for Pocket Tarot Backend
# This script helps you deploy your backend to Render

echo "🚀 Pocket Tarot Backend Deployment to Render"
echo "=============================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if backend directory exists
if [ ! -d "back-end" ]; then
    echo "❌ Backend directory not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create render.yaml configuration
echo "📝 Creating Render configuration..."

cat > render.yaml << 'EOF'
services:
  - type: web
    name: pocket-tarot-backend
    env: node
    plan: free
    buildCommand: cd back-end && npm install
    startCommand: cd back-end && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5001
      - key: MONGODB_URI
        sync: false  # Set this manually in Render dashboard
      - key: JWT_SECRET
        sync: false  # Set this manually in Render dashboard
      - key: GEMINI_API_KEY
        sync: false  # Set this manually in Render dashboard
EOF

echo "✅ Created render.yaml"

# Create .env.example for reference
echo "📝 Creating environment variables template..."

cat > back-end/.env.example << 'EOF'
# Production Environment Variables
# Copy these to your Render dashboard Environment Variables section

NODE_ENV=production
PORT=5001

# MongoDB Atlas Connection String
# Replace with your actual MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pocket-tarot?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d

# Gemini AI API
GEMINI_API_KEY=your_gemini_api_key_here

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.vercel.app
EOF

echo "✅ Created .env.example"

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo ""
echo "1. 📊 Set up MongoDB Atlas:"
echo "   - Follow the guide in MONGODB_ATLAS_SETUP.md"
echo "   - Get your connection string"
echo ""
echo "2. 🌐 Deploy to Render:"
echo "   - Go to https://render.com"
echo "   - Connect your GitHub repository"
echo "   - Create a new Web Service"
echo "   - Use the render.yaml configuration"
echo ""
echo "3. 🔧 Set Environment Variables in Render:"
echo "   - MONGODB_URI: Your MongoDB Atlas connection string"
echo "   - JWT_SECRET: A strong secret key"
echo "   - GEMINI_API_KEY: Your Gemini API key"
echo ""
echo "4. 🧪 Test your deployment:"
echo "   - Check the health endpoint: https://your-app.onrender.com/api/health"
echo "   - Test dream interpretation API"
echo ""
echo "📚 Documentation:"
echo "================="
echo "- MongoDB Atlas Setup: MONGODB_ATLAS_SETUP.md"
echo "- Deployment Guide: DEPLOYMENT_GUIDE.md"
echo "- Render Documentation: https://render.com/docs"
echo ""
echo "✅ Setup complete! Follow the next steps to deploy." 