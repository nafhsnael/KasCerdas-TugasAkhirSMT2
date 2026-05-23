#!/bin/bash
# Quick Reset Script untuk apply fixes

cd backend

echo "🔄 Clearing all caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:cache

echo "✅ Cache cleared!"
echo ""
echo "📝 Next steps:"
echo "1. Restart server: php artisan serve"
echo "2. Or in VS Code: Press Ctrl+C to stop, then run again"
echo "3. Test dengan Postman atau script test-authorization.php"
echo ""
echo "Done! 🎉"
