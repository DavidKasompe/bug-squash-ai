from celery import shared_task
from django.utils import timezone
from .models import Log
from apps.bugs.tasks import detect_bug_task

@shared_task
def analyze_log_task(log_id):
    """Simulates log analysis and updates the log status."""
    try:
        log = Log.objects.get(id=log_id)
        log.status = 'analyzing'
        log.save(update_fields=['status'])

        
        import time
        time.sleep(5)  

        log.status = 'analyzed'
        log.analyzed_at = timezone.now()
        log.save(update_fields=['status', 'analyzed_at'])
        print(f"Log {log_id} analyzed successfully. Now starting bug detection...")
        
        
        detect_bug_task.delay(str(log.id))

    except Log.DoesNotExist:
        print(f"Log with ID {log_id} not found.")
    except Exception as e:
        log = Log.objects.get(id=log_id)
        log.status = 'failed'
        log.error_message = str(e)
        log.save(update_fields=['status', 'error_message'])
        print(f"Failed to analyze log {log_id}: {e}") 