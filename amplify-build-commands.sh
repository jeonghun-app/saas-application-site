#!/bin/bash

# Amplify Build Commands for SaaS Application
# This script sets up environment variables and builds the Next.js application

echo "🚀 Starting Amplify build process..."

# Set environment variables
export AWS_REGION=ap-northeast-2
export AWS_DEFAULT_REGION=ap-northeast-2
export DYNAMODB_TABLE_NAME=product
export NEXT_PUBLIC_API_URL=https://023johxt48.execute-api.ap-northeast-2.amazonaws.com/prod/
export NEXT_PUBLIC_CONTROL_PLANE_URL=https://5qlvawv3j3.execute-api.ap-northeast-2.amazonaws.com/
export NEXT_PUBLIC_DOMAIN=main.d5ub1n0zyzcoi.amplifyapp.com
export NEXT_PUBLIC_USING_CUSTOM_DOMAIN=false
export NEXT_PUBLIC_APP_NAME="SaaS Application Portal"
export NEXT_PUBLIC_APP_VERSION=1.0.0
export NODE_ENV=production

echo "📋 Environment variables set:"
echo "  AWS_REGION: $AWS_REGION"
echo "  DYNAMODB_TABLE_NAME: $DYNAMODB_TABLE_NAME"
echo "  NEXT_PUBLIC_API_URL: $NEXT_PUBLIC_API_URL"
echo "  NEXT_PUBLIC_CONTROL_PLANE_URL: $NEXT_PUBLIC_CONTROL_PLANE_URL"
echo "  NEXT_PUBLIC_DOMAIN: $NEXT_PUBLIC_DOMAIN"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Check environment variables
echo "🔍 Checking environment variables..."
npm run check-env

# Build the application
echo "🔨 Building the application..."
npm run build

echo "✅ Build process completed successfully!"
