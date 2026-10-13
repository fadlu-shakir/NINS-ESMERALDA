import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { getImageUrl } from '../utils/formatImage';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timerKey, setTimerKey] = useState(0);

  const trackRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

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

  // Keyboard navigation for Lightbox
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

  // Track scroll position to update current visible index
  useEffect(() => {
    const container = trackRef.current;
    if (!container) return;

    const handleScroll = () => {
      const firstCard = container.querySelector('.gallery-scroll-item');
      const step = firstCard ? firstCard.offsetWidth + 22 : 480;
      const index = Math.round(container.scrollLeft / step);
      setCurrentIndex(Math.min(Math.max(0, index), Math.max(0, images.length - 1)));
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [images.length]);

  // Card step calculation helper
  const getCardStep = () => {
    if (!trackRef.current) return 480;
    const firstCard = trackRef.current.querySelector('.gallery-scroll-item');
    return firstCard ? firstCard.offsetWidth + 22 : 480;
  };

  const resetTimer = () => {
    setTimerKey(prev => prev + 1);
  };

  // Manual scroll Left
  const handleScrollLeft = () => {
    if (!trackRef.current) return;
    const container = trackRef.current;
    const step = getCardStep();

    if (container.scrollLeft <= 15) {
      // Loop to end
      container.scrollTo({
        left: container.scrollWidth - container.clientWidth,
        behavior: 'smooth'
      });
    } else {
      container.scrollBy({ left: -step, behavior: 'smooth' });
    }
    resetTimer();
  };

  // Manual scroll Right
  const handleScrollRight = () => {
    if (!trackRef.current) return;
    const container = trackRef.current;
    const step = getCardStep();
    const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 25;

    if (isAtEnd) {
      // Loop back to start
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: step, behavior: 'smooth' });
    }
    resetTimer();
  };

  // Auto-scroll every 7 seconds
  useEffect(() => {
    if (loading || images.length <= 1 || isHovered || activeIndex !== null) {
      return;
    }

    const interval = setInterval(() => {
      if (!trackRef.current) return;
      const container = trackRef.current;
      const step = getCardStep();
      const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 25;

      if (isAtEnd) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: step, behavior: 'smooth' });
      }
      setTimerKey(prev => prev + 1);
    }, 7000);

    return () => clearInterval(interval);
  }, [loading, images.length, isHovered, activeIndex, timerKey]);

  // Mouse Drag to scroll handlers
  const handleMouseDown = (e) => {
    if (!trackRef.current) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeftRef.current = trackRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !trackRef.current) return;
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startXRef.current);
    if (Math.abs(walk) > 6) {
      hasMovedRef.current = true;
      trackRef.current.scrollLeft = scrollLeftRef.current - walk;
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCardClick = (index) => {
    if (hasMovedRef.current) {
      return; // Dragged, don't open
    }
    setActiveIndex(index);
  };

  return (
    <div className="gallery-section py-5 bg-white position-relative overflow-hidden">
      <div className="container">
        {/* Header with Title and Controls */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
          <div className="text-center text-md-start mb-3 mb-md-0">
            <h2 className="display-6 fw-bold font-serif-luxury mb-2">
              Resort Gallery
            </h2>
            <div 
              className="divider mt-2 mb-2 mx-auto mx-md-0" 
              style={{ width: '50px', height: '2px', backgroundColor: 'var(--color-accent)' }}
            ></div>
            <p className="text-muted small mb-0">
              Immerse yourself in peaceful landscapes, curated luxury, and timeless comfort.
            </p>
          </div>

          {/* Controls: Counter and Navigation buttons */}
          {images.length > 0 && (
            <div className="d-flex align-items-center justify-content-center justify-content-md-end gap-3">
              {/* Photo Counter */}
              <div className="gallery-counter text-muted small fw-semibold px-2">
                <span className="text-dark fw-bold">{String(currentIndex + 1).padStart(2, '0')}</span>
                <span className="mx-1">/</span>
                <span>{String(images.length).padStart(2, '0')}</span>
              </div>

              {/* Navigation buttons */}
              <div className="d-flex gap-2">
                <button 
                  type="button" 
                  className="gallery-nav-pill-btn" 
                  onClick={handleScrollLeft}
                  aria-label="Previous gallery image"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button 
                  type="button" 
                  className="gallery-nav-pill-btn" 
                  onClick={handleScrollRight}
                  aria-label="Next gallery image"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 7s Auto-scroll Progress Line */}
        {images.length > 1 && (
          <div className="gallery-progress-track mb-3">
            <div 
              key={timerKey} 
              className={`gallery-progress-bar-fill ${isHovered || activeIndex !== null ? 'paused' : ''}`}
            ></div>
          </div>
        )}
      </div>

      {/* Main Single-Line Gallery Container */}
      <div 
        className="gallery-track-outer position-relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          handleMouseUp();
        }}
      >
        {/* Floating Side Left Button */}
        {images.length > 1 && (
          <button 
            type="button"
            className="gallery-floating-arrow prev" 
            onClick={handleScrollLeft}
            aria-label="Scroll left"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
        )}

        {/* Floating Side Right Button */}
        {images.length > 1 && (
          <button 
            type="button"
            className="gallery-floating-arrow next" 
            onClick={handleScrollRight}
            aria-label="Scroll right"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        )}

        {/* Scrollable Single Line Track */}
        <div 
          ref={trackRef}
          className="gallery-single-line-track px-3 px-md-5"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {loading ? (
            <div className="d-flex align-items-center justify-content-center w-100 py-5">
              <div className="spinner-border text-accent me-3" role="status"></div>
              <span className="text-muted font-serif-luxury">Loading curated gallery...</span>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center w-100 py-5 text-muted">
              <i className="fas fa-images fs-1 mb-3 text-accent"></i>
              <h4>No gallery images found</h4>
            </div>
          ) : (
            images.map((img, index) => (
              <div 
                key={img.id || index}
                className="gallery-scroll-item"
                onClick={() => handleCardClick(index)}
              >
                <div className="gallery-card-inner">
                  <img 
                    src={getImageUrl(img.image)} 
                    alt={img.caption || `Resort Photo ${index + 1}`}
                    className="gallery-img"
                    loading="lazy"
                    draggable="false"
                  />
                  {/* Subtle Gradient & Information Overlay */}
                  <div className="gallery-card-overlay">
                    <div className="gallery-card-badge">
                      <i className="fas fa-expand-alt"></i>
                    </div>
                    <div className="gallery-card-caption">
                      <span className="gallery-caption-tag">Esmeralda Resort</span>
                      <h6 className="gallery-caption-title mb-0 text-truncate">
                        {img.caption || `Serene Vista #${index + 1}`}
                      </h6>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Lightbox Modal Overlay */}
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

          {/* Center Lightbox Content */}
          <div 
            className="overlay-content text-center animate__animated animate__zoomIn" 
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={getImageUrl(images[activeIndex].image)} 
              alt={images[activeIndex].caption || "Full View"} 
              className="img-fluid rounded shadow-lg mb-3" 
              style={{ maxHeight: '75vh', objectFit: 'contain' }} 
            />
            {images[activeIndex].caption && (
              <h4 className="text-white mb-1 font-serif-luxury">{images[activeIndex].caption}</h4>
            )}
            <span className="text-white-50 small">
              Image {activeIndex + 1} of {images.length}
            </span>
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

      {/* Scoped CSS for Single-Line Scrolling Gallery */}
      <style>{`
        .letter-spacing-2 {
          letter-spacing: 2px;
        }

        /* 7s Auto-scroll Progress Line */
        .gallery-progress-track {
          width: 100%;
          height: 3px;
          background: rgba(197, 168, 128, 0.15);
          border-radius: 4px;
          overflow: hidden;
        }
        .gallery-progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-accent) 0%, #d8be99 100%);
          border-radius: 4px;
          animation: galleryProgress7s 7s linear infinite;
        }
        .gallery-progress-bar-fill.paused {
          animation-play-state: paused;
        }

        @keyframes galleryProgress7s {
          0% { width: 0%; }
          100% { width: 100%; }
        }

        /* Control buttons - no color changing on touch or hover */
        .gallery-nav-pill-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid rgba(197, 168, 128, 0.4);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          cursor: pointer;
          transition: transform 0.2s ease, opacity 0.2s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          -webkit-tap-highlight-color: transparent;
          outline: none;
        }
        .gallery-nav-pill-btn:hover,
        .gallery-nav-pill-btn:active,
        .gallery-nav-pill-btn:focus {
          background: #ffffff;
          color: var(--color-primary);
          border-color: rgba(197, 168, 128, 0.4);
          outline: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          transform: scale(1.05);
        }

        /* Track outer container */
        .gallery-track-outer {
          position: relative;
          width: 100%;
        }

        /* Single Line Scrollable Track */
        .gallery-single-line-track {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          overflow-x: auto;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          gap: 22px;
          padding-top: 8px;
          padding-bottom: 24px;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none;  /* IE and Edge */
          user-select: none;
        }
        .gallery-single-line-track::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }

        /* Each Gallery Item - enlarged luxury frame */
        .gallery-scroll-item {
          flex: 0 0 480px;
          height: 350px;
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          cursor: pointer;
          background-color: #1c1917;
          border: 1px solid rgba(197, 168, 128, 0.25);
          box-shadow: 0 12px 30px rgba(28, 25, 23, 0.08);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.4s ease;
        }
        .gallery-scroll-item:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 20px 42px rgba(28, 25, 23, 0.16);
          border-color: var(--color-accent);
        }

        @media (min-width: 1400px) {
          .gallery-scroll-item {
            flex: 0 0 520px;
            height: 370px;
          }
        }

        @media (max-width: 992px) {
          .gallery-scroll-item {
            flex: 0 0 420px;
            height: 310px;
          }
        }

        .gallery-card-inner {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }

        .gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .gallery-scroll-item:hover .gallery-img {
          transform: scale(1.08);
        }

        /* Overlay */
        .gallery-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(28, 25, 23, 0.88) 0%, rgba(28, 25, 23, 0.25) 50%, transparent 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 16px;
          transition: all 0.3s ease;
        }

        .gallery-card-badge {
          align-self: flex-end;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(28, 25, 23, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          transition: all 0.3s ease;
        }
        .gallery-scroll-item:hover .gallery-card-badge {
          background: var(--color-accent);
          color: #1c1917;
          border-color: var(--color-accent);
          transform: scale(1.1);
        }

        .gallery-caption-tag {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: var(--color-accent);
          font-weight: 700;
          display: block;
          margin-bottom: 2px;
        }
        .gallery-caption-title {
          color: #ffffff;
          font-weight: 600;
          font-size: 0.95rem;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
        }

        /* Floating side arrows - no color changing on touch or hover */
        .gallery-floating-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(28, 25, 23, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(197, 168, 128, 0.5);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
          transition: transform 0.2s ease, opacity 0.2s ease;
          -webkit-tap-highlight-color: transparent;
          outline: none;
        }
        .gallery-floating-arrow:hover,
        .gallery-floating-arrow:active,
        .gallery-floating-arrow:focus {
          background: rgba(28, 25, 23, 0.85);
          color: #ffffff;
          border-color: rgba(197, 168, 128, 0.5);
          outline: none;
          transform: translateY(-50%) scale(1.06);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
        }
        .gallery-floating-arrow.prev {
          left: 14px;
        }
        .gallery-floating-arrow.next {
          right: 14px;
        }

        /* Lightbox Overlay */
        .gallery-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(12, 10, 9, 0.96);
          z-index: 99999;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        .overlay-content img {
          border: 3px solid rgba(255, 255, 255, 0.85);
          box-shadow: 0 20px 50px rgba(0,0,0,0.6);
        }
        .gallery-close-btn {
          position: absolute;
          top: 30px;
          right: 30px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          cursor: pointer;
          z-index: 100000;
          transition: all 0.3s ease;
        }
        .gallery-close-btn:hover {
          background: var(--color-accent);
          color: #1c1917;
          border-color: var(--color-accent);
          transform: scale(1.1);
        }
        .gallery-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: white;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          cursor: pointer;
          z-index: 100000;
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .gallery-nav-btn:hover {
          background: var(--color-accent);
          color: #1c1917;
          border-color: #ffffff;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 0 25px rgba(197, 168, 128, 0.5);
        }
        .gallery-nav-btn.prev {
          left: 40px;
        }
        .gallery-nav-btn.next {
          right: 40px;
        }

        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .gallery-scroll-item {
            flex: 0 0 85vw;
            max-width: 380px;
            height: 270px;
          }
          .gallery-floating-arrow {
            width: 42px;
            height: 42px;
            font-size: 0.95rem;
          }
          .gallery-floating-arrow.prev {
            left: 6px;
          }
          .gallery-floating-arrow.next {
            right: 6px;
          }
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
            width: 40px;
            height: 40px;
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Gallery;
