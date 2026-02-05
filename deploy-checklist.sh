#!/bin/bash
# Quick deployment checklist script

echo "🚀 NAO Medical Deployment Checklist"
echo "===================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git repository not initialized"
    echo "   Run: git init && git add . && git commit -m 'Initial commit'"
    echo ""
else
    echo "✅ Git repository initialized"
fi

# Check if changes are committed
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Uncommitted changes detected"
    echo "   Run: git add . && git commit -m 'Ready for deployment'"
    echo ""
else
    echo "✅ All changes committed"
fi

# Check for environment variables
echo ""
echo "📋 Required Environment Variables:"
echo ""
echo "Backend (Render):"
echo "  - DATABASE_URL (PostgreSQL connection string)"
echo "  - GEMINI_API_KEY (Google Gemini API key)"
echo "  - CORS_ORIGINS (Your Vercel frontend URL)"
echo ""
echo "Frontend (Vercel):"
echo "  - VITE_API_URL (Your Render backend URL)"
echo ""

echo "📖 Next Steps:"
echo ""
echo "1. Create database on Supabase or Render PostgreSQL"
echo "2. Deploy backend to Render (see DEPLOYMENT.md)"
echo "3. Update .env.production with backend URL"
echo "4. Deploy frontend to Vercel (see DEPLOYMENT.md)"
echo "5. Update CORS_ORIGINS in Render with Vercel URL"
echo ""
echo "📚 Read DEPLOYMENT.md for detailed instructions"
echo ""
