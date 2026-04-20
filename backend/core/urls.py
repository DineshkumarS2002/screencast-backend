"""
URL Configuration for Screen Recorder API
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.urls import re_path
from api.views import HomeView

urlpatterns = [
    # API Routes
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    
    # Root: serve the frontend index.html
    path('', TemplateView.as_view(template_name='index.html'), name='index'),
    
    # Catch-all: redirect any other unrecognized routes to the frontend for SPA handling
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]

# Serve media files locally in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
