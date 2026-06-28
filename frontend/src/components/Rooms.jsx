import { useState, useEffect } from 'react';
import api from '../services/api';
import RoomCard from './RoomCard';
import { useScrollReveal } from '../hooks/useScrollReveal';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    fetchRooms();
    fetchCategories();
  }, []);

  useScrollReveal('#rooms .slide-in-up', [rooms]);

  useEffect(() => {
    fetchRooms();
  }, [activeCategory]);

  const fetchRooms = async () => {
    try {
      let url = 'rooms/list/?';
      if (activeCategory) url += `category=${activeCategory}&`;
      const res = await api.get(url);
      setRooms(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('rooms/categories/');
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-light pb-5">
      {/* Header section above filters */}
      <div className="section-padding pb-4">
        <div className="container text-center">
          <h6 className="text-accent text-uppercase fw-bold letter-spacing-1">Accommodation</h6>
          <h2 className="display-5 fw-bold font-serif-luxury mt-2">Our Curated Stay Collections</h2>
          <div className="divider mx-auto mt-3" style={{ width: '50px', height: '2px', backgroundColor: 'var(--color-accent)' }}></div>
        </div>
      </div>

      <div className="sticky-filter-bar py-1 mb-5">
        <div className="container">
          <div className="filter-scroll-container justify-content-md-center align-items-center position-relative">
            <button 
              className={`sticky-filter-btn ${activeCategory === '' ? 'active' : ''}`}
              onClick={() => setActiveCategory('')}
            >
              All Stays
            </button>
            {categories.map(c => (
              <button 
                key={c.id}
                className={`sticky-filter-btn ${activeCategory === c.id.toString() ? 'active' : ''}`}
                onClick={() => setActiveCategory(c.id.toString())}
              >
                {c.name}
              </button>
            ))}
            
            <a 
              href="/booking/all" 
              className="btn btn-primary-modern rounded-pill fw-bold ms-md-4 shadow-sm"
              style={{ padding: '0.4rem 1.2rem', whiteSpace: 'nowrap' }}
            >
              <i className="fas fa-key me-2"></i> Book Entire Resort
            </a>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row g-5">
          {rooms.map((room, index) => (
            <div 
              key={room.id} 
              className="col-lg-4 col-md-6 slide-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <RoomCard room={room} />
            </div>
          ))}
          {rooms.length === 0 && (
            <div className="col-12 text-center py-5">
              <i className="fas fa-search fs-1 text-muted mb-3"></i>
              <h4 className="text-muted font-serif-luxury">No rooms found in this category.</h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Rooms;
