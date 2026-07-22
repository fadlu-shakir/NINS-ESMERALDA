@echo off
echo =========================================
echo Starting Backend Development Server...
echo =========================================

cd backend_clean

:: Activate virtual environment
call apenv\Scripts\activate

:: Start Django server
echo Starting Django server...
python manage.py runserver
