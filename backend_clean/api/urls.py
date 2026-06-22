from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    RegisterView, VerifyOTPView, ResendOTPView, UserProfileView, LogoutView, UserListView,
    VerifyPasswordView, ToggleAdminView,
    RoomCategoryViewSet, RoomViewSet, GalleryViewSet, ResortInformationViewSet,
    BookingViewSet, ReviewViewSet, NotificationViewSet
)

router = DefaultRouter()
router.register(r'rooms/categories', RoomCategoryViewSet, basename='room-categories')
router.register(r'rooms/list', RoomViewSet, basename='rooms')
router.register(r'rooms/gallery', GalleryViewSet, basename='gallery')
router.register(r'rooms/info', ResortInformationViewSet, basename='resort-info')
router.register(r'bookings', BookingViewSet, basename='bookings')
router.register(r'reviews', ReviewViewSet, basename='reviews')
router.register(r'notifications', NotificationViewSet, basename='notifications')

urlpatterns = [
    # Auth & User Routes
    path('users/register/', RegisterView.as_view(), name='auth_register'),
    path('users/verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('users/resend-otp/', ResendOTPView.as_view(), name='resend_otp'),
    path('users/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/logout/', LogoutView.as_view(), name='auth_logout'),
    path('users/profile/', UserProfileView.as_view(), name='user_profile'),
    path('users/list/', UserListView.as_view(), name='user_list'),
    path('users/verify-password/', VerifyPasswordView.as_view(), name='verify_password'),
    path('users/<int:pk>/toggle-admin/', ToggleAdminView.as_view(), name='toggle_admin'),

    # ViewSet Routes (Rooms, Bookings, Reviews)
    path('', include(router.urls)),
]
