#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e 

echo "⚠️  WARNING: This will delete all installed dependencies, custom databases, logs, and environment files!"
read -p "Are you sure you want to completely reset the repository? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Reset aborted."
    exit 1
fi

echo "🧹 1/3: Removing environment variables..."
rm -f .env
rm -f apps/web/.env

echo "🗄️  2/3: Deleting databases and logs..."
rm -f data/*.db
rm -f data/*.db-journal
rm -rf logs/*
touch logs/.gitkeep

echo "🗑️  3/3: Removing installed node_modules and build caches..."
rm -rf node_modules
rm -rf packages/*/node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/dist
rm -rf apps/*/dist
rm -rf apps/web/.astro
rm -rf .turbo
rm -rf node_modules/.cache

echo "============================================="
echo "✅ Repository has been completely reset."
echo "🚀 Run 'pnpm run setup' to start fresh."
