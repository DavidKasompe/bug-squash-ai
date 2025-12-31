from rest_framework import serializers
from .models import GitHubApp, GitHubRepository, GitHubWebhook

class GitHubAppSerializer(serializers.ModelSerializer):
    repositories_count = serializers.SerializerMethodField()

    class Meta:
        model = GitHubApp
        fields = [
            'id', 'name', 'installation_id', 'app_id', 'target_id', 'target_type',
            'permissions', 'events', 'is_active', 'created_at', 'repositories_count'
        ]
        read_only_fields = ['id', 'installation_id', 'app_id', 'target_id', 'target_type', 'created_at']

    def get_repositories_count(self, obj):
        return obj.repositories.count()


class GitHubRepositorySerializer(serializers.ModelSerializer):
    github_app_name = serializers.SerializerMethodField()
    can_analyze = serializers.SerializerMethodField()

    class Meta:
        model = GitHubRepository
        fields = [
            'id', 'github_id', 'name', 'full_name', 'description', 'private', 'fork',
            'html_url', 'clone_url', 'ssh_url', 'default_branch', 'status',
            'auto_analyze', 'analyze_branches', 'analyze_paths', 'github_app_name',
            'can_analyze', 'last_synced_at', 'created_at'
        ]
        read_only_fields = [
            'id', 'github_id', 'name', 'full_name', 'description', 'private',
            'fork', 'html_url', 'clone_url', 'ssh_url', 'created_at'
        ]

    def get_github_app_name(self, obj):
        return obj.github_app.name if obj.github_app else "OAuth Connection"

    def get_can_analyze(self, obj):
        if obj.status != 'active':
            return False
        if obj.github_app:
            return obj.github_app.is_active
        # For OAuth repositories, we assume they can be analyzed if status is active
        return True


class GitHubRepositoryCreateSerializer(serializers.ModelSerializer):
    installation_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = GitHubRepository
        fields = [
            'installation_id', 'github_id', 'name', 'full_name', 'description',
            'private', 'fork', 'html_url', 'clone_url', 'ssh_url', 'default_branch'
        ]

    def create(self, validated_data):
        installation_id = validated_data.pop('installation_id')
        github_app = GitHubApp.objects.get(installation_id=installation_id, user=self.context['request'].user)

        return GitHubRepository.objects.create(
            github_app=github_app,
            user=self.context['request'].user,
            **validated_data
        )


class GitHubWebhookSerializer(serializers.ModelSerializer):
    repository_name = serializers.CharField(source='repository.full_name', read_only=True)

    class Meta:
        model = GitHubWebhook
        fields = [
            'id', 'github_id', 'name', 'url', 'events', 'is_active',
            'repository_name', 'last_delivery_at', 'created_at'
        ]
        read_only_fields = ['id', 'github_id', 'created_at']


class RepositoryAnalysisSerializer(serializers.Serializer):
    repository_id = serializers.UUIDField()
    branches = serializers.ListField(child=serializers.CharField(), required=False)
    paths = serializers.ListField(child=serializers.CharField(), required=False)
    force_full_analysis = serializers.BooleanField(default=False)

    def validate_repository_id(self, value):
        try:
            repository = GitHubRepository.objects.get(id=value, user=self.context['request'].user)
            if repository.status != 'active':
                raise serializers.ValidationError("Repository is not active")
            return value
        except GitHubRepository.DoesNotExist:
            raise serializers.ValidationError("Repository not found")
