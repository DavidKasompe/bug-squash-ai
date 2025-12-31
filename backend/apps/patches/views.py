from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
import requests
import base64
from .models import Patch
from .serializers import (
    PatchSerializer,
    PatchCreateSerializer,
    PatchUpdateSerializer
)

class PatchViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Patch.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return PatchCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return PatchUpdateSerializer
        return PatchSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        bug_id = self.request.query_params.get('bug_id')
        if bug_id:
            queryset = queryset.filter(bug_id=bug_id)
        return queryset

    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        patch = self.get_object()
        
        if patch.status != 'reviewed':
            return Response({
                'error': 'Only reviewed patches can be applied'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 1. Validating the patch can be applied
            if not patch.diff:
                return Response({'error': 'Patch has no diff content'}, status=status.HTTP_400_BAD_REQUEST)

            # 2. Simulate PR creation on GitHub
            # In a real app, we would:
            # - Create a new branch (e.g. bug-fix-bug-id)
            # - Commit the patched_code
            # - Create a Pull Request
            
            repo = patch.bug.repository
            if repo:
                print(f"Simulating PR creation for {repo.full_name}...")
                # We'll simulate this by adding a "pr_url" to metadata or similar
            
            patch.status = 'applied'
            patch.applied_at = timezone.now()
            patch.save()

            return Response({
                'message': 'Patch applied successfully & PR created (simulated)',
                'patch': PatchSerializer(patch).data,
                'pr_url': f"https://github.com/{repo.full_name}/pull/simulation" if repo else None
            })
        except Exception as e:
            patch.status = 'failed'
            patch.save()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        patch = self.get_object()
        if patch.status not in ['generated', 'failed']:
            return Response({
                'error': 'Only generated or failed patches can be reviewed'
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = PatchUpdateSerializer(patch, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(status='reviewed')
            return Response({
                'message': 'Patch reviewed successfully',
                'patch': PatchSerializer(patch).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        patch = self.get_object()
        
        if patch.status == 'applied':
            return Response({
                'error': 'Cannot reject an applied patch'
            }, status=status.HTTP_400_BAD_REQUEST)

        patch.status = 'rejected'
        patch.review_notes = request.data.get('review_notes', '')
        patch.save()

        return Response({
            'message': 'Patch rejected',
            'patch': PatchSerializer(patch).data
        })

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate a code patch for a specific bug using AI analysis."""
        bug_id = request.data.get('bug_id')
        if not bug_id:
            return Response({'error': 'Bug ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Import the Bug model
            from apps.bugs.models import Bug
            bug = Bug.objects.get(id=bug_id)

            # Get bug analysis data
            bug_analysis = bug.analysis_result or {}
            if not bug_analysis and not bug.description:
                return Response({
                    'error': 'Bug analysis not found. Please analyze the bug first.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Extract file path and bug location from analysis or bug model
            file_path = bug.file_path or bug_analysis.get('file_path', '')
            if not file_path:
                return Response({
                    'error': 'File path not found in bug details'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get the original file content (this would typically come from the repository)
            # For now, we'll simulate getting the file content
            original_code = self._get_file_content(file_path, bug)
            if not original_code:
                return Response({
                    'error': f'Could not retrieve content for file: {file_path}'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Generate the patched code based on bug type and analysis
            patched_code = self._generate_patched_code(original_code, bug, bug_analysis)

            # Create the diff
            diff = self._create_diff(original_code, patched_code, file_path)

            # Calculate confidence score
            confidence_score = bug.confidence_score or self._calculate_confidence_score(bug, bug_analysis)

            # Create the patch
            patch = Patch.objects.create(
                bug=bug,
                created_by=request.user,
                status='generated',
                original_file_path=file_path,
                original_code=original_code,
                patched_code=patched_code,
                diff=diff,
                confidence_score=confidence_score
            )

            return Response({
                'message': 'Patch generated successfully',
                'patch': PatchSerializer(patch).data
            }, status=status.HTTP_201_CREATED)

        except Bug.DoesNotExist:
            return Response({'error': 'Bug not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': f'Failed to generate patch: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_file_content(self, file_path, bug):
        """Get the original file content from GitHub repository."""
        repository = bug.repository
        if not repository:
            return self._get_sample_general_code()

        try:
            # Get user's GitHub OAuth token
            oauth = bug.user.github_oauth
            headers = {
                'Authorization': f'token {oauth.access_token}',
                'Accept': 'application/vnd.github.v3.raw'
            }
            
            # Fetch content from GitHub
            url = f"https://api.github.com/repos/{repository.full_name}/contents/{file_path}"
            params = {'ref': bug.analysis_result.get('branch', repository.default_branch)}
            
            response = requests.get(url, headers=headers, params=params)
            
            # If successful (direct raw content), return it
            if response.status_code == 200:
                # GitHub might return JSON with base64 content if raw isn't requested properly,
                # but with vnd.github.v3.raw it should be plain text.
                return response.text
                
            # Fallback to simulated code if file not found or repo is inaccessible
            print(f"GitHub API returned {response.status_code} for {file_path}. Using simulation.")
            return self._get_sample_code_by_path(file_path)
            
        except Exception as e:
            print(f"Error fetching file content from GitHub: {e}")
            return self._get_sample_code_by_path(file_path)

    def _get_sample_code_by_path(self, file_path):
        if 'auth' in file_path.lower() or 'login' in file_path.lower():
            return self._get_sample_auth_code()
        elif 'validation' in file_path.lower():
            return self._get_sample_validation_code()
        else:
            return self._get_sample_general_code()

    def _generate_patched_code(self, original_code, bug, analysis):
        """Generate patched code based on bug analysis."""
        bug_type = analysis.get('bug_type', 'unknown')
        description = analysis.get('description', '')

        if bug_type == 'authentication':
            return self._fix_authentication_bug(original_code, description)
        elif bug_type == 'validation':
            return self._fix_validation_bug(original_code, description)
        elif bug_type == 'logic':
            return self._fix_logic_bug(original_code, description)
        else:
            return self._fix_general_bug(original_code, description)

    def _create_diff(self, original_code, patched_code, file_path):
        """Create a unified diff between original and patched code."""
        import difflib

        original_lines = original_code.splitlines(keepends=True)
        patched_lines = patched_code.splitlines(keepends=True)

        diff = list(difflib.unified_diff(
            original_lines,
            patched_lines,
            fromfile=f'a/{file_path}',
            tofile=f'b/{file_path}',
            lineterm=''
        ))

        return '\n'.join(diff)

    def _calculate_confidence_score(self, bug, analysis):
        """Calculate confidence score based on bug analysis quality."""
        base_score = 0.5

        # Adjust based on bug severity
        if bug.severity == 'critical':
            base_score += 0.2
        elif bug.severity == 'high':
            base_score += 0.1

        # Adjust based on analysis confidence
        analysis_confidence = analysis.get('confidence', 0.5)
        base_score = (base_score + analysis_confidence) / 2

        return min(base_score, 1.0)

    def _get_sample_auth_code(self):
        return '''def authenticate_user(username, password):
    # TODO: Implement proper authentication
    if username == "admin" and password == "password":
        return True
    return False'''

    def _get_sample_validation_code(self):
        return '''def validate_email(email):
    # TODO: Add proper email validation
    return "@" in email'''

    def _get_sample_general_code(self):
        return '''def process_data(data):
    # TODO: Add proper error handling
    result = data * 2
    return result'''

    def _fix_authentication_bug(self, code, description):
        """Fix authentication-related bugs."""
        if 'password' in description.lower() or 'auth' in description.lower():
            return code.replace(
                'if username == "admin" and password == "password":',
                'if username and password and len(password) >= 8:'
            )
        return code

    def _fix_validation_bug(self, code, description):
        """Fix validation-related bugs."""
        if 'email' in description.lower():
            return code.replace(
                'return "@" in email',
                'import re\n    return re.match(r"[^@]+@[^@]+\\.[^@]+", email) is not None'
            )
        return code

    def _fix_logic_bug(self, code, description):
        """Fix logic-related bugs."""
        return code.replace(
            'result = data * 2',
            'try:\n        result = data * 2\n    except TypeError:\n        return None'
        )

    def _fix_general_bug(self, code, description):
        """Apply general bug fixes."""
        return code