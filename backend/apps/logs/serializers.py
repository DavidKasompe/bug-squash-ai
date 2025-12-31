from rest_framework import serializers
from .models import Log
from github_integration.models import GitHubRepository

class LogSerializer(serializers.ModelSerializer):
    """Serializer for the Log model."""
    
    class Meta:
        model = Log
        fields = [
            'id', 'file', 'original_filename', 'content',
            'status', 'repository', 'created_at', 'updated_at',
            'analyzed_at', 'error_message'
        ]
        read_only_fields = [
            'id', 'original_filename', 'status',
            'created_at', 'updated_at', 'analyzed_at',
            'error_message'
        ]

    def create(self, validated_data):
        """Create a new log entry."""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
        return super().create(validated_data)

class LogUploadSerializer(serializers.Serializer):
    """Serializer for handling log file uploads."""
    
    file = serializers.FileField(required=False)
    content = serializers.CharField(required=False, allow_blank=True)
    repository = serializers.PrimaryKeyRelatedField(
        queryset=GitHubRepository.objects.all(),
        required=False,
        allow_null=True
    )

    def validate(self, data):
        """Validate that either file or content is provided."""
        if not data.get('file') and not data.get('content'):
            raise serializers.ValidationError(
                "Either file or content must be provided."
            )
        return data 