@echo off
echo 🌊 Marine Company Website - Development Server
echo ================================================
echo.

echo 📦 Installing dependencies...
call npm run install:all
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🚀 Starting development servers...
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:5000
echo.
echo 📋 Админ панель:
echo    Откройте http://localhost:3000
echo    Нажмите на кнопку настроек (⚙️) в правом верхнем углу
echo.

call npm run dev

pause
