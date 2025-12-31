from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Patch(models.Model):
    """Model representing a code patch generated to fix a bug."""

    STATUS_CHOICES = [
        ('generated', 'Generated'),
        ('applied', 'Applied'),
        ('failed', 'Failed'),
        ('pending', 'Pending Review'),
        ('rejected', 'Rejected'),
    ]

    # Relationships
    bug = models.ForeignKey(
        'bugs.Bug',
        on_delete=models.CASCADE,
        related_name='patches',
        help_text="The bug this patch addresses"
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="User who generated this patch"
    )
    applied_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='applied_patches',
        help_text="User who applied this patch"
    )

    # Patch content
    title = models.CharField(
        max_length=255,
        help_text="Brief description of the patch"
    )
    patch_content = models.TextField(
        help_text="The actual patch content in unified diff format"
    )
    file_path = models.CharField(
        max_length=500,
        help_text="Path to the file being patched"
    )
    line_start = models.IntegerField(
        help_text="Starting line number of the patch"
    )
    line_end = models.IntegerField(
        help_text="Ending line number of the patch"
    )

    # Metadata
    confidence_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="AI confidence score for this patch (0.00-1.00)"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='generated',
        help_text="Current status of the patch"
    )
    error_message = models.TextField(
        blank=True,
        null=True,
        help_text="Error message if patch application failed"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    applied_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the patch was applied"
    )

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['bug', 'status']),
            models.Index(fields=['created_by', 'status']),
            models.Index(fields=['file_path']),
        ]

    def __str__(self):
        return f"Patch: {self.title} ({self.status})"

    def apply_patch(self, user):
        """Mark the patch as applied by a user."""
        self.status = 'applied'
        self.applied_by = user
        self.applied_at = models.functions.Now()
        self.save()

    def mark_failed(self, error_message):
        """Mark the patch as failed with an error message."""
        self.status = 'failed'
        self.error_message = error_message
        self.save()
