import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import './WhatsAppButton.css';

const WhatsAppButton = () => {
  const location = useLocation();
  const hiddenRoutes = ['/login', '/register'];
  
  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  // Replace with your actual WhatsApp phone number (including country code)
  const phoneNumber = '1234567890';
  
  return (
    <a
      href={`https://wa.me/${phoneNumber}`}
      className="whatsapp-button"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp />
    </a>
  );
};

export default WhatsAppButton;
