import { useState, useEffect } from 'react';
import api from '../services/api';
import { useScrollReveal } from '../hooks/useScrollReveal';

const AboutResort = () => {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    api.get('rooms/info/').then(res => setInfo(res.data[0])).catch(console.error);
  }, []);

  useScrollReveal('#about .slide-in-up', [info]);

  return (
    <div className="section-padding bg-light overflow-hidden">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <h6 className="text-accent text-uppercase fw-bold letter-spacing-2 mb-2">The Esmeralda Story</h6>
          <h2 className="display-4 fw-bold mb-3">About Our Paradise</h2>
          <div className="divider mx-auto" style={{ width: '80px', height: '4px', backgroundColor: 'var(--color-accent)', borderRadius: '2px' }}></div>
        </div>

        {/* Main Intro with Collage Effect */}
        <div className="row align-items-center mb-5 pb-5">
          <div className="col-lg-6 mb-5 mb-lg-0 slide-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="position-relative">
              <img src="/resort_img/3.jpeg" alt="Resort" className="img-fluid rounded-4 shadow-lg w-100" style={{ height: '450px', objectFit: 'cover' }} />
              <div className="position-absolute bottom-0 start-0 m-4 p-4 bg-white rounded-4 shadow-lg d-none d-md-block border-start border-accent border-4" style={{ width: '250px', zIndex: '5' }}>
                <h5 className="fw-bold text-accent mb-1">Authentic Kerala</h5>
                <p className="text-muted small mb-0">Experience nature in its purest form at Thusharagiri.</p>
              </div>
            </div>
          </div>
          <div className="col-lg-6 ps-lg-5 slide-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="display-6 fw-bold mb-4">{info?.name || 'Esmeralda Boutique Resort'}</h2>
            <p className="lead text-dark mb-4" style={{ lineHeight: '1.8' }}>
              {info?.description || 'Tucked away in the lush greenery of Thusharigiri, Esmeralda Boutique Resort is a peaceful and private escape designed for couples and small families who seek quality time, beautiful views, and a calming ambience.'}
            </p>
            <div className="row g-3">
              <div className="col-6">
                <div className="p-3 bg-white rounded-3 shadow-sm border-start border-accent border-4">
                  <h6 className="fw-bold mb-1">Privacy First</h6>
                  <p className="text-muted small mb-0">Isolated cottages for total peace.</p>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 bg-white rounded-3 shadow-sm border-start border-accent border-4">
                  <h6 className="fw-bold mb-1">Nature-Centric</h6>
                  <p className="text-muted small mb-0">Surrounded by vibrant plantations.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nature Section with Parallax-ish feel */}
        <div className="row align-items-center mb-5 py-5 flex-lg-row-reverse">
          <div className="col-lg-6 mb-5 mb-lg-0 slide-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="position-relative">
              <img src="/resort_img/4.jpeg" alt="Plantation" className="img-fluid rounded-4 shadow-lg w-100" style={{ height: '400px', objectFit: 'cover' }} />
              <div className="position-absolute top-0 end-0 m-3 p-3 bg-accent rounded-circle text-white d-flex align-items-center justify-content-center shadow-lg" style={{ width: '100px', height: '100px', transform: 'translate(30px, -30px)' }}>
                <div className="text-center">
                  <span className="d-block fw-bold fs-4">10+</span>
                  <small className="x-small">Varieties</small>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 pe-lg-5 slide-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="display-6 fw-bold mb-4">🌿 A Living Green Experience</h3>
            <p className="text-muted mb-4" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
              Spread across a lush green landscape, Esmeralda is home to a vibrant mix of fruit trees and spice plantations. As you walk through the estate, you’ll come across <strong>mango, jackfruit, guava, avocado</strong>, along with <strong>coffee, cardamom, cloves</strong>, and more.
            </p>
            <div className="p-4 bg-white rounded-4 border-start border-accent border-5 shadow-sm italic">
               "More than just greenery, this is a living ecosystem that brings a sense of calm, freshness, and authenticity to your stay."
            </div>
          </div>
        </div>

        {/* Info & Amenities Grid */}
        <div className="row g-4 mt-5">
          <div className="col-lg-4 slide-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="h-100 rounded-5 p-4 p-md-5 bg-white shadow-sm border" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
              <div className="mb-4 pb-3">
                <h6 className="text-accent text-uppercase fw-bold letter-spacing-2 mb-2" style={{ fontSize: '0.75rem' }}>Accommodations</h6>
                <h3 className="fw-bold mb-0 text-dark font-serif-luxury">Stay Options</h3>
                <div className="mt-3" style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-accent)' }}></div>
              </div>
              <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
                {[
                  "5 Private Single Cottages",
                  "Double Cottages",
                  "Spacious Luxury Rooms",
                  "1 Two-Bedroom Cottage"
                ].map((text, i) => (
                  <li key={i} className="d-flex align-items-center group-hover">
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0 transition-all" style={{ width: '32px', height: '32px', backgroundColor: 'rgba(197, 168, 128, 0.1)' }}>
                      <i className="fas fa-bed text-accent" style={{ fontSize: '0.75rem' }}></i>
                    </div>
                    <span className="text-dark opacity-75 fw-medium small letter-spacing-1">{text}</span>
                  </li>
                ))}
                
                <div className="my-2" style={{ height: '1px', background: 'linear-gradient(90deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 100%)' }}></div>
                
                {[
                  {text: "24/7 Security & CCTV", icon: "fa-shield-alt"},
                  {text: "Complimentary Breakfast", icon: "fa-coffee"},
                  {text: "Free Wi-Fi Access", icon: "fa-wifi"},
                  {text: "Campfire Area", icon: "fa-fire"},
                  {text: "Secure Car Parking", icon: "fa-parking"}
                ].map((item, i) => (
                  <li key={`amenity-${i}`} className="d-flex align-items-center group-hover">
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0 transition-all" style={{ width: '32px', height: '32px', backgroundColor: 'rgba(197, 168, 128, 0.1)' }}>
                      <i className={`fas ${item.icon} text-accent`} style={{ fontSize: '0.75rem' }}></i>
                    </div>
                    <span className="text-dark opacity-75 fw-medium small letter-spacing-1">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-lg-8 slide-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="h-100 rounded-5 p-4 p-md-5 bg-white shadow-sm border position-relative overflow-hidden" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
              
              {/* Very subtle background watermark */}
              <div className="position-absolute top-0 end-0 opacity-10" style={{ transform: 'translate(20%, -20%)', pointerEvents: 'none' }}>
                <i className="fas fa-compass" style={{ fontSize: '18rem', color: 'var(--color-accent)' }}></i>
              </div>
              
              <div className="position-relative z-1 h-100 d-flex flex-column">
                <div className="mb-5">
                  <h6 className="text-accent text-uppercase fw-bold letter-spacing-2 mb-2" style={{ fontSize: '0.75rem' }}>Curated Experiences</h6>
                  <h3 className="fw-bold text-dark mb-0 font-serif-luxury display-6">What Awaits You</h3>
                  <div className="mt-3" style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-accent)' }}></div>
                </div>

                <div className="row g-0 flex-grow-1">
                  {[
                    { title: "Scenic Viewpoints", text: "Stunning sunsets & panoramic vistas.", icon: "fa-mountain" },
                    { title: "Infinity Pool", text: "A refreshing dip in lush greenery.", icon: "fa-swimming-pool" },
                    { title: "Campfire Evenings", text: "Warm fires under a star-lit sky.", icon: "fa-fire" },
                    { title: "Aesthetic Dining", text: "Fresh meals with authentic flavors.", icon: "fa-utensils" },
                    { title: "Cool Climate", text: "Crisp, refreshing mountain breezes.", icon: "fa-wind" }
                  ].map((item, idx) => (
                    <div key={idx} className={`col-md-6 p-4 ${idx < 4 ? 'border-bottom' : ''} ${idx % 2 === 0 ? 'border-end' : ''}`} style={{ borderColor: 'rgba(0,0,0,0.05) !important' }}>
                      <div className="d-flex align-items-start" style={{ transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                           onMouseEnter={e => e.currentTarget.style.transform = 'translateX(8px)'}
                           onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
                        <div className="me-4 mt-1">
                          <i className={`fas ${item.icon} fs-3 text-accent opacity-75`}></i>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-2 text-dark letter-spacing-1">{item.title}</h6>
                          <p className="mb-0 text-muted small lh-lg">{item.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* 6th empty cell to complete the elegant grid */}
                  <div className="col-md-6 p-4 d-flex align-items-center justify-content-center" style={{ borderBottom: 'none' }}>
                    <div className="text-center opacity-50 transition-all" 
                         onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                         onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}>
                      <i className="fas fa-spa fs-3 text-accent mb-3"></i>
                      <p className="small text-muted font-serif-luxury fst-italic letter-spacing-1">And much more naturally...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Perfect For & Closing - Pure Glass Design */}
        <div className="mt-5 pt-4 mb-3 slide-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="position-relative rounded-5 overflow-hidden shadow-lg" style={{ minHeight: '400px' }}>
            
            {/* Full Image Background to blur */}
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ 
              backgroundImage: 'url(/resort_img/1.jpeg)', 
              backgroundSize: 'cover', 
              backgroundPosition: 'center', 
              zIndex: 0 
            }}></div>
            
            {/* Subtle Dark Overlay for Text Legibility */}
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', zIndex: 0 }}></div>
            
            {/* Animated Light Reflections (Colorless) */}
            <div className="position-absolute w-100 h-100 top-0 start-0 overflow-hidden" style={{ zIndex: 0 }}>
              <div style={{
                position: 'absolute', top: '-20%', left: '-10%', width: '70%', height: '70%',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%)',
                borderRadius: '50%', filter: 'blur(30px)', animation: 'fluidMorph 8s infinite alternate'
              }}></div>
              <div style={{
                position: 'absolute', bottom: '-20%', right: '-10%', width: '80%', height: '80%',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%)',
                borderRadius: '50%', filter: 'blur(40px)', animation: 'fluidMorphUser 10s infinite alternate-reverse'
              }}></div>
            </div>
            
            {/* Pure Glass Card Center */}
            <div className="position-relative z-1 d-flex flex-column align-items-center justify-content-center h-100 p-4 p-md-5">
              <div className="p-4 p-md-5 rounded-5 text-center" style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(16px) saturate(120%)',
                WebkitBackdropFilter: 'blur(16px) saturate(120%)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255,255,255,0.2)',
                color: 'white',
                maxWidth: '900px',
                width: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Shine effect */}
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 100%)',
                  pointerEvents: 'none'
                }}></div>

                <span className="badge rounded-pill px-4 py-2 mb-4 text-uppercase fw-bold position-relative" style={{ 
                  background: 'rgba(255, 255, 255, 0.15)', 
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  letterSpacing: '2px', 
                  fontSize: '0.85rem', 
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}>
                  <i className="fas fa-heart text-white me-2"></i> Perfect For
                </span>
                
                <h2 className="display-6 fw-bold mb-4 px-3 text-white position-relative" style={{ textShadow: '0 4px 15px rgba(0,0,0,0.4)' }}>
                  Couples & Micro Families Seeking Privacy
                </h2>
                
                <div className="mx-auto mt-4 pt-4 px-3 position-relative" style={{ maxWidth: '800px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                  <p className="fst-italic fw-light mb-0 mt-2" style={{ fontSize: '1.5rem', lineHeight: '1.6', opacity: 1, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                    "At Esmeralda, it’s not just a stay… it’s where you slow down, 
                    <span className="fw-bold px-2" style={{ color: '#ffffff', textShadow: '0 0 15px rgba(255,255,255,0.8)' }}>reconnect</span>, and truly unwind."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutResort;
