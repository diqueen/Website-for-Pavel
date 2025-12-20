@echo off
chcp 65001 >nul
echo ========================================
echo    🔄 Marine Website - Restart Services
echo ========================================
echo.

echo Остановка всех процессов...

echo [1/3] Остановка Backend...
taskkill /f /im node.exe /fi "WINDOWTITLE eq *Backend*" >nul 2>&1
echo ✅ Backend остановлен

echo.
echo [2/3] Остановка Frontend...
taskkill /f /im node.exe /fi "WINDOWTITLE eq *Frontend*" >nul 2>&1
echo ✅ Frontend остановлен

echo.
echo [3/3] Очистка портов...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /f /pid %%a >nul 2>&1
echo ✅ Порты очищены

echo.
echo ========================================
echo    ✅ Все сервисы остановлены
echo ========================================
echo.
echo Для повторного запуска используйте start-dev.bat
echo.
pause





