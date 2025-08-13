#!/bin/bash

# Complete Deployment Script for Pocket Tarot
# This script deploys both frontend and backend to production

set -e  # Exit on any error

echo "🚀 Starting complete deployment of Pocket Tarot..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "front-end" ] || [ ! -d "back-end" ]; then
    print_error "Please run this script from the root directory of the project"
    exit 1
fi

print_status "Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "git is not installed. Please install git first."
    exit 1
fi

print_success "Prerequisites check passed"

# Check if environment files exist
print_status "Checking environment configuration..."

if [ ! -f "back-end/config.production.env" ]; then
    print_warning "Production environment file not found. Creating template..."
    cat > back-end/config.production.env << EOF
# Production Environment Configuration
NODE_ENV=production
PORT=5001

# Database Configuration
DB_HOST=your_production_db_host
DB_PORT=5432
DB_NAME=your_production_db_name
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password

# JWT Configuration
JWT_SECRET=your_production_jwt_secret_key_here_make_it_long_and_random

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Frontend URL for CORS
FRONTEND_URL=https://your-frontend-domain.com

# Session Configuration
SESSION_SECRET=your_production_session_secret_here
EOF
    print_warning "Please update back-end/config.production.env with your actual production values"
fi

# Build and deploy backend
print_status "Building and deploying backend..."

cd back-end

# Install dependencies
print_status "Installing backend dependencies..."
npm install

# Check if Gemini API key is configured
if grep -q "your_gemini_api_key_here" config.production.env; then
    print_warning "Gemini API key not configured. Backend will use mock responses."
else
    print_success "Gemini API key is configured"
fi

# Test the backend
print_status "Testing backend configuration..."
npm run check:gemini

cd ..

# Build and deploy frontend
print_status "Building and deploying frontend..."

cd front-end

# Install dependencies
print_status "Installing frontend dependencies..."
npm install

# Build the frontend
print_status "Building frontend for production..."
npm run build

cd ..

print_success "Build process completed successfully!"

# Deployment options
echo ""
print_status "Choose deployment method:"
echo "1) Deploy to Vercel (Frontend) + Render (Backend)"
echo "2) Deploy to Vercel (Frontend) + Railway (Backend)"
echo "3) Deploy to Netlify (Frontend) + Render (Backend)"
echo "4) Manual deployment instructions"
echo "5) Exit"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        print_status "Deploying to Vercel + Render..."
        
        # Deploy backend to Render
        print_status "Deploying backend to Render..."
        if [ -f "deploy-to-render.sh" ]; then
            chmod +x deploy-to-render.sh
            ./deploy-to-render.sh
        else
            print_error "deploy-to-render.sh not found"
        fi
        
        # Deploy frontend to Vercel
        print_status "Deploying frontend to Vercel..."
        if [ -f "deploy-to-vercel.sh" ]; then
            chmod +x deploy-to-vercel.sh
            ./deploy-to-vercel.sh
        else
            print_error "deploy-to-vercel.sh not found"
        fi
        ;;
    2)
        print_status "Deploying to Vercel + Railway..."
        print_warning "Railway deployment requires manual setup. Please follow Railway documentation."
        ;;
    3)
        print_status "Deploying to Netlify + Render..."
        print_warning "Netlify deployment requires manual setup. Please follow Netlify documentation."
        ;;
    4)
        echo ""
        print_status "Manual Deployment Instructions:"
        echo ""
        echo "BACKEND DEPLOYMENT (Render/Railway/Heroku):"
        echo "1. Push your code to GitHub"
        echo "2. Connect your repository to your hosting platform"
        echo "3. Set environment variables:"
        echo "   - NODE_ENV=production"
        echo "   - PORT=5001"
        echo "   - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD"
        echo "   - JWT_SECRET"
        echo "   - GEMINI_API_KEY"
        echo "   - FRONTEND_URL"
        echo "4. Set build command: npm install && npm run build"
        echo "5. Set start command: npm start"
        echo ""
        echo "FRONTEND DEPLOYMENT (Vercel/Netlify):"
        echo "1. Push your code to GitHub"
        echo "2. Connect your repository to Vercel/Netlify"
        echo "3. Set build directory to: front-end"
        echo "4. Set build command: npm run build"
        echo "5. Set output directory to: .next"
        echo "6. Set environment variables:"
        echo "   - NODE_ENV=production"
        echo ""
        echo "IMPORTANT: Update the BASE_URL in frontend components to point to your backend URL"
        ;;
    5)
        print_status "Exiting..."
        exit 0
        ;;
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

print_success "Deployment process completed!"
echo ""
print_status "Next steps:"
echo "1. Update your frontend BASE_URL to point to your deployed backend"
echo "2. Test all features: Tarot, Dreams, Horoscope, Fortune, Life Guidance"
echo "3. Configure your Gemini API key for full AI functionality"
echo "4. Set up your database and update connection details"
echo ""
print_success "🎉 Pocket Tarot is ready for production! 🎉"
