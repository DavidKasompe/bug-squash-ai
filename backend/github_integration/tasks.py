from celery import shared_task
from django.utils import timezone
from .models import GitHubRepository
from apps.bugs.models import Bug
import random
import requests

@shared_task
def analyze_repository_task(repository_id, branch=None):
    """Asynchronously analyze a GitHub repository for bugs."""
    try:
        repository = GitHubRepository.objects.get(id=repository_id)
        repository.status = 'syncing' # Re-using syncing status for analysis
        repository.save(update_fields=['status'])

        # Simulate analysis time
        import time
        time.sleep(3)

        # In a real scenario, we would use repository.github_oauth.access_token 
        # to fetch code and send it to an AI model.
        
        # Simulate AI detecting bugs
        if random.random() < 0.8:
            bugs_to_create = random.randint(1, 3)
            for i in range(bugs_to_create):
                title_options = [
                    "Security Vulnerability: SQL Injection",
                    "Hardcoded Credentials Found",
                    "Infinite Loop in Logic",
                    "Unoptimized Database Query",
                    "Race Condition in Async Task",
                    "Missing Error Handling in API",
                ]
                severity_options = {
                    "Security Vulnerability: SQL Injection": "critical",
                    "Hardcoded Credentials Found": "critical",
                    "Infinite Loop in Logic": "high",
                    "Unoptimized Database Query": "medium",
                    "Race Condition in Async Task": "high",
                    "Missing Error Handling in API": "low",
                }
                
                title = random.choice(title_options)
                bug_type = title.split(':')[-1].strip().lower().replace(' ', '_')
                
                Bug.objects.create(
                    user=repository.user,
                    repository=repository,
                    title=title,
                    description=f"AI detected a {title} while analyzing branch {branch or repository.default_branch}.",
                    error_message=f"Static analysis of {repository.full_name} indicates a potential {title}.",
                    stack_trace="Analysis context: ...",
                    file_path=f"src/{random.choice(['utils', 'api', 'models', 'views'])}.py",
                    line_number=random.randint(1, 1000),
                    status='detected',
                    severity=severity_options.get(title, "medium"),
                    confidence_score=round(random.uniform(0.7, 0.95), 2),
                    analysis_result={
                        'type': 'repository_analysis',
                        'bug_type': bug_type,
                        'branch': branch or repository.default_branch,
                        'file_tree_hash': 'mock-hash',
                        'detail': f"The pattern matching detected {title} in the specified file path."
                    }
                )

        repository.status = 'active'
        repository.last_synced_at = timezone.now()
        repository.save(update_fields=['status', 'last_synced_at'])
        print(f"Repository {repository_id} analyzed successfully.")

    except GitHubRepository.DoesNotExist:
        print(f"Repository {repository_id} not found.")
    except Exception as e:
        print(f"Error during repository analysis {repository_id}: {e}")
        if 'repository' in locals():
            repository.status = 'error'
            repository.sync_error = str(e)
            repository.save(update_fields=['status', 'sync_error'])
