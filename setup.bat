@echo off
echo =========================================
echo Setting up Clean Backend Environment...
echo =========================================

cd backend_clean

:: Create virtual environment
echo Creating virtual environment "apenv"...
python -m venv apenv

:: Activate virtual environment
call apenv\Scripts\activate

:: Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

:: Apply database migrations
echo Applying database migrations...
python manage.py makemigrations api
python manage.py migrate

echo.
echo Setup Complete! 
echo Run the following command to start the backend:
echo cd backend_clean ^& call apenv\Scripts\activate ^& python manage.py runserver
echo.
pause
