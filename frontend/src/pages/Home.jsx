import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Rooms from '../components/Rooms';
import Gallery from '../components/Gallery';
import AboutResort from '../components/AboutResort';
import NearestAttractions from '../components/NearestAttractions';
import Reviews from '../components/Reviews';
import LocationMap from '../components/LocationMap';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useScrollParallax, use3DScroll } from '../hooks/useScrollParallax';

// Import local premium background videos directly
import video1 from '../../resort_img/vid/EOJR4935.MOV';
import video2 from '../../resort_img/vid/VEXM0224.MOV';
import video3 from '../../resort_img/vid/XAXR1219.MOV';
import video4 from '../../resort_img/vid/oonj.mp4';

const Home = () => {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const carouselEl = document.getElementById('resortHeroCarousel');
    if (carouselEl) {
      const handleSlide = (e) => {
        setActiveSlide(e.to);
      };
      carouselEl.addEventListener('slide.bs.carousel', handleSlide);
      return () => {
        carouselEl.removeEventListener('slide.bs.carousel', handleSlide);
      };
    }
  }, []);

  useScrollReveal('.highlight-item');
  useScrollParallax('.parallax-element', 0.4);
  use3DScroll('.perspective-element');
  useScrollParallax('.parallax-fast', 0.2);

  const slides = [
    {
      video: video1,
      title: "Esmeralda Boutique Resort",
      subtitle: "Tucked away in the lush greenery of Thusharigiri",
      buttonText: "Book Your Escape",
      buttonLink: "#rooms",
      buttonType: "outline"
    },
    {
      video: video2,
      title: "A Peaceful Escape",
      subtitle: "Designed for couples and small families who seek quality time",
      buttonText: "View Gallery",
      buttonLink: "#gallery",
      buttonType: "outline"
    },
    {
      video: video3,
      title: "Beautiful Views",
      subtitle: "Experience the calming ambience and natural beauty",
      buttonText: "About Resort",
      buttonLink: "#about",
      buttonType: "outline"
    },
    {
      video: video4,
      title: "Serene Leisure",
      subtitle: "Immerse yourself in pure relaxation amidst pristine nature",
      buttonText: "Explore Attractions",
      buttonLink: "#attractions",
      buttonType: "outline"
    }
  ];

  return (
    <div className="home-container">
      {/* Enhanced Hero Carousel Section */}
      <section className="hero-carousel-enhanced">
        <div id="resortHeroCarousel" className="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="7000">
          <div className="carousel-indicators-custom">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                data-bs-target="#resortHeroCarousel"
                data-bs-slide-to={index}
                className={`carousel-indicator-dot ${index === activeSlide ? 'active' : ''}`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>

          <div className="carousel-inner">
            {slides.map((slide, index) => (
              <div 
                key={index}
                className={`carousel-item ${index === 0 ? 'active' : ''}`} 
                style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}
              >
                {/* Background Video */}
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover', 
                    zIndex: -1 
                  }}
                >
                  <source src={slide.video} type="video/quicktime" />
                  <source src={slide.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Gradient Overlay */}
                <div className="hero-overlay-enhanced"></div>

                {/* Content */}
                <div className="hero-content-wrapper">
                  <div className="hero-content-inner">
                    <div className="slide-number">
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <span className="divider">/</span>
                      <span>{String(slides.length).padStart(2, '0')}</span>
                    </div>
                    
                    <h1 className="hero-title-enhanced fade-in-down">
                      {slide.title}
                    </h1>
                    
                    <p className="hero-subtitle-enhanced fade-in-up">
                      {slide.subtitle}
                    </p>

                    <div className="hero-cta-group fade-in-up">
                      <a href={slide.buttonLink} className={`btn-hero-enhanced ${slide.buttonType}`}>
                        <span className="btn-text">{slide.buttonText}</span>
                        <span className="btn-icon">→</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Navigation Arrows */}
          <button className="carousel-nav-btn carousel-nav-prev" type="button" data-bs-target="#resortHeroCarousel" data-bs-slide="prev" aria-label="Previous slide">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button className="carousel-nav-btn carousel-nav-next" type="button" data-bs-target="#resortHeroCarousel" data-bs-slide="next" aria-label="Next slide">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>


      </section>


      {/* Rooms Section */}
      <div id="rooms" className="section-wrapper">
        <Rooms />
      </div>

      {/* About Resort Section */}
      <div id="about" className="section-wrapper">
        <AboutResort />
      </div>

      {/* Reviews Section */}
      <div id="reviews" className="section-wrapper">
        <Reviews />
      </div>

      {/* Gallery Section */}
      <div id="gallery" className="section-wrapper">
        <Gallery />
      </div>

      {/* Attractions Section */}
      <div id="attractions" className="section-wrapper">
        <NearestAttractions />
      </div>

      {/* Location Map Section */}
      <div id="location" className="section-wrapper bg-light">
        <LocationMap />
      </div>
    </div>
  );
};

export default Home;
