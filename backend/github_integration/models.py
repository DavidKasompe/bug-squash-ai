from django.db import models
from django.conf import settings
import uuid

class GitHubApp(models.Model):
    """Model for storing GitHub app installation information."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    installation_id = models.BigIntegerField(unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='github_apps')

    # GitHub App details
    app_id = models.BigIntegerField()
    target_id = models.BigIntegerField()  # User or organization ID
    target_type = models.CharField(max_length=20)  # 'User' or 'Organization'

    # Permissions and events
    permissions = models.JSONField(default=dict)
    events = models.JSONField(default=list)

    # Status
    is_active = models.BooleanField(default=True)
    suspended_at = models.DateTimeField(null=True, blank=True)
    suspended_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='suspended_github_apps'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'GitHub App'
        verbose_name_plural = 'GitHub Apps'

    def __str__(self):
        return f"{self.name} ({self.user.username})"


class GitHubRepository(models.Model):
    """Model for storing connected GitHub repositories."""

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('syncing', 'Syncing'),
        ('error', 'Error'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    github_app = models.ForeignKey(GitHubApp, on_delete=models.CASCADE, related_name='repositories', null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='github_repositories')

    # Repository details
    github_id = models.BigIntegerField(unique=True)
    name = models.CharField(max_length=255)
    full_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    private = models.BooleanField(default=False)
    fork = models.BooleanField(default=False)

    # Repository URLs
    html_url = models.URLField()
    clone_url = models.URLField()
    ssh_url = models.URLField()

    # Branch information
    default_branch = models.CharField(max_length=255, default='main')

    # Sync status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    last_synced_at = models.DateTimeField(null=True, blank=True)
    sync_error = models.TextField(blank=True)

    # Analysis settings
    auto_analyze = models.BooleanField(default=True)
    analyze_branches = models.JSONField(default=list)  # List of branch names to analyze
    analyze_paths = models.JSONField(default=list)     # List of file paths to analyze

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'GitHub Repository'
        verbose_name_plural = 'GitHub Repositories'
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['github_app', 'status']),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.user.username})"

    def get_branches_to_analyze(self):
        """Get list of branches to analyze."""
        if not self.analyze_branches:
            return [self.default_branch]
        return self.analyze_branches


class GitHubWebhook(models.Model):
    """Model for storing GitHub webhook configurations."""

    EVENT_CHOICES = [
        ('push', 'Push'),
        ('pull_request', 'Pull Request'),
        ('issues', 'Issues'),
        ('release', 'Release'),
        ('workflow_run', 'Workflow Run'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    repository = models.ForeignKey(GitHubRepository, on_delete=models.CASCADE, related_name='webhooks')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='github_webhooks')

    # Webhook details
    github_id = models.BigIntegerField(unique=True)
    name = models.CharField(max_length=255)
    url = models.URLField()
    secret = models.CharField(max_length=255)  # Webhook secret for verification

    # Events to listen for
    events = models.JSONField(default=list)  # List of event types

    # Status
    is_active = models.BooleanField(default=True)
    last_delivery_at = models.DateTimeField(null=True, blank=True)
    last_error = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'GitHub Webhook'
        verbose_name_plural = 'GitHub Webhooks'

    def __str__(self):
        return f"{self.name} ({self.repository.full_name})"
