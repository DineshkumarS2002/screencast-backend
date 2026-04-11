"""
API Serializers — converts Django model instances to/from JSON.
"""

from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Video


# ─── Auth Serializers ─────────────────────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration. Hashes password before saving."""

    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True, label='Confirm password')

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    """Minimal user info returned in responses."""
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class UserUpdateSerializer(serializers.ModelSerializer):
    """Used for updating profile info (username/email). Supports 'name' alias and auto-clenaup."""
    name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'name')

    def validate_username(self, value):
        # Automatically clean up the username: trim and replace spaces with underscores
        return value.strip().replace(' ', '_')

    def validate(self, attrs):
        # If 'name' is provided, map it to 'username'
        if 'name' in attrs:
            attrs['username'] = self.validate_username(attrs.pop('name'))
        return attrs

class ChangePasswordSerializer(serializers.Serializer):
    """Used for password change requests."""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)
    confirm_password = serializers.CharField(required=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "New passwords do not match."})
        return data



# ─── Video Serializers ────────────────────────────────────────────────────────

class VideoUploadSerializer(serializers.ModelSerializer):
    """Used for uploading a new recording."""

    class Meta:
        model = Video
        fields = ('title', 'file', 'thumbnail', 'duration', 'mime_type')

    def validate_file(self, value):
        """Ensure only video files are accepted."""
        allowed_types = ['video/webm', 'video/mp4', 'video/quicktime', 'video/x-msvideo']
        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                f'Unsupported file type: {value.content_type}. '
                f'Allowed types: {", ".join(allowed_types)}'
            )
        # Limit: 500MB
        max_size = 500 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError('File too large. Maximum size is 500MB.')
        return value

    def create(self, validated_data):
        """Auto-calculate file size when saving."""
        file = validated_data.get('file')
        if file:
            validated_data['file_size'] = file.size
        return super().create(validated_data)


class VideoListSerializer(serializers.ModelSerializer):
    """Used for listing recordings — includes URL but not the raw file field."""

    file_url = serializers.SerializerMethodField()
    user = UserSerializer(read_only=True)

    class Meta:
        model = Video
        fields = (
            'id', 'user', 'title', 'file_url', 'thumbnail',
            'duration', 'file_size', 'mime_type',
            'created_at', 'updated_at'
        )

    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url  # Returns relative /media/... path
        return None
