from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, RoomCategory, Room, Gallery, ResortInformation, Booking, Payment, Review

admin.site.register(User, UserAdmin)
admin.site.register(RoomCategory)
admin.site.register(Room)
admin.site.register(Gallery)
admin.site.register(ResortInformation)
admin.site.register(Booking)
admin.site.register(Payment)
admin.site.register(Review)
