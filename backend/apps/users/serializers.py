from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from .tasks import send_verification_email_task, send_password_reset_email_task
from .models import GitHubOAuth

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=6,
        error_messages={
            'min_length': 'Password must be at least 6 characters long.',
            'blank': 'Password cannot be blank.',
        }
    )
    password_confirm = serializers.CharField(
        write_only=True,
        min_length=6,
        error_messages={
            'min_length': 'Password must be at least 6 characters long.',
            'blank': 'Password confirmation cannot be blank.',
        }
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
            'username': {
                'error_messages': {
                    'unique': 'This username is already taken. Please choose a different one.',
                    'blank': 'Username cannot be blank.',
                }
            },
            'email': {
                'error_messages': {
                    'invalid': 'Please enter a valid email address.',
                    'blank': 'Email cannot be blank.',
                }
            },
        }

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match. Please make sure both passwords are identical.'
            })
        
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({
                'email': 'This email address is already registered. Please use a different email or try logging in.'
            })
        
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({
                'username': 'This username is already taken. Please choose a different username.'
            })
        
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')  # Remove confirm password field
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            is_email_verified=False  # Set is_email_verified to False by default
        )

        # Generate token and send verification email
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        send_verification_email_task(str(user.pk), token)

        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(request=self.context.get('request'),
                                username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            
            # Check if email is verified
            if not user.is_email_verified:
                raise serializers.ValidationError('Email not verified. Please check your inbox.')

            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
        else:
            raise serializers.ValidationError('Must include "username" and "password".')

        data['user'] = user
        return data

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user found with this email address.")
        return value

class PasswordResetConfirmSerializer(serializers.Serializer):
    password = serializers.CharField(
        write_only=True,
        min_length=6,
        error_messages={
            'min_length': 'Password must be at least 6 characters long.',
            'blank': 'Password cannot be blank.',
        }
    )
    password_confirm = serializers.CharField(
        write_only=True,
        min_length=6,
        error_messages={
            'min_length': 'Password must be at least 6 characters long.',
            'blank': 'Password confirmation cannot be blank.',
        }
    )

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })
        return data

class GitHubOAuthSerializer(serializers.ModelSerializer):
    class Meta:
        model = GitHubOAuth
        fields = ['github_id', 'access_token', 'refresh_token', 'token_expires_at']
        read_only_fields = ['github_id', 'access_token', 'refresh_token', 'token_expires_at']

class GitHubCallbackSerializer(serializers.Serializer):
    code = serializers.CharField(required=True)
    state = serializers.CharField(required=True)

class GitHubUserSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    login = serializers.CharField()
    email = serializers.EmailField(allow_null=True)
    name = serializers.CharField(allow_null=True)
    avatar_url = serializers.URLField(allow_null=True) 