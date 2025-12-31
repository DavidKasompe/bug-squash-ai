from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatchViewSet

router = DefaultRouter()
router.register(r'patches', PatchViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 