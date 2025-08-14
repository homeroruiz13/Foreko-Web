#!/bin/bash

echo "🚀 Foreko Deployment Setup"
echo "========================="

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

echo "Setting up Vercel projects..."

# Deploy main app
echo "📱 Deploying main application..."
cd custom-frontend
vercel --prod --confirm
cd ..

# Deploy dashboard app  
echo "📊 Deploying dashboard application..."
cd app
vercel --prod --confirm
cd ..

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Set up custom domains in Vercel dashboard"
echo "2. Configure environment variables"
echo "3. Update DASHBOARD_URL in main app settings"
echo "4. Test the authentication flow"