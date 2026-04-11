"""
API URL Routing
Maps HTTP endpoints to view classes.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    MeView,
    UpdateProfileView,
    ChangePasswordView,
    VideoUploadView,
    VideoListView,
    VideoDetailView,
)

urlpatterns = [
    # ─── Authentication ───────────────────────────────────────────────────────
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/',    LoginView.as_view(),    name='auth-login'),
    path('auth/logout/',   LogoutView.as_view(),   name='auth-logout'),
    path('auth/refresh/',  TokenRefreshView.as_view(), name='auth-refresh'),
    path('auth/me/',       MeView.as_view(),       name='auth-me'),
    path('auth/profile/',  UpdateProfileView.as_view(), name='auth-profile'),
    path('auth/password/', ChangePasswordView.as_view(), name='auth-password'),

    # ─── Videos ───────────────────────────────────────────────────────────────
    path('upload/',          VideoUploadView.as_view(), name='video-upload'),
    path('videos/',          VideoListView.as_view(),   name='video-list'),
    path('videos/<int:pk>/', VideoDetailView.as_view(), name='video-detail'),
]
