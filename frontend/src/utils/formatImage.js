import base_url from '../services/Base_url';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already an absolute URL (Cloudinary, external, or DRF with request context), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a local frontend static asset, return as is so Vite handles it
  if (imagePath.startsWith('/resort_img/') || imagePath.startsWith('/images/')) {
    return imagePath;
  }
  
  // Clean up leading slash
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  // Ensure the path includes /media/
  let finalPath = cleanPath;
  if (!finalPath.startsWith('/media/')) {
    finalPath = `/media${finalPath}`;
  }
  
  // Combine base_url and path
  const baseUrlClean = base_url.endsWith('/') ? base_url.slice(0, -1) : base_url;
  return `${baseUrlClean}${finalPath}`;
};
