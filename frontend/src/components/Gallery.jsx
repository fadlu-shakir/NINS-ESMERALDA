import { useState, useEffect } from 'react';
import api from '../services/api';
import { getImageUrl } from '../utils/formatImage';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await api.get('rooms/gallery/');
        setImages(res.data);
      } catch (error) {
        console.error("Failed to load gallery:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeIndex === null) return;
      if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev + 1) % images.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
      } else if (e.key === 'Escape') {
        setActiveIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, images.length]);

  return (
    <div className="section-padding">
      <div className="container">
        <div className="text-center mb-5">
          <h6 className="text-accent text-uppercase fw-bold letter-spacing-1">Experience</h6>
          <h2 className="display-5 fw-bold">Gallery</h2>
          <div className="divider mx-auto mt-3" style={{ width: '60px', height: '3px', backgroundColor: 'var(--color-accent)' }}></div>
        </div>
        <div className="row g-4">
          {loading ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary-modern"></div>
              <div className="mt-2 text-muted small">Loading gallery...</div>
            </div>
          ) : images.length === 0 ? (
            <div className="col-12 text-center text-muted py-5">
              <i className="fas fa-images fs-1 mb-3"></i>
              <h4>No images found in the gallery.</h4>
            </div>
          ) : (
            images.map((img, index) => (
              <div key={img.id} className="col-md-4 col-sm-6">
                <div 
                  className="card border-0 shadow-sm overflow-hidden h-100 cursor-pointer" 
                  onClick={() => setActiveIndex(index)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={getImageUrl(img.image)} 
                    alt={img.caption || 'Resort Gallery'} 
                    className="card-img-top"
                    style={{ height: '250px', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Lightbox Overlay */}
      {activeIndex !== null && (
        <div 
          className="gallery-overlay d-flex align-items-center justify-content-center"
          onClick={() => setActiveIndex(null)}
        >
          {/* Close button */}
          <button 
            className="gallery-close-btn" 
            onClick={() => setActiveIndex(null)}
            aria-label="Close gallery"
          >
            <i className="fas fa-times"></i>
          </button>

          {/* Prev button */}
          <button 
            className="gallery-nav-btn prev" 
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
            }}
            aria-label="Previous image"
          >
            <i className="fas fa-chevron-left"></i>
          </button>

          <div className="overlay-content text-center animate__animated animate__zoomIn" onClick={(e) => e.stopPropagation()}>
            <img src={getImageUrl(images[activeIndex].image)} alt="Full View" className="img-fluid rounded shadow-lg mb-3" style={{ maxHeight: '75vh', objectFit: 'contain' }} />
            <h4 className="text-white mb-1">{images[activeIndex].caption}</h4>
            <span className="text-white-50 small">Image {activeIndex + 1} of {images.length}</span>
          </div>

          {/* Next button */}
          <button 
            className="gallery-nav-btn next" 
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex((prev) => (prev + 1) % images.length);
            }}
            aria-label="Next image"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      <style>{`
        .gallery-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.95);
          z-index: 9999;
          backdrop-filter: blur(12px);
        }
        .overlay-content img {
          border: 4px solid white;
        }
        .gallery-close-btn {
          position: absolute;
          top: 30px;
          right: 30px;
          background: transparent;
          border: none;
          color: white;
          font-size: 2rem;
          cursor: pointer;
          z-index: 10000;
          transition: all 0.3s ease;
          opacity: 0.7;
        }
        .gallery-close-btn:hover {
          opacity: 1;
          transform: scale(1.1);
        }
        .gallery-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          cursor: pointer;
          z-index: 10000;
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .gallery-nav-btn:hover {
          background: rgba(197, 168, 128, 0.4);
          border-color: rgba(255, 255, 255, 0.8);
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 0 20px rgba(197, 168, 128, 0.4);
        }
        .gallery-nav-btn.prev {
          left: 40px;
        }
        .gallery-nav-btn.next {
          right: 40px;
        }
        
        @media (max-width: 768px) {
          .gallery-nav-btn {
            width: 45px;
            height: 45px;
            font-size: 1.1rem;
          }
          .gallery-nav-btn.prev {
            left: 15px;
          }
          .gallery-nav-btn.next {
            right: 15px;
          }
          .gallery-close-btn {
            top: 15px;
            right: 15px;
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Gallery;
