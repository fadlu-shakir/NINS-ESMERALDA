import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import { GoogleOAuthProvider } from '@react-oauth/google'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <GoogleOAuthProvider clientId="928368334434-sb3tsor2ahng98nrb2tenkl6brkpgubk.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </AuthProvider>
  </React.StrictMode>,
)
