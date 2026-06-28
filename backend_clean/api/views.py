import uuid
from django.utils import timezone
from datetime import timedelta
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model

from django.core.mail import send_mail
import random

from .models import RoomCategory, Room, Gallery, ResortInformation, Booking, Payment, Review, Notification, NotificationRead, OTPVerification
from .serializers import (
    UserSerializer, RegisterSerializer, 
    RoomCategorySerializer, RoomSerializer, GallerySerializer, ResortInformationSerializer,
    BookingSerializer, ReviewSerializer, NotificationSerializer
)

User = get_user_model()

# --- PERMISSIONS ---
class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user or request.user.is_staff

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        username = request.data.get('username')
        email = request.data.get('email')

        # Clean up any unverified registrations with same username or email first
        if username:
            User.objects.filter(username=username, is_active=False).delete()
        if email:
            User.objects.filter(email=email, is_active=False).delete()

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.save()
        user.is_active = False
        user.save()

        otp_code = f"{random.randint(100000, 999999)}"
        expires_at = timezone.now() + timedelta(minutes=10)

        OTPVerification.objects.create(
            user=user,
            otp_code=otp_code,
            expires_at=expires_at
        )

        from django.conf import settings
        try:
            subject = "Verify Your Account - Smart Resort"
            message_body = (
                f"Dear {user.first_name or user.username},\n\n"
                f"Thank you for registering at Smart Resort! To complete your registration, "
                f"please use the following 6-digit One-Time Password (OTP):\n\n"
                f"--- {otp_code} ---\n\n"
                f"This code will expire in 10 minutes.\n\n"
                f"Warm regards,\n"
                f"Smart Resort Team"
            )
            send_mail(
                subject,
                message_body,
                None,
                [user.email],
                fail_silently=False,
            )
            if not getattr(settings, 'ANYMAIL', {}).get('SENDGRID_API_KEY'):
                # If no real email server is configured, tell the user the OTP directly
                success_msg = f"Registration initiated. (Demo Mode: Your OTP is {otp_code})"
            else:
                success_msg = "Registration initiated. Verification OTP sent to your email."
        except Exception as e:
            print(f"Failed to send email to {user.email}: {str(e)}")
            print(f"🔑 [DEVELOPER FALLBACK] Generated OTP Code for {user.username} is: {otp_code}")
            success_msg = f"Registration initiated. (Email failed to send. Your OTP is: {otp_code})"

        return Response({
            "status": "otp_sent",
            "message": success_msg,
            "username": user.username,
            "email": user.email
        }, status=status.HTTP_201_CREATED)


