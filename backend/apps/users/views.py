import os
import json
import requests
import logging
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    UserRegistrationSerializer,
    LoginSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    GitHubCallbackSerializer,
    GitHubUserSerializer
)
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str, force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
import boto3
from botocore.exceptions import ClientError
from .models import GitHubOAuth
from .tasks import send_verification_email_task, send_password_reset_email_task

User = get_user_model()
logger = logging.getLogger(__name__)

# Create your views here.

class RegisterView(APIView):
    def post(self, request):
        logger.info('Received registration data: %s', request.data)
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            logger.info('User registered successfully: %s', user.username)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.error('Registration validation errors: %s', serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                }
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmailVerificationView(APIView):
    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.is_email_verified = True
            user.save()
            return Response({'message': 'Email successfully verified.'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Invalid verification link.'}, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def test_aws_credentials(request):
#     """
#     Test endpoint to verify AWS credentials
#     """
#     try:
#         # Create an S3 client
#         s3_client = boto3.client(
#             's3',
#             aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
#             aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
#             region_name=settings.AWS_S3_REGION_NAME
#         )
#         
#         # Try to list buckets (this will verify credentials)
#         response = s3_client.list_buckets()
#         
#         return Response({
#             'status': 'success',
#             'message': 'AWS credentials are valid',
#             'buckets': [bucket['Name'] for bucket in response['Buckets']]
#         })
#     except ClientError as e:
#         return Response({
#             'status': 'error',
#             'message': f'AWS credentials are invalid: {str(e)}'
#         }, status=400)
#     except Exception as e:
#         return Response({
#             'status': 'error',
#             'message': f'An error occurred: {str(e)}'
#         }, status=500)

class PasswordResetRequestView(APIView):
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.get(email=email)
            
            # Generate token and send email
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            
            # Send password reset email
            send_password_reset_email_task.delay(str(user.pk), token)
            
            return Response({
                'message': 'Password reset email has been sent.'
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            serializer = PasswordResetConfirmSerializer(data=request.data)
            if serializer.is_valid():
                user.set_password(serializer.validated_data['password'])
                user.save()
                return Response({
                    'message': 'Password has been reset successfully.'
                }, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({
            'message': 'Invalid password reset link.'
        }, status=status.HTTP_400_BAD_REQUEST)

class GitHubOAuthView(APIView):
    def get(self, request):
        """Generate GitHub OAuth URL"""
        state = request.session.get('github_oauth_state')
        if not state:
            return Response(
                {'error': 'No OAuth state found. Please try again.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        github_client_id = settings.GITHUB_CLIENT_ID
        redirect_uri = settings.GITHUB_REDIRECT_URI
        scope = 'user:email repo'

        auth_url = (
            f'https://github.com/login/oauth/authorize'
            f'?client_id={github_client_id}'
            f'&redirect_uri={redirect_uri}'
            f'&scope={scope}'
            f'&state={state}'
        )

        return Response({'auth_url': auth_url})

class GitHubCallbackView(APIView):
    def post(self, request):
        """Handle GitHub OAuth callback"""
        serializer = GitHubCallbackSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        code = serializer.validated_data['code']
        state = serializer.validated_data['state']

        # Verify state
        if state != request.session.get('github_oauth_state'):
            return Response(
                {'error': 'Invalid state parameter'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Exchange code for access token
        token_url = 'https://github.com/login/oauth/access_token'
        token_data = {
            'client_id': settings.GITHUB_CLIENT_ID,
            'client_secret': settings.GITHUB_CLIENT_SECRET,
            'code': code,
            'redirect_uri': settings.GITHUB_REDIRECT_URI
        }
        headers = {'Accept': 'application/json'}

        try:
            token_response = requests.post(token_url, data=token_data, headers=headers)
            token_response.raise_for_status()
            token_info = token_response.json()
        except requests.RequestException as e:
            return Response(
                {'error': f'Failed to get access token: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get user info from GitHub
        user_url = 'https://api.github.com/user'
        headers = {
            'Authorization': f"token {token_info['access_token']}",
            'Accept': 'application/json'
        }

        try:
            user_response = requests.get(user_url, headers=headers)
            user_response.raise_for_status()
            github_user = user_response.json()
        except requests.RequestException as e:
            return Response(
                {'error': f'Failed to get user info: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create or update user
        try:
            user = User.objects.get(email=github_user.get('email'))
        except User.DoesNotExist:
            # Create new user
            user = User.objects.create_user(
                username=github_user['login'],
                email=github_user.get('email'),
                password=User.objects.make_random_password()
            )
            user.is_email_verified = True
            user.save()

        # Create or update GitHub OAuth info
        github_oauth, created = GitHubOAuth.objects.update_or_create(
            user=user,
            defaults={
                'github_id': str(github_user['id']),
                'access_token': token_info['access_token'],
                'refresh_token': token_info.get('refresh_token'),
                'token_expires_at': None  # GitHub tokens don't expire
            }
        )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'github_connected': True
            }
        })
