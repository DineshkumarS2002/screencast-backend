from django.contrib import admin
from .models import Video


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'duration', 'file_size', 'created_at')
    list_filter = ('user', 'mime_type', 'created_at')
    search_fields = ('title', 'user__username')
    readonly_fields = ('file_size', 'created_at', 'updated_at')
    ordering = ('-created_at',)
