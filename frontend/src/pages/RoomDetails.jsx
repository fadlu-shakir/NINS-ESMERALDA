import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { MdOutlineBalcony, MdLocalParking, MdOutlineShower, MdPool } from "react-icons/md";
import { IoBed } from "react-icons/io5";
import { GiCampfire } from "react-icons/gi";
import { PiButterflyLight } from "react-icons/pi";
import { TiWeatherPartlySunny } from "react-icons/ti";
import { getImageUrl } from '../utils/formatImage';


const RoomDetails = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [galleryLayout, setGalleryLayout] = useState('mosaic'); // 'mosaic' | 'bento' | 'stage'
  const [imageFit, setImageFit] = useState('contain'); // 'contain' (Full Photo, No Zoom) | 'cover' (Fill Grid)

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

  const images = [room.image, room.image2, room.image3, room.image4, room.image5]
    .filter(Boolean)
    .map(getImageUrl);
    
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

  // Render individual cell content with ambient blurred backdrop + uncropped photo
  const renderCellContent = (imgUrl, altText, isCover = false) => (
    <>
      {imageFit === 'contain' && (
        <div 
          className="mosaic-cell-backdrop"
          style={{ backgroundImage: `url(${imgUrl})` }}
        />
      )}
      <div className={`mosaic-cell-img-wrap ${imageFit === 'contain' ? 'is-contain' : 'is-cover'}`}>
        <img 
          src={imgUrl} 
          alt={altText}
          className={`mosaic-cell-img ${imageFit === 'contain' ? 'fit-contain' : 'fit-cover'}`}
        />
      </div>
      {isCover && (
        <span className="mosaic-cover-badge">
          <i className="fas fa-crown me-1"></i>Cover
        </span>
      )}
      <div className="mosaic-hover-hint">
        <i className="fas fa-expand me-1"></i>View Full
      </div>
    </>
  );

  const renderMosaicCell = (index, extraClass = '', isCover = false) => {
    const imgUrl = images[index];
    if (!imgUrl) return null;
    return (
      <div 
        key={index}
        className={`mosaic-cell ${extraClass}`}
        onClick={() => { setActiveImageIndex(index); setLightboxOpen(true); }}
        title="Click to view full photo"
      >
        {renderCellContent(imgUrl, `${room.category_name} photo ${index + 1}`, isCover)}
      </div>
    );
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
      {/* Back Navigation Bar with Layout Switcher */}
      <div className="container pt-4 mb-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <Link to="/#rooms" className="text-muted d-inline-flex align-items-center hover-accent fw-semibold text-uppercase small letter-spacing-1">
            <i className="fas fa-chevron-left me-2" style={{ fontSize: '0.75rem' }}></i> Back to stay collections
          </Link>

          {/* Gallery Controls */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            {/* Photo Fit Mode (Full Photo vs Fill Grid) */}
            <div className="gallery-layout-switcher" title="Photo View Mode">
              <button 
                type="button" 
                className={`layout-pill-btn ${imageFit === 'contain' ? 'active' : ''}`}
                onClick={() => setImageFit('contain')}
                title="Full Photo (Natural, Uncropped)"
              >
                <i className="fas fa-expand-arrows-alt me-1"></i> Full Photo
              </button>
              <button 
                type="button" 
                className={`layout-pill-btn ${imageFit === 'cover' ? 'active' : ''}`}
                onClick={() => setImageFit('cover')}
                title="Fill Grid (Edge to Edge)"
              >
                <i className="fas fa-th-large me-1"></i> Fill Grid
              </button>
            </div>

            {/* Grid Layout Switcher */}
            <div className="gallery-layout-switcher" title="Gallery Layout">
              <button 
                type="button" 
                className={`layout-pill-btn ${galleryLayout === 'mosaic' ? 'active' : ''}`}
                onClick={() => setGalleryLayout('mosaic')}
                title="Classic 5-Photo Luxury Grid"
              >
                <i className="fas fa-border-all me-1"></i> Mosaic Grid
              </button>
              <button 
                type="button" 
                className={`layout-pill-btn ${galleryLayout === 'bento' ? 'active' : ''}`}
                onClick={() => setGalleryLayout('bento')}
                title="Modern Bento Grid"
              >
                <i className="fas fa-layer-group me-1"></i> Bento Grid
              </button>
              <button 
                type="button" 
                className={`layout-pill-btn ${galleryLayout === 'stage' ? 'active' : ''}`}
                onClick={() => setGalleryLayout('stage')}
                title="Stage Showcase Viewer"
              >
                <i className="fas fa-image me-1"></i> Stage
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="container mb-5">
        {galleryLayout === 'mosaic' && (
          <div className="luxury-mosaic-wrapper position-relative">
            {images.length >= 5 ? (
              <div className="luxury-mosaic-grid-5">
                {renderMosaicCell(0, 'mosaic-main', true)}
                <div className="mosaic-side-grid">
                  {renderMosaicCell(1)}
                  {renderMosaicCell(2)}
                  {renderMosaicCell(3)}
                  {renderMosaicCell(4)}
                </div>
              </div>
            ) : images.length === 4 ? (
              <div className="luxury-mosaic-grid-4">
                {renderMosaicCell(0, 'mosaic-main', true)}
                <div className="mosaic-side-grid-3">
                  {renderMosaicCell(1)}
                  {renderMosaicCell(2)}
                  {renderMosaicCell(3)}
                </div>
              </div>
            ) : images.length === 3 ? (
              <div className="luxury-mosaic-grid-3">
                {renderMosaicCell(0, 'mosaic-main', true)}
                <div className="mosaic-side-stack">
                  {renderMosaicCell(1)}
                  {renderMosaicCell(2)}
                </div>
              </div>
            ) : images.length === 2 ? (
              <div className="luxury-mosaic-grid-2">
                {renderMosaicCell(0, 'mosaic-main', true)}
                {renderMosaicCell(1)}
              </div>
            ) : (
              <div className="luxury-mosaic-grid-1">
                {renderMosaicCell(0, 'mosaic-main', true)}
              </div>
            )}

            {/* Floating Action Buttons */}
            <div className="gallery-buttons-container">
              {images.length > 0 && (
                <button 
                  type="button"
                  className="btn-gallery-view-all" 
                  onClick={() => { setActiveImageIndex(0); setLightboxOpen(true); }}
                >
                  <i className="fas fa-th me-2"></i> View All Photos ({images.length})
                </button>
              )}
              {room.is_available && (
                <Link 
                  to={`/booking/${room.id}`} 
                  className="btn-gallery-book-slot"
                >
                  <i className="fas fa-calendar-check me-2"></i> Book My Slot
                </Link>
              )}
            </div>
          </div>
        )}

        {galleryLayout === 'bento' && (
          <div className="luxury-bento-wrapper position-relative">
            <div className="luxury-bento-grid">
              {images.map((img, idx) => {
                const isHero = idx === 0;
                return (
                  <div
                    key={idx}
                    className={`bento-cell ${isHero ? 'bento-hero' : `bento-item-${idx}`}`}
                    onClick={() => { setActiveImageIndex(idx); setLightboxOpen(true); }}
                    title="Click to view full photo"
                  >
                    {imageFit === 'contain' && (
                      <div 
                        className="mosaic-cell-backdrop"
                        style={{ backgroundImage: `url(${img})` }}
                      />
                    )}
                    <div className={`mosaic-cell-img-wrap ${imageFit === 'contain' ? 'is-contain' : 'is-cover'}`}>
                      <img 
                        src={img} 
                        alt={`${room.category_name} ${idx + 1}`} 
                        className={`mosaic-cell-img ${imageFit === 'contain' ? 'fit-contain' : 'fit-cover'}`}
                      />
                    </div>
                    {isHero && (
                      <div className="bento-hero-overlay">
                        <span className="badge bg-accent text-white mb-1"><i className="fas fa-crown me-1"></i>Cover</span>
                        <h4 className="text-white fw-bold mb-0 font-serif-luxury">{room.category_name}</h4>
                      </div>
                    )}
                    <div className="bento-hover-hint">
                      <i className="fas fa-search-plus"></i>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Floating Action Buttons */}
            <div className="gallery-buttons-container">
              {images.length > 0 && (
                <button 
                  type="button"
                  className="btn-gallery-view-all" 
                  onClick={() => { setActiveImageIndex(0); setLightboxOpen(true); }}
                >
                  <i className="fas fa-th me-2"></i> View All Photos ({images.length})
                </button>
              )}
              {room.is_available && (
                <Link 
                  to={`/booking/${room.id}`} 
                  className="btn-gallery-book-slot"
                >
                  <i className="fas fa-calendar-check me-2"></i> Book My Slot
                </Link>
              )}
            </div>
          </div>
        )}

        {galleryLayout === 'stage' && (
          <div className="room-showcase-container">
            {/* Main Stage Image Viewer */}
            <div 
              className="room-showcase-stage"
              onClick={() => setLightboxOpen(true)}
              title="Click to view full screen"
            >
              <div 
                className="room-showcase-backdrop"
                style={{ backgroundImage: `url(${images[activeImageIndex]})` }}
              />
              <div className="room-showcase-img-wrap">
                <img 
                  src={images[activeImageIndex]} 
                  alt={`${room.category_name} - Photo ${activeImageIndex + 1}`} 
                  className="room-showcase-main-img" 
                />
              </div>

              {images.length > 1 && (
                <>
                  <button 
                    type="button"
                    className="showcase-nav-btn showcase-prev" 
                    onClick={prevImage}
                    aria-label="Previous photo"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <button 
                    type="button"
                    className="showcase-nav-btn showcase-next" 
                    onClick={nextImage}
                    aria-label="Next photo"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </>
              )}

              <div className="showcase-counter-badge">
                <i className="far fa-images me-2"></i>
                {activeImageIndex + 1} / {images.length}
              </div>

              <div className="gallery-buttons-container">
                {images.length > 0 && (
                  <button 
                    type="button"
                    className="btn-gallery-view-all" 
                    onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
                  >
                    <i className="fas fa-expand me-2"></i> Fullscreen ({images.length})
                  </button>
                )}
                {room.is_available && (
                  <Link 
                    to={`/booking/${room.id}`} 
                    className="btn-gallery-book-slot"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <i className="fas fa-calendar-check me-2"></i> Book My Slot
                  </Link>
                )}
              </div>
            </div>

            {images.length > 1 && (
              <div className="room-thumbnails-strip mt-3">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`room-thumb-btn ${activeImageIndex === idx ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                    title={`View photo ${idx + 1}`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="room-thumb-img" />
                    {idx === 0 && <span className="room-thumb-cover-tag">Cover</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
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
                <span>
                  {room.adult_capacity > 0 || room.child_capacity > 0
                    ? `Up to ${room.adult_capacity || 0} Adults, ${room.child_capacity || 0} Kids${room.extra_capacity ? ` • ${room.extra_capacity}` : ''}`
                    : (room.extra_capacity || 'Flexible Guests')}
                </span>
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
              {room.price_per_night !== null && room.price_per_night !== undefined && Number(room.price_per_night) > 0 && (
                <div className="text-center mb-4">
                  <span className="text-muted small text-uppercase letter-spacing-1 d-block mb-1">Rates starting from</span>
                  <h2 className="text-accent fw-bold mb-0" style={{ fontSize: '2.2rem' }}>₹{room.price_per_night} <span className="fs-6 text-muted fw-normal">/ night</span></h2>
                </div>
              )}
              
              <div className="py-3 border-top border-bottom my-4">
                <div className="booking-card-item">
                  <span className="text-muted"><i className="fas fa-users me-2 text-accent"></i>Capacity</span>
                  <span className="fw-bold">
                    {room.adult_capacity > 0 || room.child_capacity > 0
                      ? `${room.adult_capacity || 0} Adults, ${room.child_capacity || 0} Kids${room.extra_capacity ? ` (${room.extra_capacity})` : ''}`
                      : (room.extra_capacity || 'Flexible')}
                  </span>
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
