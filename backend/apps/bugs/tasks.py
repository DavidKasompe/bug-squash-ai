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
            
            bug = Bug.objects.create(
                user=log.user,
                log=log,
                title=detected_title,
                description=f"AI detected a potential bug related to: {detected_title}",
                error_message=f"Error details from log {log.original_filename}: {log.content[:200]}...",
                stack_trace="Simulated stack trace...\nLine 100 in file.py\nLine 50 in module.js",
                file_path=f"/app/src/{log.original_filename}" if log.original_filename else "unknown/path",
                line_number=random.randint(1, 500),
                status='detected',
                severity=detected_severity,
                confidence_score=round(random.uniform(0.6, 0.99), 2),
                analysis_result={
                    'root_cause': 'Simulated AI root cause analysis.',
                    'suggested_fix': 'Simulated AI suggested fix.',
                    'impact': 'Simulated AI impact assessment.'
                }
            )
            print(f"Bug {bug.id} detected for log {log_id}. Status: {bug.status}")
        else:
            log.status = 'analyzed' 
            log.save(update_fields=['status'])
            print(f"No bug detected for log {log_id}.")

    except Log.DoesNotExist:
        print(f"Log with ID {log_id} not found for bug detection.")
    except Exception as e:
        print(f"Error during bug detection for log {log_id}: {e}") 