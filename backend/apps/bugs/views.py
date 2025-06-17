from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Bug
from .serializers import BugSerializer, BugAnalysisSerializer
from apps.logs.tasks import analyze_log_task as trigger_log_analysis 
from apps.logs.models import Log 

class BugViewSet(viewsets.ModelViewSet):
    """ViewSet for handling bug operations."""
    
    serializer_class = BugSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return bugs for the current user."""
        return Bug.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def analyze(self, request):
        """Trigger bug analysis for a given log ID."""
        serializer = BugAnalysisSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            log_id = serializer.validated_data['log_id']
            
            try:
                log = Log.objects.get(id=log_id, user=request.user)
            except Log.DoesNotExist:
                return Response(
                    {'error': 'Log not found or access denied.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            
            trigger_log_analysis.delay(str(log_id))

            return Response(
                {'message': 'Bug analysis initiated for log.', 'log_id': str(log_id)},
                status=status.HTTP_202_ACCEPTED # 202 Accepted, as processing is async
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def retry_analysis(self, request, pk=None):
        """Retry analysis of a bug."""
        bug = self.get_object()
        if bug.status in ['failed', 'detected']:
            bug.status = 'analyzing'
            bug.save(update_fields=['status'])
            
            
            if bug.log:
                trigger_log_analysis.delay(str(bug.log.id))
                return Response(BugSerializer(bug).data)
            else:
                return Response(
                    {'error': 'Associated log not found for retry.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(
            {'error': 'Can only retry failed or detected bugs'},
            status=status.HTTP_400_BAD_REQUEST
        ) 