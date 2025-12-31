import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from apps.logs.models import Log
from apps.logs.serializers import LogUploadSerializer
from github_integration.models import GitHubRepository
from django.contrib.auth import get_user_model

User = get_user_model()

def test_log_creation():
    print("Starting diagnostic...")
    try:
        user = User.objects.first()
        if not user:
            print("No user found. Creating dummy user.")
            user = User.objects.create_user(username='debug_user', password='password')
        
        print(f"User: {user}")

        # Ensure we have a repo
        repo = GitHubRepository.objects.first()
        if not repo:
            print("No repository found. Creating dummy repo.")
            try:
                from github_integration.models import GitHubApp
                app = GitHubApp.objects.first() # Might be null
                repo = GitHubRepository.objects.create(
                    user=user,
                    github_id=12345,
                    name="debug-repo",
                    full_name="debug/debug-repo",
                    html_url="http://example.com",
                    clone_url="http://example.com",
                    ssh_url="git@example.com",
                    status='active'
                )
            except Exception as e:
                print(f"Failed to create repo: {e}")
                repo = None

        repo_id = repo.id if repo else None
        print(f"Repo ID: {repo_id}")

        # Test Serializer
        data = {
            'content': 'Test log content',
        }
        if repo_id:
            data['repository'] = str(repo_id)

        print("Validating serializer...")
        serializer = LogUploadSerializer(data=data)
        if serializer.is_valid():
            print("Serializer is valid.")
            print(f"Validated data: {serializer.validated_data}")
            
            # Simulate View logic
            log_data = {
                'user': user,
                'status': 'pending',
                'content': serializer.validated_data['content']
            }
            if 'repository' in serializer.validated_data:
                log_data['repository'] = serializer.validated_data['repository']
                
            print(f"Creating Log with data keys: {log_data.keys()}")
            
            try:
                log = Log.objects.create(**log_data)
                print(f"Log created successfully: {log.id}")
                
                # Verify relation
                print(f"Log repository: {log.repository}")
            except Exception as e:
                print(f"FATAL: Error creating log: {e}")
                import traceback
                traceback.print_exc()
        else:
            print(f"Serializer errors: {serializer.errors}")

    except Exception as e:
        print(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_log_creation()
