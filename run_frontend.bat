@echo off
echo =========================================
echo Starting Frontend Development Server...
echo =========================================

cd frontend

:: Install npm dependencies
echo Installing npm packages...
npm install

:: Start Vite dev server
echo Starting Vite server...
npm run dev
