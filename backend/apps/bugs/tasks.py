from celery import shared_task
from django.utils import timezone
from apps.logs.models import Log
from .models import Bug
import random

@shared_task
def detect_bug_task(log_id):
    """Simulates bug detection based on a processed log and creates a Bug entry."""
    try:
        log = Log.objects.get(id=log_id)
        
        
        
        if random.random() < 0.7:  
            title_options = [
                "NullPointer Exception Detected",
                "Database Connection Timeout",
                "API Rate Limit Exceeded",
                "Memory Leak Suspected",
                "Unhandled Promise Rejection",
                "Authentication Failed Repeatedly",
                "Invalid Input Data",
            ]
            severity_options = {
                "NullPointer Exception Detected": "critical",
                "Database Connection Timeout": "high",
                "API Rate Limit Exceeded": "medium",
                "Memory Leak Suspected": "high",
                "Unhandled Promise Rejection": "medium",
                "Authentication Failed Repeatedly": "critical",
                "Invalid Input Data": "low",
            }
            
            detected_title = random.choice(title_options)
            detected_severity = severity_options.get(detected_title, "medium")
            
            # Use repository name in file path if available
            repo_prefix = log.repository.name if log.repository else "unknown"
            file_name = log.original_filename if log.original_filename else "app.log"
            if '.' in file_name and repo_prefix != "unknown":
                # Simulate a source file in the repo
                ext = file_name.split('.')[-1]
                mock_file = f"src/main.{ext}" if ext in ['py', 'js', 'ts'] else f"logs/{file_name}"
            else:
                mock_file = f"logs/{file_name}"

            bug = Bug.objects.create(
                user=log.user,
                log=log,
                repository=log.repository,
                title=detected_title,
                description=f"AI detected a potential bug in {repo_prefix} related to: {detected_title}",
                error_message=f"Error details from log {log.original_filename}: {log.content[:200]}...",
                stack_trace=f"Simulated stack trace for {repo_prefix}...\nLine {random.randint(10, 200)} in {mock_file}",
                file_path=mock_file,
                line_number=random.randint(1, 500),
                status='detected',
                severity=detected_severity,
                confidence_score=round(random.uniform(0.6, 0.99), 2),
                analysis_result={
                    'root_cause': f'Simulated AI root cause analysis for {detected_title}.',
                    'suggested_fix': f'Simulated AI suggested fix for {mock_file}.',
                    'impact': 'Simulated AI impact assessment.',
                    'bug_type': detected_title.lower().replace(' ', '_'),
                    'detail': f"Issue found in {mock_file}"
                }
            )
            print(f"Bug {bug.id} detected for log {log_id}. Repo: {repo_prefix}. Status: {bug.status}")
        else:
            log.status = 'analyzed' 
            log.save(update_fields=['status'])
            print(f"No bug detected for log {log_id}.")

    except Log.DoesNotExist:
        print(f"Log with ID {log_id} not found for bug detection.")
    except Exception as e:
        print(f"Error during bug detection for log {log_id}: {e}") 