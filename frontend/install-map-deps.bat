@echo off
echo Установка зависимостей для интерактивной карты...
cd /d "%~dp0"
call npm install leaflet react-leaflet @types/leaflet
echo.
echo Зависимости установлены!
pause













