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
            <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="bg-accent p-4 text-white">
                <h4 className="fw-bold mb-0"><i className="fas fa-home me-2"></i>Stay Options</h4>
              </div>
              <div className="card-body p-4">
                 <p className="text-muted mb-0">
                  <i className="fas fa-check text-accent me-2"></i> 5 Private Single Cottages <br />
                  <i className="fas fa-check text-accent me-2"></i> Double Cottages <br />
                  <i className="fas fa-check text-accent me-2"></i> Spacious Luxury Rooms<br />
                  <i className="fas fa-check text-accent me-2"></i> 24/7 Security & CCTV Surveillance<br />
                  <i className="fas fa-check text-accent me-2"></i> Complimentary Breakfast<br />
                  <i className="fas fa-check text-accent me-2"></i> Free Wi-Fi Access<br />
                  <i className="fas fa-check text-accent me-2"></i>Campfire & Bonfire Area<br />  
                  <i className="fas fa-check text-accent me-2"></i> Car Parking<br />
                  <i className="fas fa-check text-accent me-2"></i> 1 Spacious Two-Bedroom Cottage
                </p>
              </div>
            </div>
          </div>

          <div className="col-lg-8 slide-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="h-100 rounded-5 position-relative overflow-hidden shadow-lg" style={{ minHeight: '500px' }}>
              
              {/* Image Background */}
              <div className="position-absolute top-0 start-0 w-100 h-100" style={{ 
                backgroundImage: 'url(/resort_img/2.jpeg)', 
                backgroundSize: 'cover', 
                backgroundPosition: 'center', 
                zIndex: 0 
              }}></div>
              
              {/* Overlay to ensure readability while keeping the glass effect */}
              <div className="position-absolute top-0 start-0 w-100 h-100" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', zIndex: 0 }}></div>

              <div className="position-relative z-1 p-4 p-md-5 h-100 d-flex flex-column justify-content-center">
                <div className="d-flex align-items-center mb-5 pb-3 border-bottom border-dark border-opacity-10">
                  <div className="rounded-circle d-flex align-items-center justify-content-center me-4 shadow-sm" style={{ width: '60px', height: '60px', background: 'var(--color-accent)' }}>
                    <i className="fas fa-sparkles text-white fs-3"></i>
                  </div>
                  <div>
                    <h6 className="text-accent text-uppercase fw-bold letter-spacing-2 mb-1" style={{ fontSize: '0.75rem' }}>Experience The Magic</h6>
                    <h3 className="fw-bold text-dark mb-0 font-serif-luxury display-6">What Awaits You</h3>
                  </div>
                </div>

                <div className="row g-4">
                  {[
                    { title: "Scenic Viewpoints", text: "Stunning sunsets & panoramic nature vistas.", icon: "fa-mountain" },
                    { title: "Infinity Pool", text: "A refreshing dip surrounded by lush greenery.", icon: "fa-swimming-pool" },
                    { title: "Campfire Evenings", text: "Warm fires under a blanket of stars.", icon: "fa-fire" },
                    { title: "Aesthetic Dining", text: "Fresh meals with authentic local flavors.", icon: "fa-utensils" },
                    { title: "Cool Climate", text: "Crisp, refreshing mountain breezes all year.", icon: "fa-wind" }
                  ].map((item, idx) => (
                    <div key={idx} className="col-md-6">
                      <div 
                        className="d-flex align-items-center p-3 rounded-4" 
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.65)',
                          border: '1px solid rgba(255, 255, 255, 0.9)', 
                          backdropFilter: 'blur(15px)',
                          WebkitBackdropFilter: 'blur(15px)',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          cursor: 'default'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                          e.currentTarget.style.borderColor = 'var(--color-accent)';
                          e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1), 0 0 15px rgba(197, 168, 128, 0.3)';
                          e.currentTarget.querySelector('.icon-box').style.transform = 'rotateY(180deg)';
                          e.currentTarget.querySelector('.icon-box').style.background = 'var(--color-accent)';
                          e.currentTarget.querySelector('.icon-box i').style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.65)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.9)';
                          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.05)';
                          e.currentTarget.querySelector('.icon-box').style.transform = 'rotateY(0)';
                          e.currentTarget.querySelector('.icon-box').style.background = 'rgba(197, 168, 128, 0.1)';
                          e.currentTarget.querySelector('.icon-box i').style.color = 'var(--color-accent)';
                        }}
                      >
                        <div className="icon-box rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ 
                          width: '55px', height: '55px', 
                          background: 'rgba(197, 168, 128, 0.1)', 
                          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                          transformStyle: 'preserve-3d'
                        }}>
                          <i className={`fas ${item.icon} fs-5`} style={{ color: 'var(--color-accent)', transition: 'color 0.3s' }}></i>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1 text-dark letter-spacing-1">{item.title}</h6>
                          <p className="mb-0 lh-sm text-dark opacity-75" style={{ fontSize: '0.85rem' }}>{item.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
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
