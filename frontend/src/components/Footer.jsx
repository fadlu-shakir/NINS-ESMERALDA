import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 mb-4 mb-lg-0">
            <h5>ESMERALDA BOUTIQUE RESORT</h5>
            <p className="mt-3">Tucked away in the lush greenery of Thusharigiri, Esmeralda Boutique Resort is a peaceful and private escape designed for couples and small families who seek quality time, beautiful views, and a calming ambience.</p>
            <div className="d-flex gap-3 mt-4">
              <a href="#" className="fs-5"><i className="fab fa-facebook-f"></i></a>
              <a href="https://www.instagram.com/esmeraldaresort_?igsh=MXNxNzExZ3M2cm5tcw==" target="_blank" rel="noopener noreferrer" className="fs-5"><i className="fab fa-instagram"></i></a>
              <a href="https://wa.me/918590130953" target="_blank" rel="noopener noreferrer" className="fs-5"><i className="fab fa-whatsapp"></i></a>
            </div>
          </div>
          
          <div className="col-lg-2 offset-lg-2 col-md-6 mb-4 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled mt-3">
              <li className="mb-2"><a href="/#">Home</a></li>
              <li className="mb-2"><a href="/#rooms">Our Rooms</a></li>
              <li className="mb-2"><a href="/#gallery">Gallery</a></li>
              <li className="mb-2"><a href="/#about">About Us</a></li>
              <li className="mb-2"><a href="/#attractions">Attractions</a></li>
            </ul>
          </div>
          
          <div className="col-lg-4 col-md-6">
            <h5>Contact Us</h5>
            <ul className="list-unstyled mt-3">
              <li className="mb-3"><i className="fas fa-map-marker-alt me-2 text-accent"></i> Esmeralda Boutique Resort,Thusharagiri</li>
              <li className="mb-3">
                <a href="tel:+918590130953" className="text-decoration-none text-white">
                  <i className="fas fa-phone me-2 text-accent"></i> +91 85901 30953
                </a>
              </li>
              <li className="mb-3">
                <a href="mailto:ninsesmeralda@gmail.com" className="text-decoration-none text-white hover-accent transition-all">
                  <i className="fas fa-envelope me-2 text-accent"></i> ninsesmeralda@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="mt-5 mb-4 border-light opacity-25" />
        <div className="text-center">
          <p className="mb-0">&copy; {new Date().getFullYear()}@ Esmeralda Boutique Resort. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
