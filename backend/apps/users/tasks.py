from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.contrib.auth import get_user_model

User = get_user_model()

@shared_task
def send_verification_email_task(user_id, token):
    """Sends an email verification link to the user."""
    try:
        user = User.objects.get(pk=user_id)
        # Build the verification link
        # Assuming your frontend will handle this URL, or Django will serve a simple page
        # For Django's templated views, you'd use reverse with a Django view.
        # For an API endpoint, it's a direct URL that the frontend can consume.
        verify_link = f"{settings.SITE_URL}/api/auth/verify-email/{user_id}/{token}/"

        subject = 'Verify Your BugSquash.AI Account'
        html_message = render_to_string(
            'registration/account_verification_email.html', 
            {'user': user, 'verify_link': verify_link}
        )
        plain_message = strip_tags(html_message)

        send_mail(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=False,
        )
        print(f"Verification email sent to {user.email}")

    except User.DoesNotExist:
        print(f"User with ID {user_id} not found for email verification.")
    except Exception as e:
        print(f"Error sending verification email to user {user_id}: {e}") 