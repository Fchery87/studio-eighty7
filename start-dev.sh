#!/bin/bash

# Quick development starter for Studio Eighty7

echo "🚀 Starting Studio Eighty7 Development Environment"
echo ""

# Check if backend server .env has API key
if [ -f "server/.env" ]; then
    if grep -q "PLACEHOLDER_API_KEY" server/.env; then
        echo "⚠️  WARNING: Backend .env has placeholder API key"
        echo "   AI Oracle feature will not work without real API key"
        echo "   Get your key from: https://makersuite.google.com/app/apikey"
        echo ""
    fi
fi

# Check if backend server is running
if nc -z localhost 3001 2>/dev/null; then
    echo "✅ Backend server detected on port 3001"
else
    echo "ℹ️  Backend server not running (API features will be limited)"
    echo "   To start backend: cd server && npm start"
    echo ""
fi

# Start frontend dev server
echo "🌐 Starting frontend development server on http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev
