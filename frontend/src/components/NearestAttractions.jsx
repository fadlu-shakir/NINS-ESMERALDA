import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const NearestAttractions = () => {
  const attractions = [
    {
      id: 1,
      title: "Thusharigiri Waterfalls",
      distance: "1.5 km (5 mins drive)",
      description: "A breathtaking multi-tiered waterfall cascade nestled in the Western Ghats. Perfect for scenic treks, rock climbing, and experiencing raw natural mist.",
      image: "https://i1-c.pinimg.com/1200x/37/fa/f2/37faf299877024ff2379557c101a4a5c.jpg",
      icon: "fa-water"
    },
    {
      id: 2,
      title: "Lakkidi View Point",
      distance: "15 km (35 mins drive)",
      description: "Known as the gateway to Wayanad, offering majestic panoramic views of winding mountain passes, deep valleys, and beautiful mist-capped peaks.",
      image: "https://i1-c.pinimg.com/736x/95/bf/2a/95bf2ac8362c350fed1f465da47ca4b9.jpg",
      icon: "fa-mountain"
    },
    {
      id: 3,
      title: "Pookode Lake",
      distance: "18 km (40 mins drive)",
      description: "A tranquil, natural freshwater lake nestled among evergreen forests. Renowned for peaceful boat rides, wild orchids, and pristine blue waters.",
      image: "https://i.pinimg.com/736x/91/b6/4b/91b64b6f278a4b2d6dcd14956e14a6f0.jpg",
      icon: "fa-ship"
    },
    {
      id: 4,
      title: "Kakkadampoyil Hillstation",
      distance: "22 km (50 mins drive)",
      description: "serene hill station in Kerala known for its lush greenery, misty mountains, and refreshing waterfalls. It is a perfect getaway spot for nature lovers seeking peace, cool climate, and scenic landscapes away from the city crowd.",
      image: "https://i.pinimg.com/736x/47/0c/52/470c52a8effe8effd5d2727fff72ca9d.jpg",
      icon: "fa-compass"
    }
  ];

  useScrollReveal('#attractions .slide-in-up');

  return (
    <section className="section-padding bg-light" id="attractions">
      <div className="container">
        <div className="text-center mb-5">
          <h6 className="text-accent text-uppercase fw-bold letter-spacing-1">Explore the Region</h6>
          <h2 className="display-5 fw-bold text-dark">Nearest Attractions</h2>
          <div className="divider mx-auto mt-3 mb-4" style={{ width: '60px', height: '3px', backgroundColor: 'var(--color-accent)' }}></div>
          <p className="text-muted mx-auto max-width-600">
            Uncover the incredible natural wonders and beautiful landmarks tucked away in the vibrant valleys surrounding our boutique retreat.
          </p>
        </div>

        <div className="row g-4 mt-2">
          {attractions.map((attraction, index) => (
            <div 
              key={attraction.id} 
              className="col-lg-3 col-md-6 slide-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div 
                className="card h-100 border-0 shadow-sm overflow-hidden attraction-card position-relative" 
                style={{ 
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
                }}
              >
                {/* Image Container with overlay */}
                <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
                  <img 
                    src={attraction.image} 
                    alt={attraction.title} 
                    className="w-100 h-100 object-fit-cover attraction-image"
                    style={{ transition: 'transform 0.6s ease' }}
                  />
                  <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4))' }}></div>
                  <span 
                    className="position-absolute bottom-3 start-3 badge bg-blur text-white px-3 py-2" 
                    style={{ 
                      borderRadius: '50px',
                      fontSize: '0.8rem',
                      backdropFilter: 'blur(10px)',
                      backgroundColor: 'rgba(var(--color-accent-rgb), 0.85)',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    <i className="fas fa-map-marker-alt me-1"></i> {attraction.distance}
                  </span>
                </div>

                {/* Card Content */}
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex align-items-center mb-3">
                    <div 
                      className="d-flex align-items-center justify-content-center rounded-circle me-3" 
                      style={{ 
                        width: '45px', 
                        height: '45px', 
                        backgroundColor: 'rgba(var(--color-accent-rgb), 0.1)',
                        color: 'var(--color-accent)'
                      }}
                    >
                      <i className={`fas ${attraction.icon} fs-5`}></i>
                    </div>
                    <h5 className="card-title fw-bold mb-0 text-dark" style={{ fontSize: '1.1rem', lineHeight: '1.3' }}>
                      {attraction.title}
                    </h5>
                  </div>
                  <p className="card-text text-muted small flex-grow-1" style={{ lineHeight: '1.6' }}>
                    {attraction.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .attraction-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
        }
        .attraction-card:hover .attraction-image {
          transform: scale(1.1);
        }
        .max-width-600 {
          max-width: 600px;
        }
      `}</style>
    </section>
  );
};

export default NearestAttractions;
