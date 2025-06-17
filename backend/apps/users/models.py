from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.

class User(AbstractUser):
    github_connected = models.BooleanField(default=False)
    github_username = models.CharField(max_length=255, blank=True, null=True)
    email_verified = models.BooleanField(default=False)
    # Add more custom fields as needed

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.username
