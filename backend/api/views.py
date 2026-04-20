"""
API Views for Screen Recorder
Handles: auth (register/login), video upload, list, and delete
"""

from django.contrib.auth.models import User
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Video
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
    VideoUploadSerializer,
    VideoListSerializer,
)


class HomeView(APIView):
    """
    GET /
    Simple health check or welcome message.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({
            "status": "online",
            "message": "ScreenCast AI Backend is running.",
            "api_root": "/api/"
        })


# ─── Auth Views ───────────────────────────────────────────────────────────────

class RegisterView(APIView):
    """
    POST /api/auth/register/
    Create a new user account and return JWT tokens immediately.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Generate JWT tokens for the new user
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Account created successfully!'
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Accepts {username, password}, returns JWT access + refresh tokens.
    Inherits from SimpleJWT's built-in view.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            # Attach user info to the response
            try:
                user = User.objects.get(username=request.data.get('username'))
                response.data['user'] = UserSerializer(user).data
            except User.DoesNotExist:
                pass
        return response


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Blacklists the refresh token (client should discard access token).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    """
    GET /api/auth/me/
    Returns the currently authenticated user's profile.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

class UpdateProfileView(APIView):
    """
    PUT /api/auth/profile/
    Update the user's username or email.
    """
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        return self.put(request)

class ChangePasswordView(APIView):
    """
    POST /api/auth/password/
    Change the user's password.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.data.get("new_password"))
            user.save()
            return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# ─── Video Views ──────────────────────────────────────────────────────────────

class VideoUploadView(APIView):
    """
    POST /api/upload/
    Accepts multipart form data with a video file and optional metadata.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = VideoUploadSerializer(data=request.data)
        if serializer.is_valid():
            # Associate video with the authenticated user
            video = serializer.save(user=request.user)
            return Response({
                'message': 'Video uploaded successfully!',
                'video': VideoListSerializer(video, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VideoListView(generics.ListAPIView):
    """
    GET /api/videos/
    Returns a paginated list of the authenticated user's recordings.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = VideoListSerializer

    def get_queryset(self):
        # Users only see their own recordings
        return Video.objects.filter(user=self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}


class VideoDetailView(APIView):
    """
    GET  /api/videos/{id}/  — retrieve a single recording
    DELETE /api/videos/{id}/ — delete a recording
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Video.objects.get(pk=pk, user=user)
        except Video.DoesNotExist:
            return None

    def get(self, request, pk):
        video = self.get_object(pk, request.user)
        if not video:
            return Response({'error': 'Recording not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(VideoListSerializer(video, context={'request': request}).data)

    def delete(self, request, pk):
        video = self.get_object(pk, request.user)
        if not video:
            return Response({'error': 'Recording not found.'}, status=status.HTTP_404_NOT_FOUND)
        video.delete()
        return Response({'message': 'Recording deleted.'}, status=status.HTTP_204_NO_CONTENT)
