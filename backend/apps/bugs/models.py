from django.db import models
from django.conf import settings
import uuid

class Bug(models.Model):
    """Model for storing bug information and analysis results."""
    
    STATUS_CHOICES = [
        ('detected', 'Detected'),
        ('analyzing', 'Analyzing'),
        ('analyzed', 'Analyzed'),
        ('fixing', 'Fixing'),
        ('fixed', 'Fixed'),
        ('failed', 'Failed'),
    ]

    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    log = models.ForeignKey('logs.Log', on_delete=models.CASCADE, related_name='bugs')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bugs')
    
    # Bug Information
    title = models.CharField(max_length=255)
    description = models.TextField()
    error_message = models.TextField()
    stack_trace = models.TextField(blank=True)
    file_path = models.CharField(max_length=255, blank=True)
    line_number = models.IntegerField(null=True, blank=True)
    
    # Analysis Results
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='detected')
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='medium')
    confidence_score = models.FloatField(default=0.0)
    analysis_result = models.JSONField(default=dict)
    
    # Timestamps
    detected_at = models.DateTimeField(auto_now_add=True)
    analyzed_at = models.DateTimeField(null=True, blank=True)
    fixed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-detected_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['severity']),
            models.Index(fields=['detected_at']),
        ]

    def __str__(self):
        return f"{self.title} ({self.severity})"

    def save(self, *args, **kwargs):
        if self.status == 'analyzed' and not self.analyzed_at:
            from django.utils import timezone
            self.analyzed_at = timezone.now()
        elif self.status == 'fixed' and not self.fixed_at:
            from django.utils import timezone
            self.fixed_at = timezone.now()
        super().save(*args, **kwargs) 