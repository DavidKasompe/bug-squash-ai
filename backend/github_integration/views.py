import requests
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from . import models
from apps.users.models import GitHubOAuth
from .serializers import (
    GitHubAppSerializer,
    GitHubRepositorySerializer,
    GitHubRepositoryCreateSerializer,
    GitHubWebhookSerializer,
    RepositoryAnalysisSerializer
)
from .tasks import analyze_repository_task

class GitHubAppViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = GitHubAppSerializer
    queryset = models.GitHubApp.objects.all()

    def get_queryset(self):
        return models.GitHubApp.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class GitHubRepositoryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = GitHubRepositorySerializer
    queryset = models.GitHubRepository.objects.all()

    def get_queryset(self):
        return models.GitHubRepository.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return GitHubRepositoryCreateSerializer
        return GitHubRepositorySerializer

    @action(detail=True, methods=['post'])
    def sync(self, request, pk=None):
        """Sync repository data from GitHub."""
        repository = self.get_object()

        try:
            github_oauth = GitHubOAuth.objects.get(user=request.user)
            access_token = github_oauth.access_token
            url = f'https://api.github.com/repos/{repository.full_name}'
            headers = {
                'Authorization': f'token {access_token}',
                'Accept': 'application/json'
            }

            response = requests.get(url, headers=headers)
            response.raise_for_status()
            repo_data = response.json()

            # Update repository details
            repository.name = repo_data['name']
            repository.full_name = repo_data['full_name']
            repository.description = repo_data.get('description', '') or ''
            repository.private = repo_data.get('private', False)
            repository.default_branch = repo_data.get('default_branch', 'main')
            
            from django.utils import timezone
            repository.last_synced_at = timezone.now()
            repository.status = 'active'
            repository.save()

            return Response({
                'message': 'Repository synced successfully',
                'repository': self.get_serializer(repository).data
            })
        except Exception as e:
            repository.status = 'error'
            repository.sync_error = str(e)
            repository.save()
            return Response({
                'error': f'Failed to sync repository: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def analyze(self, request, pk=None):
        """Trigger analysis of the repository."""
        repository = self.get_object()
        serializer = RepositoryAnalysisSerializer(data=request.data, context={'request': request})

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Trigger the analysis task
        analyze_repository_task.delay(str(repository.id), branch=serializer.validated_data.get('branches', [None])[0])

        return Response({
            'message': 'Repository analysis started',
            'repository_id': str(repository.id)
        }, status=status.HTTP_202_ACCEPTED)

    @action(detail=True, methods=['get'])
    def branches(self, request, pk=None):
        """Get available branches for the repository."""
        repository = self.get_object()

        try:
            github_oauth = GitHubOAuth.objects.get(user=request.user)
            access_token = github_oauth.access_token
            url = f'https://api.github.com/repos/{repository.full_name}/branches'
            headers = {
                'Authorization': f'token {access_token}',
                'Accept': 'application/json'
            }

            response = requests.get(url, headers=headers)
            response.raise_for_status()
            branches_data = response.json()

            branches = []
            for b in branches_data:
                branches.append({
                    'name': b['name'],
                    'protected': b.get('protected', False)
                })

            return Response({
                'branches': branches,
                'default_branch': repository.default_branch
            })
        except Exception as e:
            return Response({
                'error': f'Failed to fetch branches: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


class GitHubWebhookViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = GitHubWebhookSerializer
    queryset = models.GitHubWebhook.objects.all()

    def get_queryset(self):
        return models.GitHubWebhook.objects.filter(user=self.request.user)


class GitHubStatusView(APIView):
    """APIView for checking GitHub connection status."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'connected': request.user.github_connected,
            'username': request.user.github_username
        })


class GitHubIntegrationView(APIView):
    """APIView for GitHub integration operations."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get user's GitHub repositories that can be connected."""
        try:
            github_oauth = GitHubOAuth.objects.get(user=request.user)
        except GitHubOAuth.DoesNotExist:
            return Response({'error': 'GitHub account not connected'}, status=status.HTTP_400_BAD_REQUEST)

        access_token = github_oauth.access_token
        url = 'https://api.github.com/user/repos'
        headers = {
            'Authorization': f'token {access_token}',
            'Accept': 'application/json'
        }
        params = {
            'sort': 'updated',
            'per_page': 100
        }

        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            repos = response.json()

            formatted_repos = []
            for repo in repos:
                formatted_repos.append({
                    'id': repo['id'],
                    'name': repo['name'],
                    'full_name': repo['full_name'],
                    'description': repo.get('description'),
                    'private': repo.get('private', False),
                    'html_url': repo['html_url'],
                    'default_branch': repo.get('default_branch', 'main'),
                    'permissions': repo.get('permissions', {})
                })

            return Response({'repositories': formatted_repos})
        except Exception as e:
            return Response({'error': f'Failed to fetch repositories from GitHub: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        """Connect a GitHub repository to Aizora."""
        import logging
        logger = logging.getLogger(__name__)
        repository_id = request.data.get('repository_id')
        logger.info(f"Connecting repository: user={request.user.username}, repository_id={repository_id}")
        
        if not repository_id:
            logger.warning("Repository ID is missing in request data")
            return Response({'error': 'Repository ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            github_oauth = GitHubOAuth.objects.get(user=request.user)
        except GitHubOAuth.DoesNotExist:
            return Response({'error': 'GitHub account not connected'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if already connected
        if models.GitHubRepository.objects.filter(github_id=repository_id, user=request.user).exists():
            return Response({'message': 'Repository already connected', 'repository_id': repository_id})

        # Fetch repo details from GitHub
        access_token = github_oauth.access_token
        url = f'https://api.github.com/repositories/{repository_id}'
        headers = {
            'Authorization': f'token {access_token}',
            'Accept': 'application/json'
        }

        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            repo_data = response.json()

            # Create GitHubRepository
            repository = models.GitHubRepository.objects.create(
                user=request.user,
                github_id=repo_data['id'],
                name=repo_data['name'],
                full_name=repo_data['full_name'],
                description=repo_data.get('description', '') or '',
                private=repo_data.get('private', False),
                fork=repo_data.get('fork', False),
                html_url=repo_data['html_url'],
                clone_url=repo_data['clone_url'],
                ssh_url=repo_data['ssh_url'],
                default_branch=repo_data.get('default_branch', 'main'),
                status='active'
            )

            # TODO: Setup webhook if needed

            return Response({
                'message': 'Repository connected successfully',
                'repository_id': repository.id,
                'full_name': repository.full_name
            })
        except Exception as e:
            return Response({'error': f'Failed to connect repository: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


class GitHubOAuthCallbackView(APIView):
    """APIView for handling GitHub OAuth callback."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Handle GitHub OAuth callback."""
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Received GitHub OAuth callback: data={request.data}")
        
        code = request.data.get('code')
        state = request.data.get('state')

        if not code:
            return Response({'error': 'Authorization code is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Exchange code for access token
        token_url = 'https://github.com/login/oauth/access_token'
        payload = {
            'client_id': settings.GITHUB_CLIENT_ID,
            'client_secret': settings.GITHUB_CLIENT_SECRET,
            'code': code,
            'redirect_uri': settings.GITHUB_REDIRECT_URI,
        }
        headers = {'Accept': 'application/json'}

        try:
            response = requests.post(token_url, data=payload, headers=headers)
            response.raise_for_status()
            token_data = response.json()
        except Exception as e:
            return Response({'error': f'Failed to exchange code for token: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        if 'error' in token_data:
            return Response({'error': token_data.get('error_description', 'OAuth exchange failed')}, status=status.HTTP_400_BAD_REQUEST)

        access_token = token_data.get('access_token')

        # Get GitHub user info
        user_url = 'https://api.github.com/user'
        user_headers = {
            'Authorization': f'token {access_token}',
            'Accept': 'application/json'
        }

        try:
            user_response = requests.get(user_url, headers=user_headers)
            user_response.raise_for_status()
            github_user = user_response.json()
        except Exception as e:
            return Response({'error': f'Failed to fetch user info from GitHub: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        # Link GitHub to current user or create new
        user = request.user
        if not user.is_authenticated:
            # If not logged in, we might need to find user by email or handle differently.
            # For this project, we assume the user is already logged in to "Connect GitHub".
            return Response({'error': 'User must be authenticated to connect GitHub account'}, status=status.HTTP_401_UNAUTHORIZED)

        # Update or create GitHubOAuth record
        GitHubOAuth.objects.update_or_create(
            user=user,
            defaults={
                'github_id': str(github_user['id']),
                'access_token': access_token,
                'refresh_token': token_data.get('refresh_token'),
            }
        )

        user.github_connected = True
        user.github_username = github_user.get('login')
        user.save()

        return Response({
            'message': 'GitHub account connected successfully',
            'username': github_user.get('login')
        })


class GitHubInstallationsView(APIView):
    """APIView for getting GitHub App installations."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get GitHub App installations for the user."""
        # TODO: Implement GitHub API call to get app installations

        return Response({
            'installations': [
                {
                    'id': 12345,
                    'app_id': 67890,
                    'target_id': request.user.id,
                    'target_type': 'User',
                    'permissions': {'contents': 'read', 'metadata': 'read'},
                    'events': ['push', 'pull_request']
                }
            ]
        })
