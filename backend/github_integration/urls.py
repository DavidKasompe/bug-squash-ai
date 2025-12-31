from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GitHubAppViewSet,
    GitHubRepositoryViewSet,
    GitHubWebhookViewSet,
    GitHubIntegrationView,
    GitHubOAuthCallbackView,
    GitHubInstallationsView,
    GitHubStatusView
)

router = DefaultRouter()
router.register(r'apps', GitHubAppViewSet)
router.register(r'repositories', GitHubRepositoryViewSet)
router.register(r'webhooks', GitHubWebhookViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('integration/', GitHubIntegrationView.as_view()),
    path('integration/status/', GitHubStatusView.as_view()),
    path('integration/oauth-callback/', GitHubOAuthCallbackView.as_view()),
    path('integration/installations/', GitHubInstallationsView.as_view()),
]
