from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, VerifyEmailView, PasswordResetRequestView, PasswordResetConfirmView, test_aws_credentials
from django.contrib.auth import views as auth_views # Import Django's auth views

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify-email/<str:uidb64>/<str:token>/', VerifyEmailView.as_view(), name='verify_email'),

    # Password Reset URLs
    path('password_reset/', 
         auth_views.PasswordResetView.as_view(
             template_name='registration/password_reset_form.html'
         ),
         name='password_reset'
    ),
    path('password_reset/done/', 
         auth_views.PasswordResetDoneView.as_view(
             template_name='registration/password_reset_done.html'
         ),
         name='password_reset_done'
    ),
    path('reset/<uidb64>/<token>/', 
         auth_views.PasswordResetConfirmView.as_view(
             template_name='registration/password_reset_confirm.html'
         ),
         name='password_reset_confirm'
    ),
    path('reset/done/', 
         auth_views.PasswordResetCompleteView.as_view(
             template_name='registration/password_reset_complete.html'
         ),
         name='password_reset_complete'
    ),
    path('test-aws/', test_aws_credentials, name='test-aws-credentials'),
] 