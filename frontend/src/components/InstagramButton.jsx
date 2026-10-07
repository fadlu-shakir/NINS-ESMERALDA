import React from 'react';
import { FaInstagram } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import './InstagramButton.css';

const InstagramButton = () => {
  const location = useLocation();
  const hiddenRoutes = ['/login', '/register'];
  
  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  // Instagram profile URL
  const instagramUrl = 'https://www.instagram.com/esmeraldaresort_?igsh=MXNxNzExZ3M2cm5tcw%3D%3D'; 
  
  return (
    <a
      href={instagramUrl}
      className="instagram-button"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Visit our Instagram"
    >
      <FaInstagram />
    </a>
  );
};

export default InstagramButton;
