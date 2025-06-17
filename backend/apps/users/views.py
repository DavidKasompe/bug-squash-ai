from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserRegistrationSerializer, LoginSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import boto3
from botocore.exceptions import ClientError
from django.conf import settings

logger = logging.getLogger(__name__)
User = get_user_model()

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
            user.email_verified = True
            user.save()
            return Response({'message': 'Email successfully verified.'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Invalid verification link.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_aws_credentials(request):
    """
    Test endpoint to verify AWS credentials
    """
    try:
        # Create an S3 client
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        
        # Try to list buckets (this will verify credentials)
        response = s3_client.list_buckets()
        
        return Response({
            'status': 'success',
            'message': 'AWS credentials are valid',
            'buckets': [bucket['Name'] for bucket in response['Buckets']]
        })
    except ClientError as e:
        return Response({
            'status': 'error',
            'message': f'AWS credentials are invalid: {str(e)}'
        }, status=400)
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'An error occurred: {str(e)}'
        }, status=500)
