"""
Video Recording Models
Stores metadata for each user's uploaded screen recording.
"""

import os
from django.db import models
from django.contrib.auth.models import User


def video_upload_path(instance, filename):
    """Dynamic upload path: media/videos/<user_id>/<filename>"""
    return f'videos/{instance.user.id}/{filename}'


class Video(models.Model):
    """Represents a single screen recording uploaded by a user."""

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='videos',
        help_text='The user who owns this recording'
    )
    title = models.CharField(
        max_length=255,
        blank=True,
        default='Untitled Recording'
    )
    file = models.FileField(
        upload_to=video_upload_path,
        help_text='The actual video file (WebM or MP4)'
    )
    thumbnail = models.ImageField(
        upload_to='thumbnails/',
        blank=True,
        null=True,
        help_text='Optional video thumbnail'
    )
    duration = models.FloatField(
        default=0,
        help_text='Recording duration in seconds'
    )
    file_size = models.BigIntegerField(
        default=0,
        help_text='File size in bytes'
    )
    mime_type = models.CharField(
        max_length=100,
        default='video/webm',
        help_text='MIME type of the video file'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Video Recording'
        verbose_name_plural = 'Video Recordings'

    def __str__(self):
        return f'{self.user.username} - {self.title} ({self.created_at.date()})'

    def get_file_url(self):
        """Returns the full URL for the video file."""
        if self.file:
            return self.file.url
        return None

    def delete(self, *args, **kwargs):
        """
        Override delete to remove the file from storage.
        With remote storage (Cloudinary), we use the storage's delete method 
        instead of checking os.path.isfile.
        """
        if self.file:
            self.file.storage.delete(self.file.name)
        
        if self.thumbnail:
            self.thumbnail.storage.delete(self.thumbnail.name)

        super().delete(*args, **kwargs)
