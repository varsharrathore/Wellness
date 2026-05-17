@echo off
echo 🚀 Setting up Wellness Store...

echo 📦 Installing dependencies...
cd backend
call npm install
cd ..\frontend
call npm install
cd ..

echo 🗄️ Setting up database...
cd backend
node seed.js
cd ..

echo ✅ Setup complete!
echo.
echo 🌐 Start the application:
echo    Development: npm run dev
echo    Docker: docker-compose up -d
echo.
echo 👤 Admin credentials:
echo    Email: admin@wellnessstore.com
echo    Password: admin123
echo.
pause