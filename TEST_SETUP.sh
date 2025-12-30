#!/bin/bash

echo "🔍 Testing Studio Eighty7 Setup"
echo ""

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Frontend dependencies NOT installed"
    echo "   Run: npm install"
fi

# Check if mock data exists
if [ -f "services/mockData.ts" ]; then
    echo "✅ Mock data file created"
else
    echo "❌ Mock data file missing"
fi

# Check if wordpress service updated
if grep -q "MOCK_ALBUMS" services/wordpressService.ts; then
    echo "✅ WordPress service updated with mock fallback"
else
    echo "❌ WordPress service not updated"
fi

# Check if backend directory exists
if [ -d "server" ]; then
    echo "✅ Backend directory exists"
    if [ -d "server/node_modules" ]; then
        echo "✅ Backend dependencies installed"
    else
        echo "⚠️  Backend dependencies NOT installed (optional)"
        echo "   Run: cd server && npm install"
    fi
else
    echo "⚠️  Backend directory missing (optional)"
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Stop any running servers (Ctrl+C)"
echo ""
echo "2. Start frontend:"
echo "   npm run dev"
echo ""
echo "3. Open browser:"
echo "   http://localhost:3000"
echo ""
echo "4. (Optional) Start backend in another terminal:"
echo "   cd server && npm start"
echo ""
echo "🎉 Done!"
