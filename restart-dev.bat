@echo off
echo Restarting Next.js Development Server...

:: Kill any existing Node processes
taskkill /f /im node.exe 2>nul

:: Wait a moment
timeout /t 2 /nobreak >nul

:: Start the development server
cd /d "%~dp0"
npm run dev

pause
