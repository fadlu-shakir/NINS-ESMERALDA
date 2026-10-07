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

  // Replace with your actual Instagram profile username
  const username = 'instagram'; 
  
  return (
    <a
      href={`https://instagram.com/${username}`}
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
