# Smart Resort Booking Platform

This project includes a complete full-stack web application for a luxury resort.

## Features
- **Frontend**: React (Vite), React Router DOM, Bootstrap, Custom CSS (Luxury Theme), React Toastify, Axios
- **Backend**: Django, Django REST Framework, SimpleJWT, SQLite
- **Functionality**: 
  - User Authentication (JWT)
  - Room listing & Filtering
  - Booking system & dummy payment
  - User Dashboard & Admin Dashboard

## How to Run

### 1. Backend Setup
1. Open a terminal in the project root directory.
2. Run `setup.bat` to create the virtual environment, install dependencies, and apply database migrations.
3. Once completed, start the backend server:
   ```cmd
   cd backend
   apenv\Scripts\activate
   python manage.py runserver
   ```
   *(Backend will run on http://localhost:8000)*

### 2. Frontend Setup
1. Open a new terminal in the project root directory.
2. Run `run_frontend.bat` to install NPM dependencies and start the React app.
   *(Frontend will run on http://localhost:5173)*

### 3. Create Superuser (Admin)
To access the Admin Dashboard or Django Admin panel:
```cmd
cd backend
apenv\Scripts\activate
python manage.py createsuperuser
```

Then login on the frontend using these credentials to see the "Admin Dashboard" menu.
