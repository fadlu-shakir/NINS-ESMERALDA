from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import RoomCategory, Room, Gallery, ResortInformation, Booking, Payment, Review, Notification, NotificationRead

User = get_user_model()

# --- USER SERIALIZERS ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'address', 'is_staff')
        read_only_fields = ('id', 'is_staff')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'phone_number')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', '')
        )
        return user

# --- ROOM SERIALIZERS ---
class RoomCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomCategory
        fields = '__all__'

class RoomSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Room
        fields = '__all__'

class GallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Gallery
        fields = '__all__'

class ResortInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResortInformation
        fields = '__all__'

# --- BOOKING SERIALIZERS ---
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    room_details = RoomSerializer(source='room', read_only=True)
    payment = PaymentSerializer(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_phone = serializers.CharField(source='user.phone_number', read_only=True)

    class Meta:
        model = Booking
        fields = ('id', 'user', 'username', 'user_email', 'user_phone', 'room', 'room_details', 'is_entire_resort', 'check_in_date', 'check_out_date', 'total_amount', 'status', 'created_at', 'payment')
        read_only_fields = ('user', 'total_amount', 'status')

    def validate(self, attrs):
        check_in = attrs.get('check_in_date')
        check_out = attrs.get('check_out_date')
        room = attrs.get('room')
        is_entire_resort = attrs.get('is_entire_resort', False)
        
        if check_in and check_out and check_in >= check_out:
            raise serializers.ValidationError("Check-out date must be after check-in date.")
            
        # Check if entire resort is booked for these dates
        overlapping_entire = Booking.objects.filter(
            is_entire_resort=True,
            status__in=['Confirmed', 'Pending'],
            check_in_date__lt=check_out,
            check_out_date__gt=check_in
        )
        if overlapping_entire.exists():
            raise serializers.ValidationError("The entire resort is already booked for these dates.")
            
        if is_entire_resort:
            # If trying to book entire resort, check if ANY room is booked
            overlapping_rooms = Booking.objects.filter(
                is_entire_resort=False,
                status__in=['Confirmed', 'Pending'],
                check_in_date__lt=check_out,
                check_out_date__gt=check_in
            )
            if overlapping_rooms.exists():
                raise serializers.ValidationError("Cannot book entire resort: some rooms are already booked for these dates.")
        else:
            if not room:
                raise serializers.ValidationError("Room is required if not booking entire resort.")
            overlapping_bookings = Booking.objects.filter(
                room=room,
                status__in=['Confirmed', 'Pending'],
                check_in_date__lt=check_out,
                check_out_date__gt=check_in
            )
            if overlapping_bookings.exists():
                raise serializers.ValidationError("Room is already booked for these dates.")
            
        return attrs

# --- REVIEW SERIALIZERS ---
class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'user', 'username', 'room', 'rating', 'comment', 'created_at')
        read_only_fields = ('user', 'username')

# --- NOTIFICATION SERIALIZERS ---
class NotificationSerializer(serializers.ModelSerializer):
    is_read = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ('id', 'title', 'message', 'is_broadcast', 'created_at', 'is_read')

    def get_is_read(self, obj):
        user = self.context.get('request').user
        if not user or not user.is_authenticated:
            return False
        return NotificationRead.objects.filter(user=user, notification=obj).exists()
