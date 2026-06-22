from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

# --- USER MODELS ---
class User(AbstractUser):
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.username

# --- ROOM MODELS ---
class RoomCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to='categories/', null=True, blank=True)

    def __str__(self):
        return self.name

class Room(models.Model):
    category = models.ForeignKey(RoomCategory, related_name='rooms', on_delete=models.CASCADE)
    room_number = models.CharField(max_length=10, unique=True, null=True, blank=True)
    description = models.TextField()
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    capacity = models.IntegerField(default=2)
    facilities = models.TextField(help_text="Comma separated facilities e.g., WiFi, AC, TV")
    is_available = models.BooleanField(default=True)
    image = models.ImageField(upload_to='rooms/', null=True, blank=True)
    image2 = models.ImageField(upload_to='rooms/', null=True, blank=True)
    image3 = models.ImageField(upload_to='rooms/', null=True, blank=True)
    image4 = models.ImageField(upload_to='rooms/', null=True, blank=True)
    image5 = models.ImageField(upload_to='rooms/', null=True, blank=True)
    check_in_time = models.CharField(max_length=20, default="03:30 PM")
    check_out_time = models.CharField(max_length=20, default="02:30 PM")

    def __str__(self):
        number_display = self.room_number if self.room_number else "Unnumbered"
        return f"{number_display} - {self.category.name}"

class Gallery(models.Model):
    image = models.ImageField(upload_to='gallery/')
    caption = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.caption or f"Image {self.id}"

class ResortInformation(models.Model):
    name = models.CharField(max_length=200, default="Smart Resort")
    description = models.TextField()
    address = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    amenities = models.TextField(help_text="Comma separated amenities")

    def __str__(self):
        return self.name

# --- BOOKING MODELS ---
class Booking(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Cancellation Requested', 'Cancellation Requested'),
        ('Cancelled', 'Cancelled'),
    )

    user = models.ForeignKey(User, related_name='bookings', on_delete=models.CASCADE)
    room = models.ForeignKey(Room, related_name='bookings', on_delete=models.CASCADE)
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    guest_count = models.IntegerField(default=1)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.room.room_number} ({self.status})"

    def save(self, *args, **kwargs):
        if self.check_in_date and self.check_out_date and self.room:
            days = (self.check_out_date - self.check_in_date).days
            if days <= 0:
                days = 1
            self.total_amount = days * self.room.price_per_night
        super().save(*args, **kwargs)

class Payment(models.Model):
    PAYMENT_STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Failed', 'Failed'),
    )
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='Pending')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.id} for Booking {self.booking.id}"

# --- REVIEW MODELS ---
class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)
    rating = models.IntegerField(default=5)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.room.room_number}"

class Notification(models.Model):
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_broadcast = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class NotificationRead(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE)
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'notification')

class OTPVerification(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='otp_verification', null=True, blank=True)
    otp_code = models.CharField(max_length=6, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=timezone.now)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        user_display = self.user.username if self.user else "Anonymous"
        return f"OTP for {user_display}: {self.otp_code}"

