from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.bugs.models import Bug
from apps.users.models import User

class Patch(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('generated', 'Generated'),
        ('reviewed', 'Reviewed'),
        ('applied', 'Applied'),
        ('failed', 'Failed'),
        ('rejected', 'Rejected'),
    ]

    bug = models.ForeignKey(Bug, on_delete=models.CASCADE, related_name='patches')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_patches')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Original code
    original_file_path = models.CharField(max_length=255)
    original_code = models.TextField()
    
    # Patched code
    patched_code = models.TextField()
    diff = models.TextField(help_text='Unified diff format of the changes')
    
    # Metadata
    confidence_score = models.FloatField(default=0.0)
    review_notes = models.TextField(blank=True)
    applied_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Patch')
        verbose_name_plural = _('Patches')
        ordering = ['-created_at']

    def __str__(self):
        return f"Patch for {self.bug.title} ({self.status})"

    def get_diff_stats(self):
        """Calculate statistics about the patch (lines added, removed, etc.)"""
        added_lines = sum(1 for line in self.diff.split('\n') if line.startswith('+') and not line.startswith('+++'))
        removed_lines = sum(1 for line in self.diff.split('\n') if line.startswith('-') and not line.startswith('---'))
        return {
            'added_lines': added_lines,
            'removed_lines': removed_lines,
            'total_changes': added_lines + removed_lines
        } 