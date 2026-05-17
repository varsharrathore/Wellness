@echo off
echo 🚀 Starting Wellness Store Development Environment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Start the application with Docker Compose
echo 📦 Starting containers...
docker-compose up -d

echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check if services are running
docker-compose ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo ✅ Services started successfully!
    echo.
    echo 🌐 Application URLs:
    echo    Frontend: http://localhost:3000
    echo    Backend API: http://localhost:5000
    echo    MongoDB: localhost:27017
    echo.
    echo 👤 To create an admin account:
    echo    1. Go to http://localhost:3000/login
    echo    2. Register a new account
    echo    3. Update user role to 'admin' in MongoDB
    echo.
    echo 📝 To stop the application: docker-compose down
) else (
    echo ❌ Failed to start services. Check Docker logs:
    docker-compose logs
)

pause