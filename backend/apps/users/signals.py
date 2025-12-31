from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from .tasks import send_verification_email_task

User = get_user_model()

@receiver(post_save, sender=User)
def send_verification_email_on_create(sender, instance, created, **kwargs):
    if created and not instance.is_email_verified:
        uid = urlsafe_base64_encode(force_bytes(instance.pk))
        token = default_token_generator.make_token(instance)
        send_verification_email_task(str(instance.pk), token) 