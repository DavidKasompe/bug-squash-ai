from rest_framework import serializers
from .models import Patch

class PatchSerializer(serializers.ModelSerializer):
    diff_stats = serializers.SerializerMethodField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    bug_title = serializers.CharField(source='bug.title', read_only=True)

    class Meta:
        model = Patch
        fields = [
            'id', 'bug', 'bug_title', 'created_by', 'created_by_username',
            'status', 'original_file_path', 'original_code', 'patched_code',
            'diff', 'confidence_score', 'review_notes', 'applied_at',
            'created_at', 'updated_at', 'diff_stats'
        ]
        read_only_fields = [
            'created_by', 'status', 'confidence_score', 'applied_at',
            'created_at', 'updated_at'
        ]

    def get_diff_stats(self, obj):
        return obj.get_diff_stats()

class PatchCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patch
        fields = [
            'bug', 'original_file_path', 'original_code',
            'patched_code', 'diff'
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        return super().create(validated_data)

class PatchUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patch
        fields = ['status', 'review_notes']

    def validate_status(self, value):
        instance = self.instance
        if instance.status == 'applied' and value != 'applied':
            raise serializers.ValidationError("Cannot change status of an applied patch")
        return value 