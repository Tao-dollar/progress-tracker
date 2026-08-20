@echo off
cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 (
    echo Python is required to run this app.
    echo Please install Python and try again.
    pause
    exit /b 1
)

start "HTML Progress Server" cmd /c "python -m http.server 8000"

timeout /t 2 >nul

where msedge >nul 2>nul
if not errorlevel 1 (
    start "HTML Progress" msedge --new-window --app="http://localhost:8000/"
    exit /b 0
)

where chrome >nul 2>nul
if not errorlevel 1 (
    start "HTML Progress" chrome --new-window --app="http://localhost:8000/"
    exit /b 0
)

start "HTML Progress" http://localhost:8000/
