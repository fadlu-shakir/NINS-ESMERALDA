import { useEffect } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const Reviews = () => {
  // Ensure the animation triggers on load
  useScrollReveal('#reviews .slide-in-up', []);

  useEffect(() => {
    // Add the Elfsight platform script dynamically if not already present
    const scriptId = 'elfsight-platform-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://elfsightcdn.com/platform.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="section-padding bg-light border-top border-bottom overflow-hidden">
      <div className="container slide-in-up" id="reviews">
        {/* Header */}
        <div className="text-center mb-5">
          <h6 className="text-accent text-uppercase fw-bold letter-spacing-2 mb-2">Guest Feedback</h6>
          <h2 className="display-5 fw-bold mb-3">Stories From Our Paradise</h2>
          <div
            className="divider mx-auto"
            style={{ width: '80px', height: '4px', backgroundColor: 'var(--color-accent)', borderRadius: '2px' }}
          ></div>
        </div>

        <div className="row justify-content-center">
          <div className="col-12">
            {/* Elfsight Google Reviews Widget */}
            <div className="elfsight-app-a6be44cf-f605-4d41-862d-41f2dc8b1d14" data-elfsight-app-lazy></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
