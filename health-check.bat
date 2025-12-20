@echo off
chcp 65001 >nul
echo ========================================
echo    🔧 Marine Website - Health Check
echo ========================================
echo.

if "%1"=="" (
    echo Использование: health-check.bat [frontend-url] [backend-url]
    echo.
    echo Пример:
    echo health-check.bat http://localhost:3000 http://localhost:5000
    echo.
    pause
    exit /b 1
)

set FRONTEND_URL=%1
set BACKEND_URL=%2

if "%BACKEND_URL%"=="" (
    echo ❌ ОШИБКА: Не указан Backend URL
    pause
    exit /b 1
)

echo Проверка доступности сервисов...
echo.

echo [1/3] Проверка Frontend...
curl -f "%FRONTEND_URL%" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend: Доступен
    echo    URL: %FRONTEND_URL%
) else (
    echo ❌ Frontend: Недоступен
    echo    URL: %FRONTEND_URL%
)

echo.
echo [2/3] Проверка Backend API...
curl -f "%BACKEND_URL%/api/health" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend: Доступен
    echo    URL: %BACKEND_URL%/api/health
) else (
    echo ❌ Backend: Недоступен
    echo    URL: %BACKEND_URL%/api/health
)

echo.
echo [3/3] Проверка связи Frontend ↔ Backend...
curl -f "%FRONTEND_URL%" >nul 2>&1
if %errorlevel% equ 0 (
    curl -f "%BACKEND_URL%/api/health" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Связь: Работает корректно
    ) else (
        echo ❌ Связь: Backend недоступен
    )
) else (
    echo ❌ Связь: Frontend недоступен
)

echo.
echo ========================================
echo    📊 Дополнительная информация
echo ========================================
echo.
echo Frontend URL: %FRONTEND_URL%
echo Backend URL:  %BACKEND_URL%
echo.
echo Полезные ссылки:
echo - Backend Health Check:      %BACKEND_URL%/api/health
echo - Backend API Info:          %BACKEND_URL%/api
echo.
pause

