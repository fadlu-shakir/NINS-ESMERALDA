import api from './api';

// ==================== USER APIs ====================

// Register new user (initiates OTP verification)
export const userRegisterApi = async (data) => {
  return await api.post('users/register/', data);
};

// Verify registration OTP
export const userVerifyOtpApi = async (data) => {
  return await api.post('users/verify-otp/', data);
};

// Resend registration OTP
export const userResendOtpApi = async (data) => {
  return await api.post('users/resend-otp/', data);
};

// Login user (obtain token)
export const userLoginApi = async (data) => {
  return await api.post('users/login/', data);
};

// Get current user profile details
export const userProfileApi = async () => {
  return await api.get('users/profile/');
};

// Logout user
export const userLogoutApi = async (data) => {
  return await api.post('users/logout/', data);
};

// Get list of all users (Admin)
export const getUsersListApi = async () => {
  return await api.get('users/list/');
};

// Verify user password
export const verifyPasswordApi = async (data) => {
  return await api.post('users/verify-password/', data);
};

// Toggle admin status of a user (Admin)
export const toggleAdminApi = async (userId) => {
  return await api.post(`users/${userId}/toggle-admin/`);
};


// ==================== ROOM & CATEGORY APIs ====================

// Get room details by id
export const getRoomDetailsApi = async (id) => {
  return await api.get(`rooms/list/${id}/`);
};

// Get booked dates for a specific room
export const getRoomBookedDatesApi = async (id) => {
  return await api.get(`rooms/list/${id}/booked_dates/`);
};

// Get general rooms/resort information
export const getRoomsInfoApi = async () => {
  return await api.get('rooms/info/');
};

// Get list of all rooms
export const getRoomsListApi = async (customUrl = null) => {
  const url = customUrl || 'rooms/list/';
  return await api.get(url);
};

// Get list of all room categories
export const getRoomCategoriesApi = async () => {
  return await api.get('rooms/categories/');
};

// Add a new room (Admin)
export const addRoomApi = async (formData, config = {}) => {
  return await api.post('rooms/list/', formData, config);
};

// Update an existing room details (Admin)
export const updateRoomApi = async (roomId, formData, config = {}) => {
  return await api.put(`rooms/list/${roomId}/`, formData, config);
};

// Partially update room details (e.g. status/availability) (Admin)
export const patchRoomApi = async (roomId, data) => {
  return await api.patch(`rooms/list/${roomId}/`, data);
};

// Delete a room (Admin)
export const deleteRoomApi = async (id) => {
  return await api.delete(`rooms/list/${id}/`);
};

// Add a new room category (Admin)
export const addCategoryApi = async (categoryForm) => {
  return await api.post('rooms/categories/', categoryForm);
};

// Update an existing room category (Admin)
export const updateCategoryApi = async (categoryId, categoryForm) => {
  return await api.put(`rooms/categories/${categoryId}/`, categoryForm);
};

// Delete a category (Admin)
export const deleteCategoryApi = async (id) => {
  return await api.delete(`rooms/categories/${id}/`);
};


// ==================== BOOKING APIs ====================

// Get all bookings (User or Admin list depending on authentication scope)
export const getBookingsApi = async () => {
  return await api.get('bookings/');
};

// Get details of a single booking by id
export const getBookingDetailsApi = async (id) => {
  return await api.get(`bookings/${id}/`);
};

// Create a new booking
export const createBookingApi = async (data) => {
  return await api.post('bookings/', data);
};

// Request booking cancellation
export const requestBookingCancelApi = async (id) => {
  return await api.post(`bookings/${id}/cancel/`);
};

// Withdraw booking cancellation request
export const withdrawBookingCancelApi = async (id) => {
  return await api.post(`bookings/${id}/withdraw_cancellation/`);
};

// Process booking payment
export const payBookingApi = async (id) => {
  return await api.post(`bookings/${id}/pay/`);
};

// Approve booking (Admin)
export const approveBookingApi = async (id) => {
  return await api.post(`bookings/${id}/approve/`);
};

// Approve cancellation request (Admin)
export const approveBookingCancelApi = async (id) => {
  return await api.post(`bookings/${id}/approve_cancellation/`);
};

// Reject cancellation request (Admin)
export const rejectBookingCancelApi = async (id) => {
  return await api.post(`bookings/${id}/reject_cancellation/`);
};


// ==================== NOTIFICATION APIs ====================

// Get count of unread notifications
export const getUnreadNotificationsCountApi = async () => {
  return await api.get('notifications/unread_count/');
};

// Get all notifications (active/all)
export const getNotificationsApi = async (activeOnly = false) => {
  const url = activeOnly ? 'notifications/?active_only=true' : 'notifications/';
  return await api.get(url);
};

// Mark notification as read
export const markNotificationAsReadApi = async (id) => {
  return await api.post(`notifications/${id}/mark_as_read/`);
};

// Create a notification broadcast (Admin)
export const createNotificationApi = async (formData) => {
  return await api.post('notifications/', formData);
};


// ==================== REVIEW APIs ====================

// Get all reviews
export const getReviewsApi = async () => {
  return await api.get('reviews/');
};

// Create a new review
export const createReviewApi = async (data) => {
  return await api.post('reviews/', data);
};

// Delete an existing review
export const deleteReviewApi = async (id) => {
  return await api.delete(`reviews/${id}/`);
};
