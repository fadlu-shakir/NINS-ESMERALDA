import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { MdOutlineBalcony, MdLocalParking, MdOutlineShower, MdPool } from "react-icons/md";
import { IoBed } from "react-icons/io5";
import { GiCampfire } from "react-icons/gi";
import { PiButterflyLight } from "react-icons/pi";
import { TiWeatherPartlySunny } from "react-icons/ti";



const RoomDetails = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`rooms/list/${id}/`);
        setRoom(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center my-5 py-5" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-border text-accent" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center my-5 py-5" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h3 className="font-serif-luxury text-muted mb-4">Room Not Found</h3>
        <Link to="/#rooms" className="btn btn-outline-modern">Return to Stays</Link>
      </div>
    );
  }

  const images = [room.image, room.image2, room.image3, room.image4, room.image5].filter(Boolean);
  if (images.length === 0) {
    images.push('/resort_img/7.jpeg'); // fallback image
  }

  const prevImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const getFacilityIcon = (facilityName) => {
    const name = facilityName.toLowerCase();
    
    // React Icons
    if (name.includes('balcony')) return <MdOutlineBalcony style={{ fontSize: '1.4rem' }} />;
    if (name.includes('bedding') || name.includes('bed') || name.includes('linen')) return <IoBed style={{ fontSize: '1.4rem' }} />;
    if (name.includes('parking')) return <MdLocalParking style={{ fontSize: '1.4rem' }} />;
    if (name.includes('campfire') || name.includes('bonfire') || name.includes('bbq')) return <GiCampfire style={{ fontSize: '1.4rem' }} />;
    if (name.includes('bathroom') || name.includes('bath') || name.includes('shower') || name.includes('toilet')) return <MdOutlineShower style={{ fontSize: '1.4rem' }} />;
    if (name.includes('property access') || name.includes('exclusive')) return <PiButterflyLight style={{ fontSize: '1.4rem' }} />;
    if (name.includes('pool') || name.includes('swim')) return <MdPool style={{ fontSize: '1.4rem' }} />;
    if (name.includes('peaceful') || name.includes('private') || name.includes('atmosphere')) return <TiWeatherPartlySunny style={{ fontSize: '1.4rem' }} />;
    if (name.includes('gathering') || name.includes('group') || name.includes('event')) {
      return (
        <img 
          src="/resort_img/event_gathering_logo.png" 
          alt="Event and Gathering" 
        />
      );
    }
    
    // Font Awesome Icons
    let iconClass = 'fa-concierge-bell'; // fallback
    
    if (name.includes('wifi') || name.includes('wi-fi') || name.includes('internet')) {
      iconClass = 'fa-wifi';
    } else if (name.includes('air-conditioning') || name.includes('conditioned') || name.includes('ac') || name.includes('air cond')) {
      iconClass = 'fa-snowflake';
    } else if (name.includes('breakfast')) {
      iconClass = 'fa-coffee';
    } else if (name.includes('food') || name.includes('dining') || name.includes('restaurant')) {
      iconClass = 'fa-utensils';
    } else if (name.includes('car')) {
      iconClass = 'fa-car';
    } else if (name.includes('tv') || name.includes('television')) {
      iconClass = 'fa-tv';
    } else if (name.includes('toiletries') || name.includes('soap') || name.includes('shampoo')) {
      iconClass = 'fa-pump-soap';
    } else if (name.includes('security') || name.includes('cctv')) {
      iconClass = 'fa-shield-alt';
    } else if (name.includes('garden') || name.includes('lawn') || name.includes('outdoor seating')) {
      iconClass = 'fa-leaf';
    } else if (name.includes('mountain') || name.includes('nature') || name.includes('scenic') || name.includes('view')) {
      iconClass = 'fa-mountain';
    } else if (name.includes('living') || name.includes('seating') || name.includes('lounge')) {
      iconClass = 'fa-couch';
    } else if (name.includes('support')) {
      iconClass = 'fa-headset';
    } else if (name.includes('game') || name.includes('sports') || name.includes('recreation')) {
      iconClass = 'fa-dice';
    } else if (name.includes('kids') || name.includes('child') || name.includes('play')) {
      iconClass = 'fa-child';
    } else if (name.includes('family')) {
      iconClass = 'fa-users';
    }
    
    return <i className={`fas ${iconClass}`}></i>;
  };

  return (
    <div className="room-details-container pb-5" style={{ marginTop: '70px', minHeight: '100vh' }}>
      {/* Back Navigation Bar */}
      <div className="container pt-4 mb-4">
        <Link to="/#rooms" className="text-muted d-inline-flex align-items-center hover-accent fw-semibold text-uppercase small letter-spacing-1">
          <i className="fas fa-chevron-left me-2" style={{ fontSize: '0.75rem' }}></i> Back to stay collections
        </Link>
      </div>

      {/* Mosaic Gallery */}
      <div className="container mb-5">
        <div className={images.length >= 3 ? "room-gallery-grid-3" : images.length === 2 ? "room-gallery-grid-2" : "room-gallery-grid-1"}>
          {images.length >= 3 ? (
            <>
              <div className="gallery-grid-item" onClick={() => { setActiveImageIndex(0); setLightboxOpen(true); }}>
                <img src={images[0]} alt="Main Room View" />
              </div>
              <div className="side-stack">
                <div className="gallery-grid-item" onClick={() => { setActiveImageIndex(1); setLightboxOpen(true); }}>
                  <img src={images[1]} alt="Room View 2" />
                </div>
                <div className="gallery-grid-item" onClick={() => { setActiveImageIndex(2); setLightboxOpen(true); }}>
                  <img src={images[2]} alt="Room View 3" />
                </div>
              </div>
            </>
          ) : images.length === 2 ? (
            <>
              <div className="gallery-grid-item" onClick={() => { setActiveImageIndex(0); setLightboxOpen(true); }}>
                <img src={images[0]} alt="Room View 1" />
              </div>
              <div className="gallery-grid-item" onClick={() => { setActiveImageIndex(1); setLightboxOpen(true); }}>
                <img src={images[1]} alt="Room View 2" />
              </div>
            </>
          ) : (
            <div className="gallery-grid-item" onClick={() => { setActiveImageIndex(0); setLightboxOpen(true); }}>
              <img src={images[0]} alt="Room View" />
            </div>
          )}
          
          {images.length > 0 && (
            <button className="btn-gallery-view-all" onClick={() => { setActiveImageIndex(0); setLightboxOpen(true); }}>
              <i className="far fa-images me-2"></i> View All Photos ({images.length})
            </button>
          )}
        </div>
      </div>

      {/* Details Section */}
      <div className="container">
        <div className="row g-5">
          <div className="col-lg-8">
            {/* Header Title */}
            <div className="mb-4">
              <span className="text-accent text-uppercase fw-bold letter-spacing-2 small d-block mb-2">Esmeralda Retreat</span>
              <h1 className="font-serif-luxury display-5 fw-bold mb-3">{room.category_name}</h1>
              {room.room_number && (
                <span className="badge bg-dark text-white rounded-pill px-3 py-2 small fw-semibold">Room No. {room.room_number}</span>
              )}
            </div>

            {/* Room Specs Bar */}
            <div className="room-spec-bar">
              <div className="room-spec-item">
                <i className="fas fa-users"></i>
                <span>Up to {room.capacity} Guests</span>
              </div>
              <div className="room-spec-item">
                <i className="fas fa-bed"></i>
                <span>{room.category_name}</span>
              </div>
              <div className="room-spec-item">
                <i className="fas fa-clock"></i>
                <span>Check-in: {room.check_in_time}</span>
              </div>
              <div className="room-spec-item">
                <i className="fas fa-sign-out-alt"></i>
                <span>Check-out: {room.check_out_time}</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-5">
              <h4 className="font-serif-luxury mb-3 fw-bold">Room Description</h4>
              <p className="text-muted lh-lg" style={{ fontSize: '1.05rem', whiteSpace: 'pre-line' }}>{room.description}</p>
            </div>

            {/* Amenities Grid */}
            <div className="mb-4">
              <h4 className="font-serif-luxury mb-4 pb-2 border-bottom fw-bold">Room Amenities</h4>
              <div className="row g-4">
                {room.facilities.split(',').map((facility, index) => {
                  const name = facility.trim();
                  return (
                    <div key={index} className="col-sm-6 col-md-4">
                      <div className="facility-card-luxury">
                        <div className="facility-icon-wrapper">
                          {getFacilityIcon(name)}
                        </div>
                        <span className="fw-semibold text-dark" style={{ fontSize: '0.95rem' }}>{name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="col-lg-4">
            <div className="glass-booking-card position-sticky" style={{ top: '100px', zIndex: '10' }}>
              <div className="text-center mb-4">
                <span className="text-muted small text-uppercase letter-spacing-1 d-block mb-1">Rates starting from</span>
                <h2 className="text-accent fw-bold mb-0" style={{ fontSize: '2.2rem' }}>₹{room.price_per_night} <span className="fs-6 text-muted fw-normal">/ night</span></h2>
              </div>
              
              <div className="py-3 border-top border-bottom my-4">
                <div className="booking-card-item">
                  <span className="text-muted"><i className="fas fa-users me-2 text-accent"></i>Capacity</span>
                  <span className="fw-bold">{room.capacity} Guests</span>
                </div>
                <div className="booking-card-item">
                  <span className="text-muted"><i className="fas fa-info-circle me-2 text-accent"></i>Status</span>
                  <span className={`fw-bold ${room.is_available ? 'text-success' : 'text-danger'}`}>
                    {room.is_available ? 'Available' : 'Booked'}
                  </span>
                </div>
                <div className="booking-card-item">
                  <span className="text-muted"><i className="fas fa-bed me-2 text-accent"></i>Room Type</span>
                  <span className="fw-bold">{room.category_name}</span>
                </div>
              </div>

              {room.is_available ? (
                <Link to={`/booking/${room.id}`} className="btn-hero-carousel primary w-100 py-3 text-center text-uppercase fw-bold letter-spacing-1 shadow-sm mt-2" style={{ borderRadius: '12px', padding: '14px 20px', fontSize: '0.9rem' }}>
                  Book This Stay
                </Link>
              ) : (
                <button className="btn btn-secondary w-100 py-3 text-uppercase fw-bold rounded-3" style={{ letterSpacing: '1px', padding: '14px 20px', fontSize: '0.9rem' }} disabled>
                  Currently Unavailable
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div className="premium-lightbox" onClick={() => setLightboxOpen(false)}>
          <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>
            <i className="fas fa-times"></i>
          </button>
          
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-nav-btn lightbox-prev" onClick={prevImage} aria-label="Previous image">
              <i className="fas fa-chevron-left"></i>
            </button>
            
            <img src={images[activeImageIndex]} alt="Fullscreen Stay View" className="lightbox-img" />
            
            <button className="lightbox-nav-btn lightbox-next" onClick={nextImage} aria-label="Next image">
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>

          <div className="lightbox-thumbnails" onClick={(e) => e.stopPropagation()}>
            {images.map((img, idx) => (
              <img 
                key={idx}
                src={img}
                alt={`Stay View Thumbnail ${idx + 1}`}
                className={`lightbox-thumb ${activeImageIndex === idx ? 'active' : ''}`}
                onClick={() => setActiveImageIndex(idx)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetails;
