#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e 

echo "🎸 Welcome to Local Live Music Tracker Setup!"
echo "============================================="

echo "📦 1/4: Installing frontend dependencies (root already installed)..."
npm run web:install

echo "⚙️  2/4: Setting up environment variables..."
# Use -n to prevent overwriting existing .env files if the user already made them
cp -n .env.example .env || true
cp -n astro-app/.env.example astro-app/.env || true

echo "🗄️  3/4: Initializing and seeding the database..."
npm run db:init
npx tsx bin/generate-mock-db.ts --venues 5 --shows 20

echo "============================================="
echo "✅ Setup is complete!"
echo "🚀 Type 'npm run dev' to start the frontend and view your demo site."
