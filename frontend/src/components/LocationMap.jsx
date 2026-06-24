import React from 'react';

const LocationMap = () => {
  return (
    <section className="location-section py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 text-center mb-4">
            <h2 className="section-title fade-in-up">Find Us Here</h2>
            <div className="title-underline mx-auto"></div>
            <p className="text-muted mt-3 fade-in-up">
              Nins Esmeralda Boutique Resort, situated in the lush greenery of Thusharagiri.
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col-12 fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="map-container" style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11561.057081300376!2d76.04583594438304!3d11.468476969548613!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba66d2121a16e2b%3A0x2a6b37e3d4fc6099!2sNins%20Esmeralda%20Boutique%20Resort!5e0!3m2!1sen!2sin!4v1782332765149!5m2!1sen!2sin" 
                width="100%" 
                height="450" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Resort Location Map"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationMap;
