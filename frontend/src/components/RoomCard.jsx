import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/formatImage';

const RoomCard = ({ room }) => {
  return (
    <div className="luxury-card shadow-sm h-100 d-flex flex-column rounded-3 border-0 bg-white">
      {/* Image with Zoom effect */}
      <Link to={`/rooms/${room.id}`} className="luxury-card-img-wrapper rounded-top-3 d-block text-decoration-none">
        <img 
          src={getImageUrl(room.image) || '/resort_img/6.jpeg'} 
          className="luxury-card-img" 
          alt={room.room_number} 
        />
        
        {/* Price Badge */}
        <div className="position-absolute top-0 start-0 m-3 p-2 bg-dark bg-opacity-75 text-white rounded px-3 shadow-sm animate__animated animate__fadeIn">
          <span className="fw-bold small">₹{room.price_per_night}</span>
          <small className="opacity-75 ms-1">/night</small>
        </div>

        {/* Availability Badge */}
        <div className="position-absolute top-0 end-0 m-3">
          <span className={`badge rounded-1 px-3 py-2 ${room.is_available ? 'bg-success' : 'bg-danger'} shadow-sm`}>
            {room.is_available ? 'Available' : 'Reserved'}
          </span>
        </div>
      </Link>

      {/* Info Content Area */}
      <div className="p-4 d-flex flex-column flex-grow-1 border border-top-0 border-light rounded-bottom-3">
        <div className="mb-2">
          <span className="text-accent text-uppercase fw-bold x-small letter-spacing-2">Room {room.room_number}</span>
        </div>
        
        {/* Shifting Serif Title */}
        <h4 className="font-serif-luxury text-dark mb-3">
          <div className="luxury-title-container">
            <span className="luxury-title-dash">—</span>
            {room.category_name}
          </div>
        </h4>

        <p className="text-muted small mb-4 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '40px', lineHeight: '1.6' }}>
          {room.description || 'Experience ultimate luxury, privacy, and natural serenity in our exquisitely curated stays.'}
        </p>

        {/* Dynamic details */}
        <div className="d-flex justify-content-between align-items-center mb-4 py-2 border-top border-bottom border-light">
          <div className="d-flex gap-3 text-muted small">
            <span><i className="fas fa-users me-1 text-accent"></i> {room.capacity} Guests</span>
            <span><i className="fas fa-compress-arrows-alt me-1 text-accent"></i> Premium Stay</span>
          </div>
          <span className="text-muted-50 small"><i className="far fa-clock me-1"></i> {room.check_in_time}</span>
        </div>

        {/* Buttons */}
        <div className="row g-2 mt-auto">
          <div className="col-6">
            <Link to={`/rooms/${room.id}`} className="btn btn-outline-dark btn-sm rounded-1 w-100 py-2 fw-medium text-uppercase letter-spacing-1" style={{ fontSize: '0.75rem' }}>
              Details
            </Link>
          </div>
          <div className="col-6">
            {room.is_available ? (
              <Link to={`/booking/${room.id}`} className="btn btn-accent btn-sm rounded-1 w-100 py-2 fw-bold text-uppercase letter-spacing-1 text-white" style={{ fontSize: '0.75rem' }}>
                Book Now
              </Link>
            ) : (
              <button className="btn btn-secondary btn-sm rounded-1 w-100 py-2 text-uppercase letter-spacing-1" style={{ fontSize: '0.75rem' }} disabled>
                Reserved
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
