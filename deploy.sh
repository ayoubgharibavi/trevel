#!/bin/bash

# Deploy script for Liara
echo "🚀 Starting deployment to Liara..."

# Check if liara CLI is installed
if ! command -v liara &> /dev/null; then
    echo "❌ Liara CLI is not installed. Please install it first:"
    echo "npm install -g @liara/cli"
    exit 1
fi

# Login to Liara (if not already logged in)
echo "🔐 Checking Liara authentication..."
liara login

# Build and deploy
echo "🏗️  Building and deploying application..."
liara deploy --app hur --platform docker

echo "✅ Deployment completed!"
echo "🌐 Your application should be available at: https://hur.liara.run"




