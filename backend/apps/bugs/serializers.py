from rest_framework import serializers
from .models import Bug

class BugSerializer(serializers.ModelSerializer):
    """Serializer for the Bug model."""
    
    class Meta:
        model = Bug
        fields = [
            'id', 'log', 'title', 'description', 'error_message',
            'stack_trace', 'file_path', 'line_number', 'status',
            'severity', 'confidence_score', 'analysis_result',
            'detected_at', 'analyzed_at', 'fixed_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'status', 'confidence_score',
            'detected_at', 'analyzed_at', 'fixed_at', 'updated_at'
        ]

    def create(self, validated_data):
        """Create a new bug entry."""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
        return super().create(validated_data)

class BugAnalysisSerializer(serializers.Serializer):
    """Serializer for bug analysis requests."""
    
    log_id = serializers.UUIDField()
    error_message = serializers.CharField()
    stack_trace = serializers.CharField(required=False, allow_blank=True)
    file_path = serializers.CharField(required=False, allow_blank=True)
    line_number = serializers.IntegerField(required=False, allow_null=True)

    def validate_log_id(self, value):
        """Validate that the log exists and belongs to the user."""
        request = self.context.get('request')
        if not request or not hasattr(request, 'user'):
            raise serializers.ValidationError("User context is required")
        
        try:
            log = request.user.logs.get(id=value)
            return value
        except:
            raise serializers.ValidationError("Log not found or access denied") 