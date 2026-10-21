from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import RoomCategory, Room, Gallery, ResortInformation, Booking, Payment, Review, Notification, NotificationRead, BlockedDate, UserProfile

User = get_user_model()

# --- USER SERIALIZERS ---
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('is_broker', 'is_broker_verified')

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'address', 'is_staff', 'profile')
        read_only_fields = ('id', 'is_staff')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    is_broker = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'phone_number', 'address', 'is_broker')
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        is_broker = validated_data.pop('is_broker', False)
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            address=validated_data.get('address', '')
        )
        UserProfile.objects.create(user=user, is_broker=is_broker)
        return user

# --- ROOM SERIALIZERS ---
class RoomCategorySerializer(serializers.ModelSerializer):
    description = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = RoomCategory
        fields = '__all__'

class RoomSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    description = serializers.CharField(required=False, allow_blank=True, default='')
    price_per_night = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True, default=0.00)
    adult_capacity = serializers.IntegerField(required=False, allow_null=True, default=2)
    child_capacity = serializers.IntegerField(required=False, allow_null=True, default=0)
    extra_capacity = serializers.CharField(required=False, allow_blank=True, default='')
    facilities = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = Room
        fields = '__all__'

    def to_internal_value(self, data):
        if hasattr(data, 'copy'):
            data = data.copy()
        elif isinstance(data, dict):
            data = data.copy()
        if 'price_per_night' in data and (data['price_per_night'] == '' or data['price_per_night'] is None):
            data['price_per_night'] = '0.00'
        if 'adult_capacity' in data and (data['adult_capacity'] == '' or data['adult_capacity'] is None):
            data['adult_capacity'] = 0
        if 'child_capacity' in data and (data['child_capacity'] == '' or data['child_capacity'] is None):
            data['child_capacity'] = 0
        if 'description' in data and data['description'] is None:
            data['description'] = ''
        if 'extra_capacity' in data and data['extra_capacity'] is None:
            data['extra_capacity'] = ''
        if 'facilities' in data and data['facilities'] is None:
            data['facilities'] = ''
        return super().to_internal_value(data)

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
    is_broker = serializers.SerializerMethodField()

    def get_is_broker(self, obj):
        try:
            return bool(obj.user and hasattr(obj.user, 'profile') and obj.user.profile.is_broker)
        except Exception:
            return False

    class Meta:
        model = Booking
        fields = ('id', 'user', 'username', 'user_email', 'user_phone', 'is_broker', 'room', 'room_details', 'guest_name', 'guest_phone', 'check_in_date', 'check_out_date', 'adults', 'kids', 'total_amount', 'status', 'created_at', 'payment', 'booking_key')
        read_only_fields = ('user', 'total_amount', 'status', 'booking_key')
        extra_kwargs = {
            'check_in_date': {'required': False, 'allow_null': True},
            'check_out_date': {'required': False, 'allow_null': True},
            'guest_name': {'required': False, 'allow_blank': True},
            'guest_phone': {'required': False, 'allow_blank': True},
        }

    def validate(self, attrs):
        check_in = attrs.get('check_in_date')
        check_out = attrs.get('check_out_date')
        room = attrs.get('room')
        
        if check_in and check_out and check_in >= check_out:
            raise serializers.ValidationError("Check-out date must be after check-in date.")
        
        if not room or not check_in or not check_out:
            return attrs
            
        overlapping_bookings = Booking.objects.filter(
            status__in=['Confirmed', 'Pending'],
            check_in_date__lt=check_out,
            check_out_date__gt=check_in
        )
        
        if self.instance:
            overlapping_bookings = overlapping_bookings.exclude(pk=self.instance.pk)
        
        request_numbers = set()
        if room.room_number:
            request_numbers = set([r.strip() for r in room.room_number.split(',') if r.strip()])
            
        overlapping_blocks = BlockedDate.objects.filter(
            start_date__lt=check_out,
            end_date__gt=check_in
        )

        for b in overlapping_bookings:
            if b.room_id == room.id:
                raise serializers.ValidationError("Room is already booked for these dates.")
            
            if b.room and b.room.room_number and request_numbers:
                b_numbers = set([r.strip() for r in b.room.room_number.split(',') if r.strip()])
                if request_numbers.intersection(b_numbers):
                    raise serializers.ValidationError(f"This room overlaps with an already booked room ({b.room.room_number}) for these dates.")
            
        for b in overlapping_blocks:
            if b.room_id == room.id:
                raise serializers.ValidationError("Room is blocked by admin for these dates.")
            
            if b.room and b.room.room_number and request_numbers:
                b_numbers = set([r.strip() for r in b.room.room_number.split(',') if r.strip()])
                if request_numbers.intersection(b_numbers):
                    raise serializers.ValidationError(f"This room overlaps with a blocked room ({b.room.room_number}) for these dates.")
            
        return attrs

# --- AVAILABILITY SERIALIZERS ---
class BlockedDateSerializer(serializers.ModelSerializer):
    room_name = serializers.CharField(source='room.category.name', read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)

    class Meta:
        model = BlockedDate
        fields = ('id', 'room', 'room_name', 'room_number', 'start_date', 'end_date', 'reason', 'created_at')


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
