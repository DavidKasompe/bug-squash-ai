from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'is_email_verified', 'is_active', 'is_staff')
    list_filter = ('is_email_verified', 'is_active', 'is_staff')
    search_fields = ('email', 'username')
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('is_email_verified',)}),
    )

# Register your models here.
admin.site.register(User, CustomUserAdmin)
