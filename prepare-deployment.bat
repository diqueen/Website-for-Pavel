@echo off
chcp 65001 >nul
echo ========================================
echo Подготовка проекта к развертыванию
echo ========================================
echo.

echo [1/5] Проверка структуры проекта...
if not exist "backend\src" (
    echo ОШИБКА: Папка backend\src не найдена!
    pause
    exit /b 1
)
if not exist "frontend\src" (
    echo ОШИБКА: Папка frontend\src не найдена!
    pause
    exit /b 1
)
echo ✓ Структура проекта проверена
echo.

echo [2/5] Удаление node_modules...
if exist "backend\node_modules" (
    echo Удаление backend\node_modules...
    rmdir /s /q "backend\node_modules" 2>nul
    echo ✓ backend\node_modules удален
)
if exist "frontend\node_modules" (
    echo Удаление frontend\node_modules...
    rmdir /s /q "frontend\node_modules" 2>nul
    echo ✓ frontend\node_modules удален
)
if exist "node_modules" (
    echo Удаление корневого node_modules...
    rmdir /s /q "node_modules" 2>nul
    echo ✓ node_modules удален
)
echo ✓ node_modules удалены
echo.

echo [3/5] Удаление собранных файлов...
if exist "frontend\.next" (
    echo Удаление frontend\.next...
    rmdir /s /q "frontend\.next" 2>nul
    echo ✓ frontend\.next удален
)
if exist "frontend\out" (
    echo Удаление frontend\out...
    rmdir /s /q "frontend\out" 2>nul
    echo ✓ frontend\out удален
)
if exist "backend\dist" (
    echo Удаление backend\dist...
    rmdir /s /q "backend\dist" 2>nul
    echo ✓ backend\dist удален
)
echo ✓ Собранные файлы удалены
echo.

echo [4/5] Удаление временных файлов...
if exist "backend\uploads\excelFile-*.xlsx" (
    echo Удаление временных Excel файлов...
    del /q "backend\uploads\excelFile-*.xlsx" 2>nul
    echo ✓ Временные Excel файлы удалены
)
if exist "*.log" (
    echo Удаление лог файлов...
    del /q "*.log" 2>nul
    echo ✓ Лог файлы удалены
)
if exist "backend\*.log" (
    del /q "backend\*.log" 2>nul
)
if exist "frontend\*.log" (
    del /q "frontend\*.log" 2>nul
)
echo ✓ Временные файлы удалены
echo.

echo [5/5] Проверка .env файлов...
if exist "backend\.env" (
    echo ⚠ ВНИМАНИЕ: Найден backend\.env
    echo   Этот файл содержит секретные данные и не должен быть загружен на сервер!
    echo   Убедитесь, что вы не загружаете этот файл.
    echo.
)
if exist "frontend\.env.local" (
    echo ⚠ ВНИМАНИЕ: Найден frontend\.env.local
    echo   Этот файл содержит секретные данные и не должен быть загружен на сервер!
    echo   Убедитесь, что вы не загружаете этот файл.
    echo.
)
echo ✓ Проверка завершена
echo.

echo ========================================
echo ✓ Подготовка завершена!
echo ========================================
echo.
echo Следующие шаги:
echo 1. Проверьте, что все необходимые файлы на месте
echo 2. Убедитесь, что .env файлы НЕ включены в загрузку
echo 3. Загрузите проект на сервер
echo 4. Следуйте инструкциям в DEPLOYMENT.md
echo.
pause

