from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Log
from .serializers import LogSerializer, LogUploadSerializer
from .tasks import analyze_log_task 

class LogViewSet(viewsets.ModelViewSet):
    """ViewSet for handling log operations."""
    
    serializer_class = LogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return logs for the current user."""
        return Log.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """Handle log file upload or content submission."""
        serializer = LogUploadSerializer(data=request.data)
        if serializer.is_valid():
            
            log_data = {
                'user': request.user,
                'status': 'pending' 
            }
            
            if 'file' in serializer.validated_data:
                log_data['file'] = serializer.validated_data['file']
            if 'content' in serializer.validated_data:
                log_data['content'] = serializer.validated_data['content']
            if 'repository' in serializer.validated_data:
                log_data['repository'] = serializer.validated_data['repository']

            log = Log.objects.create(**log_data)
            
            
            analyze_log_task.delay(str(log.id)) 

            return Response(
                LogSerializer(log).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def content(self, request, pk=None):
        """Retrieve the content of a log file."""
        log = self.get_object()
        return Response({'content': log.content})

    @action(detail=True, methods=['post'])
    def retry_analysis(self, request, pk=None):
        """Retry analysis of a failed log."""
        log = self.get_object()
        if log.status == 'failed':
            log.status = 'pending'
            log.error_message = ''
            log.save(update_fields=['status', 'error_message'])
            
            
            analyze_log_task.delay(str(log.id)) 
            return Response(LogSerializer(log).data)
        return Response(
            {'error': 'Can only retry failed logs'},
            status=status.HTTP_400_BAD_REQUEST
        ) 