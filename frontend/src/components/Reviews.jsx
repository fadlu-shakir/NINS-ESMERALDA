import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getReviewsApi, createReviewApi, deleteReviewApi, getRoomsListApi } from '../services/allApi';
import { toast } from 'react-toastify';
import { useScrollReveal } from '../hooks/useScrollReveal';

const Reviews = () => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    fetchReviews();
    fetchRooms();
  }, []);

  useScrollReveal('#reviews .slide-in-up', [reviews]);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await getReviewsApi();
      setReviews(res.data);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
      toast.error('Could not load reviews.');
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await getRoomsListApi();
      setRooms(res.data);
    } catch (error) {
      console.error('Failed to fetch rooms', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.warning('Please enter a comment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        rating,
        comment,
        room: selectedRoom ? parseInt(selectedRoom) : null,
      };
      await createReviewApi(payload);
      toast.success('Thank you for your feedback!');
      setComment('');
      setRating(5);
      setSelectedRoom('');
      fetchReviews();
    } catch (error) {
      console.error('Failed to submit review', error);
      const msg = error.response?.data?.detail || 'Failed to submit review. Make sure you are logged in.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReviewApi(reviewId);
        toast.success('Review deleted successfully.');
        fetchReviews();
      } catch (error) {
        console.error('Failed to delete review', error);
        toast.error('Could not delete review.');
      }
    }
  };

  // Helper to map room ID to room number and category
  const getRoomName = (roomId) => {
    if (!roomId) return null;
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return null;
    return room.room_number ? `Room ${room.room_number} (${room.category_name})` : room.category_name;
  };

  return (
    <div className="section-padding bg-light border-top border-bottom overflow-hidden">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <h6 className="text-accent text-uppercase fw-bold letter-spacing-2 mb-2">Guest Feedback</h6>
          <h2 className="display-5 fw-bold mb-3">Stories From Our Paradise</h2>
          <div
            className="divider mx-auto"
            style={{ width: '80px', height: '4px', backgroundColor: 'var(--color-accent)', borderRadius: '2px' }}
          ></div>
        </div>

        <div className="row g-5">
          {/* Reviews List Column */}
          <div className="col-lg-8">
            <h4 className="fw-bold mb-4 d-flex align-items-center">
              <i className="fas fa-star-half-alt text-accent me-2"></i>
              What guests loved about Esmeralda
            </h4>

            {loadingReviews ? (
              <div className="text-center py-5">
                <div className="spinner-border text-accent mb-3"></div>
                <p className="text-muted">Loading stories...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-5 bg-white rounded-4 shadow-sm border p-4">
                <i className="far fa-comments text-muted display-4 mb-3"></i>
                <h5 className="fw-bold text-dark mb-1">No reviews yet</h5>
                <p className="text-muted small mb-0">Be the first to share your experience at our resort!</p>
              </div>
            ) : (
              <div className="row g-4">
                {reviews.map((r, index) => {
                  const initials = r.username ? r.username.substring(0, 2).toUpperCase() : 'GU';
                  const roomLabel = getRoomName(r.room);
                  const canDelete =
                    user && (user.is_staff || user.username === r.username || user.id === r.user);

                  return (
                    <div 
                      key={r.id} 
                      className="col-md-6 col-lg-12 slide-in-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div
                        className="card h-100 border-0 shadow-sm rounded-4 p-4 position-relative bg-white"
                        style={{
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          border: '1px solid rgba(0,0,0,0.05)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,0.075)';
                        }}
                      >
                        <div className="d-flex align-items-start gap-3">
                          {/* User Avatar Circle */}
                          {user && user.username === r.username ? (
                            <img
                              src="https://i1-c.pinimg.com/736x/93/1d/17/931d176cf12d85d1943d76684de79137.jpg"
                              alt={r.username}
                              className="rounded-circle flex-shrink-0"
                              style={{
                                width: '60px',
                                height: '60px',
                                objectFit: 'cover',
                                boxShadow: '0 4px 10px rgba(197, 168, 128, 0.2)',
                              }}
                            />
                          ) : (
                            <img
                              src="https://i1-c.pinimg.com/736x/34/c3/33/34c3332cb8eb6c448bb4544cd7df4bcd.jpg"
                              alt={r.username}
                              className="rounded-circle flex-shrink-0"
                              style={{
                                width: '60px',
                                height: '60px',
                                objectFit: 'cover',
                                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                              }}
                            />
                          )}

                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                              <div>
                                <h6 className="fw-bold mb-0 text-dark">{r.username}</h6>
                                <span className="text-muted x-small">
                                  {new Date(r.created_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                              {canDelete && (
                                <button
                                  onClick={() => handleDelete(r.id)}
                                  className="btn btn-sm btn-outline-danger border-0 rounded-circle d-flex align-items-center justify-content-center"
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    padding: '0',
                                    transition: 'all 0.2s',
                                  }}
                                  title="Delete Review"
                                >
                                  <i className="fas fa-trash-alt" style={{ fontSize: '0.8rem' }}></i>
                                </button>
                              )}
                            </div>

                            {/* Stars */}
                            <div className="my-2" style={{ color: '#ffc107', fontSize: '0.85rem' }}>
                              {Array.from({ length: 5 }).map((_, i) => (
                                <i
                                  key={i}
                                  className={`${i < r.rating ? 'fas' : 'far'} fa-star me-1`}
                                ></i>
                              ))}
                            </div>

                            {/* Room Info tag */}
                            {roomLabel && (
                              <span
                                className="badge bg-light text-dark border rounded-pill px-2.5 py-1 mb-2.5 x-small d-inline-flex align-items-center"
                                style={{ fontWeight: '500' }}
                              >
                                <i className="fas fa-bed text-accent me-1"></i> {roomLabel}
                              </span>
                            )}

                            {/* Comment */}
                            <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.925rem', lineHeight: '1.6' }}>
                              {r.comment}
                            </p>
                          </div>
                        </div>


                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form / CTA Column */}
          <div className="col-lg-4">
            {user ? (
              <div
                className="card border-0 shadow-sm rounded-4 p-4 bg-white"
                style={{ position: 'sticky', top: '100px', border: '1px solid rgba(0,0,0,0.05)' }}
              >
                <h4 className="fw-bold mb-2">Write a Review</h4>
                <p className="text-muted small mb-4">We would love to hear your thoughts about your stay.</p>

                <form onSubmit={handleSubmit}>
                  {/* Star Rating Select */}
                  <div className="mb-4">
                    <label className="form-label text-muted small fw-bold d-block mb-2">Overall Rating</label>
                    <div className="d-flex align-items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const index = i + 1;
                        const isStarred = index <= (hoverRating || rating);
                        return (
                          <button
                            type="button"
                            key={i}
                            className="btn btn-link p-0 text-decoration-none border-0"
                            style={{
                              color: isStarred ? '#ffc107' : '#e2e8f0',
                              fontSize: '2rem',
                              transition: 'transform 0.15s ease',
                            }}
                            onMouseEnter={() => setHoverRating(index)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(index)}
                          >
                            <i className={`${isStarred ? 'fas' : 'far'} fa-star`}></i>
                          </button>
                        );
                      })}
                      <span className="ms-2 fw-bold text-muted small">({rating}/5)</span>
                    </div>
                  </div>

                  {/* Room Selection Dropdown */}
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">Select Room (Optional)</label>
                    <select
                      className="form-select"
                      value={selectedRoom}
                      onChange={(e) => setSelectedRoom(e.target.value)}
                    >
                      <option value="">General Resort Feedback</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.room_number ? `Room ${room.room_number} - ` : ''}
                          {room.category_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Comment Text Area */}
                  <div className="mb-4">
                    <label className="form-label text-muted small fw-bold">Your Review</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      required
                      placeholder="Share details of your experience, hospitality, ambience..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      style={{ fontSize: '0.9rem' }}
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary-modern w-100 rounded-3 py-2.5 d-flex align-items-center justify-content-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        Submit Feedback
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div
                className="card border-0 shadow-sm rounded-4 p-4 text-center text-white"
                style={{
                  position: 'sticky',
                  top: '100px',
                  background: 'linear-gradient(135deg, #3e3325 0%, #1c1917 100%)',
                }}
              >
                <div className="mb-3.5 mt-2">
                  <div
                    className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: '70px', height: '70px' }}
                  >
                    <i className="fas fa-heart text-accent fs-3"></i>
                  </div>
                </div>
                <h4 className="fw-bold mb-2">Share Your Story</h4>
                <p className="small text-white-50 mb-4 px-2">
                  Have you stayed at Esmeralda Boutique Resort? Log in to rate your stay and leave feedback.
                </p>
                <Link to="/login" className="btn btn-light rounded-pill px-4.5 py-2.5 fw-bold text-accent shadow-sm">
                  Login & Write a Review
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