class VerifyOTPView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        username = request.data.get('username')
        otp_code = request.data.get('otp_code')

        if not username or not otp_code:
            return Response({"detail": "Username and OTP code are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if user.is_active:
            return Response({"detail": "User account is already verified and active."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            otp_verification = OTPVerification.objects.get(user=user)
        except OTPVerification.DoesNotExist:
            return Response({"detail": "No OTP registration found for this user."}, status=status.HTTP_400_BAD_REQUEST)

        if otp_verification.is_expired():
            return Response({"detail": "OTP code has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

        if otp_verification.otp_code != otp_code:
            return Response({"detail": "Invalid OTP code."}, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = True
        user.save()
        otp_verification.delete()

        # Generate simplejwt tokens for auto-login
        refresh = RefreshToken.for_user(user)
        return Response({
            "status": "verified",
            "message": "Account activated successfully!",
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class ResendOTPView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        username = request.data.get('username')

        if not username:
            return Response({"detail": "Username is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if user.is_active:
            return Response({"detail": "User account is already active."}, status=status.HTTP_400_BAD_REQUEST)

        OTPVerification.objects.filter(user=user).delete()

        otp_code = f"{random.randint(100000, 999999)}"
        expires_at = timezone.now() + timedelta(minutes=10)

        OTPVerification.objects.create(
            user=user,
            otp_code=otp_code,
            expires_at=expires_at
        )

        from django.conf import settings
        try:
            subject = "Verify Your Account - Smart Resort"
            message_body = (
                f"Dear {user.first_name or user.username},\n\n"
                f"You requested a new One-Time Password (OTP) for your registration. "
                f"Please use the following 6-digit code:\n\n"
                f"--- {otp_code} ---\n\n"
                f"This code will expire in 10 minutes.\n\n"
                f"Warm regards,\n"
                f"Smart Resort Team"
            )
            send_mail(
                subject,
                message_body,
                None,
                [user.email],
                fail_silently=False,
            )
            if not getattr(settings, 'ANYMAIL', {}).get('SENDGRID_API_KEY'):
                success_msg = f"A new verification OTP has been sent. (Demo Mode: Your OTP is {otp_code})"
            else:
                success_msg = "A new verification OTP has been sent to your email."
        except Exception as e:
            print(f"Failed to send email to {user.email}: {str(e)}")
            print(f"🔑 [DEVELOPER FALLBACK] Generated OTP Code for {user.username} is: {otp_code}")
            success_msg = f"A new verification OTP has been sent. (Email failed to send. Your OTP is: {otp_code})"

        return Response({
            "status": "otp_resent",
            "message": success_msg,
            "email": user.email
        }, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class VerifyPasswordView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        password = request.data.get('password', '')
        if request.user.check_password(password):
            return Response({'status': 'verified'})
        return Response({'detail': 'Invalid password'}, status=status.HTTP_401_UNAUTHORIZED)

class ToggleAdminView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            target_user = User.objects.get(pk=pk)
            # Prevent demoting oneself
            if target_user == request.user:
                return Response({'detail': 'Cannot change your own admin status'}, status=status.HTTP_400_BAD_REQUEST)
            
            target_user.is_staff = not target_user.is_staff
            target_user.save()
            
            action = "promoted to" if target_user.is_staff else "demoted from"
            return Response({'status': f'User {action} admin successfully', 'is_staff': target_user.is_staff})
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

# --- ROOM VIEWS ---
class RoomCategoryViewSet(viewsets.ModelViewSet):
    queryset = RoomCategory.objects.all()
    serializer_class = RoomCategorySerializer
    permission_classes = [IsAdminOrReadOnly]

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'is_available', 'capacity']
    search_fields = ['room_number', 'description', 'facilities']
    ordering_fields = ['price_per_night']

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def booked_dates(self, request, pk=None):
        room = self.get_object()
        bookings = Booking.objects.filter(room=room, status__in=['Confirmed', 'Pending'])
        data = []
        for b in bookings:
            data.append({
                'check_in': b.check_in_date.strftime('%Y-%m-%d'),
                'check_out': b.check_out_date.strftime('%Y-%m-%d'),
                'status': b.status
            })
        return Response(data)

class GalleryViewSet(viewsets.ModelViewSet):
    queryset = Gallery.objects.all()
    serializer_class = GallerySerializer
    permission_classes = [IsAdminOrReadOnly]

class ResortInformationViewSet(viewsets.ModelViewSet):
    queryset = ResortInformation.objects.all()
    serializer_class = ResortInformationSerializer
    permission_classes = [IsAdminOrReadOnly]

# --- BOOKING VIEWS ---
class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Booking.objects.all().order_by('-created_at')
        return Booking.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def pay(self, request, pk=None):
        booking = self.get_object()
        if booking.status == 'Confirmed':
            return Response({'detail': 'Booking is already confirmed and paid.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Mock payment success
        payment, created = Payment.objects.get_or_create(
            booking=booking,
            defaults={'amount': booking.total_amount, 'payment_status': 'Completed', 'transaction_id': str(uuid.uuid4())}
        )
        
        if not created and payment.payment_status != 'Completed':
            payment.payment_status = 'Completed'
            payment.transaction_id = str(uuid.uuid4())
            payment.save()

        booking.status = 'Confirmed'
        booking.save()
        return Response({'detail': 'Payment successful, booking confirmed.', 'transaction_id': payment.transaction_id})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        booking = self.get_object()
        booking.status = 'Confirmed'
        booking.save()
        return Response({'status': 'Booking approved'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.user != request.user and not request.user.is_staff:
            return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
        booking.status = 'Cancellation Requested'
        booking.save()
        return Response({'status': 'Cancellation requested'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def withdraw_cancellation(self, request, pk=None):
        booking = self.get_object()
        if booking.user != request.user and not request.user.is_staff:
            return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            
        if booking.status != 'Cancellation Requested':
            return Response({'detail': 'Cancellation not requested for this booking'}, status=status.HTTP_400_BAD_REQUEST)
        
        has_payment = hasattr(booking, 'payment') and booking.payment.payment_status == 'Completed'
        booking.status = 'Confirmed' if has_payment else 'Pending'
        booking.save()
        
        return Response({'status': 'Cancellation request withdrawn'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve_cancellation(self, request, pk=None):
        booking = self.get_object()
        if booking.status != 'Cancellation Requested':
            return Response({'detail': 'Cancellation not requested for this booking'}, status=status.HTTP_400_BAD_REQUEST)
        
        booking.status = 'Cancelled'
        booking.save()
        return Response({'status': 'Booking successfully cancelled'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject_cancellation(self, request, pk=None):
        booking = self.get_object()
        if booking.status != 'Cancellation Requested':
            return Response({'detail': 'Cancellation not requested for this booking'}, status=status.HTTP_400_BAD_REQUEST)
        
        booking.status = 'Confirmed'
        booking.save()
        return Response({'status': 'Cancellation rejected'})

# --- REVIEW VIEWS ---
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['room', 'rating']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# --- NOTIFICATION VIEWS ---
class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Notification.objects.all().order_by('-created_at')
        if self.request.query_params.get('active_only') == 'true':
            three_days_ago = timezone.now() - timedelta(days=3)
            read_ids = NotificationRead.objects.filter(user=self.request.user).values_list('notification_id', flat=True)
            qs = qs.filter(created_at__gte=three_days_ago).exclude(id__in=read_ids)
        return qs

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        read, created = NotificationRead.objects.get_or_create(
            user=request.user,
            notification=notification
        )
        return Response({'status': 'Marked as read'})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        three_days_ago = timezone.now() - timedelta(days=3)
        recent_broadcasts = Notification.objects.filter(is_broadcast=True, created_at__gte=three_days_ago)
        read_recent_count = NotificationRead.objects.filter(user=request.user, notification__in=recent_broadcasts).count()
        unread = max(0, recent_broadcasts.count() - read_recent_count)
        return Response({'unread_count': unread})
